import fetch from "node-fetch";

export const handler = async function (event, context) {
  const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID;
  const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET;
  const REDIRECT_URI = process.env.REDIRECT_URI;

  // Helper function to parse cookies
  function parseCookies(cookieString) {
    const cookies = {};
    cookieString.split(";").forEach((cookie) => {
      const [name, ...rest] = cookie.split("=");
      cookies[name.trim()] = rest.join("=").trim();
    });
    return cookies;
  }

  const { code, error } = event.queryStringParameters;
  const cookieHeader = event.headers.cookie || "";
  const cookies = parseCookies(cookieHeader);
  const codeVerifier = cookies["code_verifier"];

  // Check if the user rejected the login request
  if (error) {
    console.error(`Error during Twitter OAuth: ${error}`);
    return {
      statusCode: 302,
      headers: {
        Location: `${process.env.URL}?error=${error}`,
      },
      body: "",
    };
  }

  if (!code || !codeVerifier) {
    return {
      statusCode: 400,
      body: "Missing authorization code or code_verifier",
    };
  }

  const tokenURL = "https://api.twitter.com/2/oauth2/token";
  const tokenParams = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: TWITTER_CLIENT_ID,
    code: code,
    redirect_uri: REDIRECT_URI,
    code_verifier: codeVerifier,
  });

  const basicAuthHeader = `Basic ${Buffer.from(
    `${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`
  ).toString("base64")}`;

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(tokenURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: basicAuthHeader,
      },
      body: tokenParams,
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return {
        statusCode: 400,
        body: `Error: ${tokenData.error_description || tokenData.error}`,
      };
    }

    const accessToken = tokenData.access_token;

    // Fetch the user's profile to get the screen name (username)
    const userProfileResponse = await fetch(
      "https://api.twitter.com/2/users/me",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const userProfileData = await userProfileResponse.json();

    if (!userProfileResponse.ok) {
      return {
        statusCode: userProfileResponse.status,
        body: `Error fetching user profile: ${userProfileData.error}`,
      };
    }

    const screenName = userProfileData.data.username; // Twitter username (screen name)

    // Redirect to frontend with access token and screen name
    return {
      statusCode: 302,
      headers: {
        Location: `${process.env.URL}?access_token=${accessToken}&screen_name=${screenName}`,
      },
      body: "",
    };
  } catch (error) {
    console.error("Error during authentication:", error);
    return {
      statusCode: 500,
      body: "Internal Server Error",
    };
  }
};
