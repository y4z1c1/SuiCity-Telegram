import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// Function to generate a unique reference number
async function generateUniqueRefNumber(collection) {
  let refNumber;
  let isUnique = false;
  let lowerBound = 20000;
  let upperBound = 100000;
  let attemptCount = 0;
  const maxAttempts = 100; // Max number of attempts before expanding the range

  while (!isUnique) {
    // Generate a random number within the current range
    refNumber =
      Math.floor(Math.random() * (upperBound - lowerBound + 1)) + lowerBound;
    console.log(
      `Generated reference number (attempt ${attemptCount}):`,
      refNumber
    );

    // Check if the refNumber already exists in the database
    const existingRef = await collection.findOne({ refNumber });
    if (!existingRef) {
      isUnique = true;
    } else {
      attemptCount++;
    }

    // If we've tried too many times, expand the range
    if (attemptCount >= maxAttempts) {
      console.log(`Expanding the range after ${attemptCount} attempts.`);
      upperBound += 100000; // Increase the upper bound of the range by 100,000
      attemptCount = 0; // Reset attempt counter for the new range
    }
  }

  return refNumber;
}

export const handler = async (event, context) => {
  try {
    console.log("Received event:", event);

    // Parse the incoming request body
    const body = JSON.parse(event.body);
    console.log("Parsed body:", body);

    const { twitterId, walletAddress, message, signature } = body;

    // Check for missing fields
    if (!twitterId || !walletAddress || !message || !signature) {
      console.log("Missing fields:", {
        twitterId,
        walletAddress,
        message,
        signature,
      });
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    console.log("Connecting to MongoDB...");
    await client.connect();
    console.log("Successfully connected to MongoDB");

    const database = client.db("twitter_bindings");
    const collection = database.collection("bindings");

    // Check if the Twitter ID is already bound
    const existingBindingForTwitter = await collection.findOne({ twitterId });
    console.log("Existing binding for Twitter:", existingBindingForTwitter);

    if (existingBindingForTwitter) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "This Twitter account is already bound to a wallet",
        }),
      };
    }

    // Check if the wallet is already bound to another Twitter account
    const existingBindingForWallet = await collection.findOne({
      walletAddress,
    });
    console.log("Existing binding for wallet:", existingBindingForWallet);

    if (existingBindingForWallet) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "This wallet is already bound to another Twitter account",
        }),
      };
    }

    // Get the current count of documents to use as index number
    const indexNumber = await collection.countDocuments();
    console.log("Current index number:", indexNumber);

    // Generate a unique reference number
    const refNumber = await generateUniqueRefNumber(collection);
    console.log("Unique reference number:", refNumber);

    // Insert the new binding along with the numeric index and refNumber
    const result = await collection.insertOne({
      twitterId,
      walletAddress,
      message,
      signature,
      indexNumber, // Store the index as a number
      refNumber, // Store the unique reference number
      createdAt: new Date(),
    });

    console.log("Insert result:", result);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Binding stored successfully",
        result,
      }),
    };
  } catch (error) {
    console.error("Error storing binding data:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to store binding data" }),
    };
  } finally {
    console.log("Closing MongoDB connection");
    await client.close();
  }
};
