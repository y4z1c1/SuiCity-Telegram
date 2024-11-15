import { useState, useEffect, useCallback } from "react";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";

interface Wallet {
  address: string | null;
  keypair: Ed25519Keypair | null;
}

// Initialize the SuiClient for Devnet
const rpcUrl = getFullnodeUrl("mainnet");
const client = new SuiClient({ url: rpcUrl });

const useWallet = () => {
  const [wallet, setWallet] = useState<Wallet>({
    address: null,
    keypair: null,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedSecretKey = localStorage.getItem("walletSecretKey");
    if (storedSecretKey) {
      try {
        const { schema, secretKey } = decodeSuiPrivateKey(storedSecretKey);
        if (schema !== "ED25519") throw new Error("Unsupported key schema.");
        const keypair = Ed25519Keypair.fromSecretKey(secretKey);
        const address = keypair.getPublicKey().toSuiAddress();
        setWallet({ address, keypair });
      } catch (err) {
        console.error("Failed to restore wallet:", err);
        localStorage.removeItem("walletSecretKey");
      }
    }
  }, []);

  const createNewWallet = useCallback(() => {
    try {
      const keypair = Ed25519Keypair.generate();
      const secretKey = keypair.getSecretKey();
      const address = keypair.getPublicKey().toSuiAddress();
      localStorage.setItem("walletSecretKey", secretKey);
      setWallet({ address, keypair });
      setError(null);
    } catch (err) {
      console.error("Failed to create wallet:", err);
      setError("Failed to create a new wallet.");
    }
  }, []);

  const importWallet = useCallback((encodedSecretKey: string) => {
    try {
      const { schema, secretKey } = decodeSuiPrivateKey(encodedSecretKey);
      if (schema !== "ED25519") throw new Error("Unsupported key schema.");
      const keypair = Ed25519Keypair.fromSecretKey(secretKey);
      const address = keypair.getPublicKey().toSuiAddress();
      localStorage.setItem("walletSecretKey", encodedSecretKey);
      setWallet({ address, keypair });
      setError(null);
    } catch (err) {
      console.error("Failed to import wallet:", err);
      setError("Invalid private key.");
    }
  }, []);

  const signAndExecuteTransaction = useCallback(
    async (transaction: Transaction, options = {}) => {
      if (!wallet.keypair) throw new Error("Wallet not initialized.");
      transaction.setSenderIfNotSet(
        wallet.keypair.getPublicKey().toSuiAddress()
      );
      // Get transaction bytes to be signed
      const transactionBytes = await transaction.build({ client });

      // Execute the signed transaction on the blockchain
      const result = await client.signAndExecuteTransaction({
        signer: wallet.keypair,
        transaction: transaction,
        options: {
          showEffects: true,
          showBalanceChanges: true,
          ...options,
        },
      });

      // Wait for the transaction to be finalized on the blockchain
      await client.waitForTransaction({ digest: result.digest });

      return result; // Return the result of the transaction
    },
    [wallet]
  );

  return {
    wallet,
    error,
    createNewWallet,
    importWallet,
    signAndExecuteTransaction,
  };
};

export default useWallet;
