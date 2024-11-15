import { useCallback, useState } from "react";
import { ADDRESSES } from "../../addresses.ts"; // Import the addresses
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";

const Claim = ({
  nft,
  onClaimSuccess,
  onClick,
  onError, // Prop to handle error
  showModal, // Add showModal as a prop
  suiBalance, // Receive SUI balance as prop
  walletObject
}: {
  nft: any;
  onClaimSuccess: () => void;
  onClick: () => void;
  onError: () => void;
  showModal: (message: string, bgColor: 0 | 1 | 2) => void; // Define showModal prop type with message and bg
  suiBalance: number;
  walletObject: any;
}) => {
  const [isLoading, setIsLoading] = useState(false); // State for loading indication
  const suiClient = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          showRawEffects: true,
          showEffects: true,
          showObjectChanges: true,
        },
      }),
  });

  const checkUserBalance = useCallback(() => {
    if (suiBalance < 0.01) {
      showModal("❗️ You need more SUI in order to pay gas.", 0);
      throw new Error("You need more SUI in order to pay gas.");
    }

    return true;
  }, [suiBalance, showModal]);

  // Memoized claim function to prevent unnecessary re-renders
  const claim = useCallback(async () => {
    try {
      setIsLoading(true); // Set loading state
      await checkUserBalance(); // Check user balance before proceeding

      const transactionBlock = new Transaction();

      console.log("wallet object is: ", walletObject);

      transactionBlock.moveCall({
        target: `${ADDRESSES.PACKAGE}::nft::claim_sity`,
        arguments: [
          transactionBlock.objectRef({
            objectId: nft.objectId,
            digest: nft.digest,
            version: nft.version,
          }),
          transactionBlock.object(ADDRESSES.GAME),
          transactionBlock.object(String(walletObject)),

          transactionBlock.object(ADDRESSES.CLOCK),
        ],
      });

      signAndExecute(
        { transaction: transactionBlock },
        {
          onSuccess: () => {
            console.log("Claim successful! Your tokens have been claimed.");
            showModal("✅ Claim successful!", 1); // Show success message in the modal

            onClaimSuccess(); // Call onSuccess handler
          },
          onError: (error) => {
            console.error("Claim error", error);
            showModal(`🚫 Error: ${error}`, 0); // Show success message in the modal

            onError(); // Call onError handler
          },
        }
      );
    } catch (error) {
      console.error("Claim Error:", error);

      onError(); // Catch and handle any outer error
    } finally {
      setIsLoading(false); // Reset loading state
    }
  }, [nft, signAndExecute, onClaimSuccess, onError]);



  return (
    <div className="flex flex-col gap-6">
      <button
        className={`mx-auto px-5 py-3 border border-transparent text-base font-medium rounded-md text-white ${isLoading ? "bg-gray-500" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        disabled={isLoading} // Disable the button while processing
        onClick={() => {
          onClick(); // Call onClick to pause accumulation
          claim(); // Call claim function
        }}
      >
        {isLoading ? "Processing..." : "Claim"}
      </button>
    </div>
  );
};

export default Claim;
