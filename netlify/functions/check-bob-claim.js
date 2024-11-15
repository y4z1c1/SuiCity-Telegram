import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
let client = null;
let clientPromise = null;

if (!clientPromise) {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export const handler = async (event) => {
  try {
    const { walletAddress } = JSON.parse(event.body);

    if (!walletAddress) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing walletAddress field" }),
      };
    }

    await clientPromise;
    const database = client.db("twitter_bindings");
    const collection = database.collection("bindings");

    const user = await collection.findOne({ walletAddress });

    return {
      statusCode: 200,
      body: JSON.stringify({
        bobClaimed: user?.bobClaimed || false, // Return false if not found
      }),
    };
  } catch (error) {
    console.error("Error checking claim status:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to check claim status" }),
    };
  }
};
