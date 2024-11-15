import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export const handler = async (event) => {
  try {
    const { walletAddress } = event.queryStringParameters;

    if (!walletAddress) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing wallet address" }),
      };
    }

    await client.connect();
    const database = client.db("twitter_bindings");
    const collection = database.collection("bindings");

    // Query for the wallet address
    const userBinding = await collection.findOne({ walletAddress });

    if (userBinding) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          hasNft: !!userBinding.nft, // Return true if 'nft' field exists
        }),
      };
    }

    // Return if no document found
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: false,
        hasNft: false,
      }),
    };
  } catch (error) {
    console.error("Error checking NFT data:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to check NFT data" }),
    };
  } finally {
    await client.close();
  }
};
