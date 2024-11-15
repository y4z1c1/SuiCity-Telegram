import { MongoClient } from "mongodb";
import { getStore } from "@netlify/blobs";

const uri = process.env.MONGODB_URI;
let client;

const getMongoClient = async () => {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client;
};

export const handler = async (event) => {
  try {
    const { walletAddress } = JSON.parse(event.body);

    if (!walletAddress) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    const clientInstance = await getMongoClient();
    const database = clientInstance.db("twitter_bindings");
    const collection = database.collection("bindings");

    const binding = await collection.findOne({ walletAddress });

    if (!binding) {
      // Check Netlify Blobs if MongoDB doesn't have the binding
      const refStore = getStore("ref_data");
      const blobBinding = await refStore.get(walletAddress);

      if (!blobBinding) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: "No reference found for this wallet" }),
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ usedRefs: JSON.parse(blobBinding).usedRefs }),
      };
    }

    const usedRefs = binding.usedRefs || [];

    return {
      statusCode: 200,
      body: JSON.stringify({ usedRefs }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch used references" }),
    };
  }
};
