import nacl from "tweetnacl";
import { bytesToHex } from "@noble/hashes/utils";
import { TextEncoder } from "util";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Helper function to decode a hex-encoded string into a Uint8Array
function decodeHexString(hex) {
  return Uint8Array.from(Buffer.from(hex, "hex"));
}

export const handler = async (event) => {
  try {
    // Parse the request body to get the message to sign
    const { message } = JSON.parse(event.body);

    if (!message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Message is required" }),
      };
    }

    // Encode the message as Uint8Array
    const messageBytes = new TextEncoder().encode(message);
    console.log("Raw message to sign:", message);

    // Retrieve the Ed25519 private key from environment variables
    const privateKeyHex = process.env.PRIVATE_KEY;
    const publicKeyHex = process.env.PUBLIC_KEY;

    if (!privateKeyHex || !publicKeyHex) {
      console.error("Private/Public key not found in environment variables");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Server error: missing keys" }),
      };
    }

    // Convert the private key from hex string to Uint8Array
    const privateKeyBytes = decodeHexString(privateKeyHex);
    const publicKeyBytes = decodeHexString(publicKeyHex);

    if (privateKeyBytes.length !== 32 || publicKeyBytes.length !== 32) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Invalid key size. Keys must be 32 bytes each.",
        }),
      };
    }

    // Combine the 32-byte private key and 32-byte public key into a single 64-byte key
    const combinedKey = new Uint8Array(64);
    combinedKey.set(privateKeyBytes);
    combinedKey.set(publicKeyBytes, 32); // Set public key after private key

    // Sign the message using Ed25519 with the combined 64-byte key
    const signature = nacl.sign.detached(messageBytes, combinedKey);

    // Convert signature to hex
    const hexSign = bytesToHex(signature);

    // Return the signature and the message
    return {
      statusCode: 200,
      body: JSON.stringify({
        message,
        hexSign,
        publicKey: publicKeyHex,
      }),
    };
  } catch (error) {
    console.error("Error signing message:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
