import fetch from "node-fetch";

// Tweet ID for the target tweet you want to check retweets for
const TARGET_TWEET_ID = "1834908891349406060"; // Replace with the target tweet ID

export const handler = async function (event, context) {
  console.log("Handler invoked for checking retweet");

  // Log the received event headers
  console.log("Event Headers:", event.headers);

  const accessToken = event.headers.authorization?.split(" ")[1]; // Get the access token from the request headers

  if (!accessToken) {
    console.log("Missing access token");
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing access token" }),
    };
  }

  console.log("Access token received:", accessToken);

  try {
    // Fetch the authenticated user's profile to get their ID
    console.log("Fetching authenticated user's profile");

    const userResponse = await fetch("https://api.twitter.com/2/users/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log("User profile fetch response status:", userResponse.status);

    if (!userResponse.ok) {
      const errorMessage = await userResponse.text();
      console.log("Error fetching user profile:", errorMessage);
      return {
        statusCode: userResponse.status,
        body: JSON.stringify({ error: errorMessage }),
      };
    }

    const userData = await userResponse.json();
    console.log("User profile data:", userData);

    const userId = userData?.data?.id;

    if (!userId) {
      console.log("User ID not found in the response");
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Error fetching user profile" }),
      };
    }

    console.log("Authenticated User ID:", userId);

    // Check if the user has already retweeted the target tweet
    console.log(
      `Checking if Tweet ID: ${TARGET_TWEET_ID} has been retweeted by the user`
    );

    const retweetResponse = await fetch(
      `https://api.twitter.com/2/tweets/${TARGET_TWEET_ID}/retweeted_by`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log("Retweet check response status:", retweetResponse.status);

    if (!retweetResponse.ok) {
      const errorMessage = await retweetResponse.text();
      console.log("Error checking retweet:", errorMessage);
      return {
        statusCode: retweetResponse.status,
        body: JSON.stringify({ error: errorMessage }),
      };
    }

    const retweetData = await retweetResponse.json();
    const retweetedBy = retweetData?.data || [];

    // Check if the user is in the list of users who retweeted
    const hasRetweeted = retweetedBy.some((user) => user.id === userId);

    if (hasRetweeted) {
      console.log(
        `User ID: ${userId} has already retweeted Tweet ID: ${TARGET_TWEET_ID}`
      );
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Tweet already retweeted",
          hasRetweeted: true,
        }),
      };
    }

    console.log(
      `User ID: ${userId} has not retweeted Tweet ID: ${TARGET_TWEET_ID}`
    );
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Tweet not retweeted",
        hasRetweeted: false,
      }),
    };
  } catch (error) {
    console.error("Error checking retweet:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
