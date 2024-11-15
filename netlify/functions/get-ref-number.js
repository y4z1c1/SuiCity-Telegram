import { MongoClient } from "mongodb";
import { getStore } from "@netlify/blobs";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export const handler = async (event) => {
  try {
    const { walletAddress } = JSON.parse(event.body);

    if (!walletAddress) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Wallet address is required" }),
      };
    }

    await client.connect();
    const database = client.db("twitter_bindings");
    const collection = database.collection("bindings");

    const binding = await collection.findOne({ walletAddress });

    if (!binding) {
      // Check Netlify Blobs if MongoDB doesn't have the binding
      const refStore = getStore("ref_data");
      const blobBinding = await refStore.get(walletAddress);

      if (!blobBinding) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: "Binding not found" }),
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ refNumber: JSON.parse(blobBinding).refNumber }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ refNumber: binding.refNumber }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch reference number" }),
    };
  } finally {
    await client.close();
  }
};
