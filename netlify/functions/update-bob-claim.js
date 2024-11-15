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
    const { walletAddress, bobClaimed } = JSON.parse(event.body);

    if (!walletAddress || typeof bobClaimed !== "boolean") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Missing required fields or invalid bobClaimed value",
        }),
      };
    }

    await clientPromise;
    const database = client.db("twitter_bindings");
    const collection = database.collection("bindings");

    const updateResult = await collection.updateOne(
      { walletAddress },
      { $set: { bobClaimed } },
      { upsert: true } // Creates a new document if one doesn't already exist
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Claim status updated successfully",
        updateResult,
      }),
    };
  } catch (error) {
    console.error("Error updating claim status:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to update claim status" }),
    };
  }
};
