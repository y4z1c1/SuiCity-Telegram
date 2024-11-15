import fetch from "node-fetch";

// Twitter User ID for SuiCityP2E account
const SUI_CITY_USER_ID = "1829262000267911168"; // The target user ID you want to follow

export const handler = async function (event, context) {
  console.log("Handler invoked");

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

    // Send a POST request to follow the SuiCityP2E user
    console.log(
      `Sending POST request to follow SuiCityP2E (User ID: ${SUI_CITY_USER_ID})`
    );

    const followResponse = await fetch(
      `https://api.twitter.com/2/users/${userId}/following`, // Post to the authenticated user's following list
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target_user_id: SUI_CITY_USER_ID, // The ID of the user to follow
        }),
      }
    );

    console.log("Follow request response status:", followResponse.status);

    if (!followResponse.ok) {
      const errorMessage = await followResponse.text();
      console.log("Error following user:", errorMessage);
      return {
        statusCode: followResponse.status,
        body: JSON.stringify({ error: errorMessage }),
      };
    }

    const followData = await followResponse.json();
    console.log("Follow request data:", followData);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Successfully followed SuiCityP2E",
        followData,
      }),
    };
  } catch (error) {
    console.error("Error following user:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
