import { MongoClient } from "mongodb";
import { getStore } from "@netlify/blobs";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export const handler = async (event, context) => {
  try {
    const { twitterId } = event.queryStringParameters;

    if (!twitterId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    await client.connect();
    const database = client.db("twitter_bindings");
    const collection = database.collection("bindings");

    // Check MongoDB for the Twitter ID
    const existingBinding = await collection.findOne({ twitterId });

    if (existingBinding) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          isBound: true,
          walletAddress: existingBinding.walletAddress,
        }),
      };
    }

    // Check Netlify Blobs for the binding
    const bindingStore = getStore("twitter_bindings");
    const blobBinding = await bindingStore.get(twitterId);

    if (blobBinding) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          isBound: true,
          walletAddress: JSON.parse(blobBinding).walletAddress,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        isBound: false,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to check binding" }),
    };
  } finally {
    await client.close();
  }
};
