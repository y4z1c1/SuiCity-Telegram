import { useCallback, useState } from "react";
import { ADDRESSES } from "../../addresses";
import { Transaction } from "@mysten/sui/transactions";
import useWallet from "../hooks/useWallet"; // Ensure correct path to your hook

interface ClaimProps {
  nft: any;
  onClaimSuccess: () => void;
  onClick: () => void;
  onError: () => void;
  showModal: (message: string, bgColor: 0 | 1 | 2) => void;
  suiBalance: number;
  walletObject: any;
}

const Claim: React.FC<ClaimProps> = ({
  nft,
  onClaimSuccess,
  onClick,
  onError,
  showModal,
  suiBalance,
  walletObject,
}) => {
  const { wallet, signAndExecuteTransaction } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  // Function to check if the user has enough SUI balance for gas
  const checkUserBalance = useCallback(() => {
    if (suiBalance < 0.01) {
      showModal("❗️ You need more SUI to pay gas.", 0);
      throw new Error("Insufficient SUI balance for gas.");
    }
    return true;
  }, [suiBalance, showModal]);

  // Claim function that executes the transaction
  const claim = useCallback(async () => {
    if (!wallet.address) {
      showModal("🚫 Please connect a wallet first.", 0);
      return;
    }

    setIsLoading(true);
    try {
      await checkUserBalance();

      const transaction = new Transaction();
      transaction.moveCall({
        target: `${ADDRESSES.PACKAGE}::nft::claim_sity`,
        arguments: [
          transaction.objectRef({
            objectId: nft.objectId,
            digest: nft.digest,
            version: nft.version,
          }),
          transaction.object(ADDRESSES.GAME),
          transaction.object(String(walletObject)),
          transaction.object(ADDRESSES.CLOCK),
        ],
      });

      // Sign and execute the transaction using custom wallet
      const result = await signAndExecuteTransaction(transaction, {
        showEffects: true,
        showObjectChanges: true,
      });

      console.log("Claim successful:", result);
      showModal("✅ Claim successful!", 1);
      onClaimSuccess(); // Trigger the success callback
    } catch (error) {
      console.error("Claim Error:", error);
      showModal(`🚫 Error: ${error}`, 0);
      onError(); // Trigger the error callback
    } finally {
      setIsLoading(false);
    }
  }, [
    wallet,
    signAndExecuteTransaction,
    nft,
    checkUserBalance,
    onClaimSuccess,
    onError,
    showModal,
    walletObject,
  ]);

  return (
    <div className="flex flex-col gap-6">
      {wallet.address ? (
        <>
          <button
            className={`mx-auto px-5 py-3 border border-transparent text-base font-medium rounded-md text-white ${isLoading ? "bg-gray-500" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            disabled={isLoading}
            onClick={() => {
              onClick(); // Call onClick to pause accumulation
              claim(); // Call claim function
            }}
          >
            {isLoading ? "Processing..." : "Claim"}
          </button>
        </>
      ) : (
        <p>Please connect your wallet to claim.</p>)}
    </div>
  );
};

export default Claim;
