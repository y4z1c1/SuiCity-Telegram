import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
let isConnected = false;

export const handler = async (event) => {
  try {
    let walletAddresses;
    try {
      walletAddresses = JSON.parse(event.body).walletAddresses;
    } catch (parseError) {
      console.error("Error parsing event body:", parseError);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid JSON format in request body" }),
      };
    }

    if (!walletAddresses || !Array.isArray(walletAddresses)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "An array of wallet addresses is required",
        }),
      };
    }

    if (!isConnected) {
      await client.connect();
      isConnected = true;
    }

    const database = client.db("twitter_bindings");
    const collection = database.collection("bindings");

    const twitterIds = await Promise.all(
      walletAddresses.map(async (walletAddress) => {
        try {
          const binding = await collection.findOne({ walletAddress });
          return {
            walletAddress,
            twitterId: binding ? binding.twitterId : null,
          };
        } catch (error) {
          console.error(
            `Error fetching Twitter ID for ${walletAddress}:`,
            error
          );
          return { walletAddress, twitterId: null, error: error.message };
        }
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ twitterIds }),
    };
  } catch (error) {
    console.error("Error fetching Twitter IDs:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to fetch Twitter IDs",
        details: error.message,
      }),
    };
  }
};
