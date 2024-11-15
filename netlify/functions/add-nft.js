import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export const handler = async (event, context) => {
  try {
    console.log("Received event:", event);

    const body = JSON.parse(event.body);
    const { walletAddress, walletObject, nftData } = body;

    if (!walletAddress || !walletObject || !nftData) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    const nftName = nftData?.content?.fields?.name || "Unnamed NFT";

    console.log("Connecting to MongoDB...");
    await client.connect();
    console.log("Successfully connected to MongoDB");

    const database = client.db("twitter_bindings");
    const collection = database.collection("bindings");

    const binding = await collection.findOne({ walletAddress });

    if (!binding) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "No binding found for this wallet address",
        }),
      };
    }

    // Update MongoDB with new NFT string, walletObject, and NFT name
    const updateResult = await collection.updateOne(
      { walletAddress },
      { $set: { nft: nftData, walletId: walletObject, nftName: nftName } }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "NFT data, walletObject, and NFT name added successfully",
        updateResult,
      }),
    };
  } catch (error) {
    console.error(
      "Error updating NFT data, walletObject, and NFT name:",
      error
    );
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to update NFT data, walletObject, and NFT name",
      }),
    };
  } finally {
    console.log("Closing MongoDB connection");
    await client.close();
  }
};
