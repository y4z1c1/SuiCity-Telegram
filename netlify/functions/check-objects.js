import { MongoClient } from "mongodb";

export const handler = async (event) => {
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

    // Check if the objectIds exist in the database and belong to another wallet
    const conflictingObjects = [];
    const ownedObjects = [];

    const existingEntries = await collection
      .find({ objectIds: { $in: objectIds } })
      .toArray();

    existingEntries.forEach((entry) => {
      entry.objectIds.forEach((objectId) => {
        if (objectIds.includes(objectId)) {
          if (entry.wallet !== wallet) {
            conflictingObjects.push(objectId);
          } else {
            ownedObjects.push(objectId);
          }
        }
      });
    });

    await client.close();

    return {
      statusCode: 200,
      body: JSON.stringify({
        conflictingObjects,
        ownedObjects,
      }),
    };
  } catch (error) {
    console.error("Error checking objectIds:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to check objectIds" }),
    };
  }
};
