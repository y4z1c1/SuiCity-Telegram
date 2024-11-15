import { secp256k1 } from "@noble/curves/secp256k1";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your .env file
const envFilePath = path.join(__dirname, ".env");

// Function to generate Secp256k1 keys and append them to .env file
async function generateSecp256k1Keys() {
  try {
    // Generate a random 32-byte private key
    const privateKey = secp256k1.utils.randomPrivateKey();

    // Derive the public key from the private key using Secp256k1
    const publicKey = secp256k1.getPublicKey(privateKey);

    // Convert keys to hex format
    const privateKeyHex = Buffer.from(privateKey).toString("hex");
    const publicKeyHex = Buffer.from(publicKey).toString("hex");

    console.log("Generated Private Key (Hex):", privateKeyHex);
    console.log("Generated Public Key (Hex):", publicKeyHex);

    // Append the keys to the .env file
    const envContent = `\nPRIVATE_KEY=${privateKeyHex}\nPUBLIC_KEY=${publicKeyHex}\n`;

    fs.appendFile(envFilePath, envContent, (err) => {
      if (err) {
        console.error("Error appending to .env file:", err);
        return;
      }
      console.log(".env file updated successfully with keys.");
    });
  } catch (error) {
    console.error("Error generating Secp256k1 keys:", error);
  }
}

generateSecp256k1Keys();
