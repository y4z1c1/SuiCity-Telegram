import { MongoClient } from "mongodb";
import { getStore } from "@netlify/blobs";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export const handler = async (event) => {
  try {
    const { refOwnerWallet, claimerWallet } = JSON.parse(event.body);

    if (!refOwnerWallet || !claimerWallet) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    await client.connect();
    const database = client.db("twitter_bindings");
    const collection = database.collection("bindings");

    const existingOwner = await collection.findOne({
      walletAddress: refOwnerWallet,
    });

    if (!existingOwner) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Reference owner not found" }),
      };
    }

    if (!existingOwner.usedRefs) {
      existingOwner.usedRefs = [];
    }

    if (!existingOwner.usedRefs.includes(claimerWallet)) {
      await collection.updateOne(
        { walletAddress: refOwnerWallet },
        { $push: { usedRefs: claimerWallet } }
      );

      // Store reference updates in Netlify Blobs
      const refStore = getStore("ref_data");
      await refStore.setJSON(refOwnerWallet, {
        usedRefs: [...existingOwner.usedRefs, claimerWallet],
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Reference successfully updated" }),
    };
  } catch (error) {
    console.error("Error updating reference:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to update reference" }),
    };
  } finally {
    await client.close();
  }
};
