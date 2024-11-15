// Mint.tsx
import React, { useCallback, useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import useWallet from "../hooks/useWallet"; // Ensure correct path to your hook
import { ADDRESSES } from "../../addresses";

interface MintProps {
  onMintSuccessful: () => void;
  showModal: (message: string, bgColor: 0 | 1 | 2) => void;
}

const Mint: React.FC<MintProps> = ({ onMintSuccessful, showModal }) => {
  const { wallet, signAndExecuteTransaction } = useWallet();
  const [loading, setLoading] = useState(false);

  const mint = useCallback(async () => {
    if (!wallet.address) {
      showModal("🚫 Please connect a wallet first.", 0);
      return;
    }

    setLoading(true);
    try {
      const transaction = new Transaction();
      transaction.moveCall({
        target: `${ADDRESSES.PACKAGE}::nft::build_city`,
        arguments: [
          transaction.object(`${ADDRESSES.GAME}`),
          transaction.object(`${ADDRESSES.CLOCK}`),
        ],
      });

      const result = await signAndExecuteTransaction(transaction, {
        showEffects: true,
        showBalanceChanges: true,
      });

      console.log("Mint successful:", result);
      onMintSuccessful();
    } catch (error) {
      console.error("Mint Error:", error);
      showModal(`🚫 ${error}`, 0);
    } finally {
      setLoading(false);
    }
  }, [wallet, signAndExecuteTransaction, onMintSuccessful, showModal]);

  return (
    <div className="flex flex-col gap-6">
      {wallet.address ? (
        <>
          <p>Connected Wallet: {wallet.address}</p>
          <button className="mint-button" onClick={mint} disabled={loading}>
            {loading ? "Minting..." : "🏙️ Free Mint your SuiCity"}
          </button>
          <p>You will be able to claim your tokens after minting.</p>
        </>
      ) : (
        <p>Please connect your wallet to mint.</p>
      )}
    </div>
  );
};

export default Mint;
