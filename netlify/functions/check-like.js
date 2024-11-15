import fetch from "node-fetch";

// The ID of the tweet you want to check
const TWEET_ID = "1834908891349406060"; // Replace with the tweet ID you want to check

export const handler = async function (event, context) {
  console.log("Handler invoked for checking if tweet is liked");

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

    // Check if the user has already liked the tweet using GET /2/users/:id/liked_tweets
    console.log(`Checking if Tweet ID: ${TWEET_ID} is already liked`);

    const likedTweetsResponse = await fetch(
      `https://api.twitter.com/2/users/${userId}/liked_tweets`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!likedTweetsResponse.ok) {
      const errorMessage = await likedTweetsResponse.text();
      console.log("Error fetching liked tweets:", errorMessage);
      return {
        statusCode: likedTweetsResponse.status,
        body: JSON.stringify({ error: errorMessage }),
      };
    }

    const likedTweetsData = await likedTweetsResponse.json();
    const likedTweets = likedTweetsData?.data || [];

    // Check if the tweet is already liked
    const isLiked = likedTweets.some((tweet) => tweet.id === TWEET_ID);

    if (isLiked) {
      console.log(`Tweet ID: ${TWEET_ID} is already liked`);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Tweet already liked", isLiked: true }),
      };
    }

    console.log(`Tweet ID: ${TWEET_ID} is not liked`);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Tweet not liked", isLiked: false }),
    };
  } catch (error) {
    console.error("Error checking if tweet is liked:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
