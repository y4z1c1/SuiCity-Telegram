import { MongoClient } from "mongodb";

export const handler = async (event, context) => {
  const MONGODB_URI = process.env.MONGODB_URI;
  const DATABASE_NAME = "EligibleObjects";
  const COLLECTION_NAME = "objects";

  // Parse the request body
  const { wallet, objectIds } = JSON.parse(event.body);

  if (!wallet || !objectIds || !Array.isArray(objectIds)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid wallet or objectIds array" }),
    };
  }

  try {
    // Connect to MongoDB
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Add eligible object IDs to the wallet
    await collection.updateOne(
      { wallet: wallet },
      { $addToSet: { objectIds: { $each: objectIds } } }, // Add only new objectIds
      { upsert: true } // Create a new record if the wallet doesn't exist
    );

    // Close the connection
    await client.close();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Eligible object IDs successfully added to the wallet.",
      }),
    };
  } catch (error) {
    console.error("Error adding objectIds:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to add objectIds" }),
    };
  }
};
