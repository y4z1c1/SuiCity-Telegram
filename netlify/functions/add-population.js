import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
let client = null; // Declare the client globally to reuse it
let clientPromise = null;

if (!clientPromise) {
  client = new MongoClient(uri);
  clientPromise = client.connect(); // Initialize connection only once
}

export const handler = async (event, context) => {
  try {
    console.log("Received event:", event);

    const body = JSON.parse(event.body);
    const { walletAddress, population } = body;

    if (!walletAddress || typeof population !== "number") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Missing required fields or invalid population",
        }),
      };
    }

    console.log("Connecting to MongoDB...");
    await clientPromise; // Await the initialized client connection
    console.log("Successfully connected to MongoDB");

    const database = client.db("twitter_bindings");
    const collection = database.collection("bindings");

    // Check if the user already exists in the collection
    const user = await collection.findOne({ walletAddress });

    if (user) {
      // User exists, update the population field
      const updateResult = await collection.updateOne(
        { walletAddress },
        { $set: { population } } // Update population field
      );

      console.log("Population updated for existing user:", updateResult);

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: "Population updated successfully",
          updateResult,
        }),
      };
    } else {
      // User does not exist, create a new entry
      const insertResult = await collection.insertOne({
        walletAddress,
        population,
      });

      console.log("New user created with population:", insertResult);

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: "Population added for new user",
          insertResult,
        }),
      };
    }
  } catch (error) {
    console.error("Error updating/adding population:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to update or add population data",
      }),
    };
  }
};
