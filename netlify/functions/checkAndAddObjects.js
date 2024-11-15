import { MongoClient } from "mongodb";

export const handler = async (event, context) => {
  // MongoDB connection URI (replace with your own)
  const MONGODB_URI = process.env.MONGODB_URI; // Store in environment variables
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
    // Connect to MongoDB (no need to pass deprecated options)
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Check if any objectId is already associated with a different wallet
    const existingEntries = await collection
      .find({ objectIds: { $in: objectIds } })
      .toArray();

    if (existingEntries.length > 0) {
      // Check if any of the found entries belong to a different wallet
      const conflictingWallets = existingEntries.filter(
        (entry) => entry.wallet !== wallet
      );

      if (conflictingWallets.length > 0) {
        // Prevent exploitation: these objects belong to another wallet
        return {
          statusCode: 403,
          body: JSON.stringify({
            error: "Some objects are already claimed by a different wallet.",
            conflictingWallets: conflictingWallets.map((entry) => entry.wallet),
          }),
        };
      }
    }

    // Add eligible object IDs to the wallet if no conflicts are found
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
    console.error("Error handling objectIds:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to process objectIds" }),
    };
  }
};
