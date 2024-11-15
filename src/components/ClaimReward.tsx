import { useCallback, useState } from "react";
import { ADDRESSES } from "../../addresses.ts";
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { bcs } from "@mysten/sui/bcs";

// Helper function to convert hex string to Uint8Array
const hexToUint8Array = (hexString: string) => {
  if (hexString.length % 2 !== 0) {
    throw new Error("Invalid hex string");
  }
  const array = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    array[i / 2] = parseInt(hexString.substr(i, 2), 16);
  }
  return array;
};

const ClaimReward = ({
  onClaimSuccessful,
  showModal,
  mySignature, // Signature in hex format from the backend
  hashedMessage, // Hashed message in hex format from the backend
  amount, // Amount of SITY tokens to claim
  walletObject,
}: {
  showModal: (message: string, bgColor: 0 | 1 | 2) => void; // Define showModal prop type with message and bg
  onClaimSuccessful: () => void;
  mySignature: string; // Hex-encoded signature from the backend
  hashedMessage: string | null; // Hex-encoded hashed message
  amount: number; // Amount of SITY to claim
  walletObject: any;
}) => {
  const [isClaiming, setIsClaiming] = useState(false); // Track claim loading state

  const handleClaimClick = async () => {
    setIsClaiming(true); // Start claim loading state

    try {
      await claimReward(); // Proceed with the claim
    } catch (error) {
      console.error("Claim error:", error);
      showModal(`🚫 Error: ${error}`, 0); // Show error message in the modal
    }

    setIsClaiming(false); // End claim loading state
  };

  const suiClient = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      await suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          // Raw effects are required so the effects can be reported back to the wallet
          showRawEffects: true,
          showEffects: true,
        },
      }),
  });

  const claimReward = useCallback(async () => {
    try {
      // Convert the hex signature to Uint8Array
      const signatureArray = hexToUint8Array(mySignature);

      console.log("Message is:", hashedMessage);

      const transactionBlock = new Transaction();

      // Add the Move function call for claim_reward
      transactionBlock.moveCall({
        target: `0x6408a4f4cb3579347cd3f377a8e04a182be5e54631e6f97dca67f8ee61c59b18::nft::claim_reward`,
        arguments: [
          transactionBlock.object(`${ADDRESSES.GAME}`), // Game data object
          transactionBlock.object(`${walletObject}`), // Wallet object
          transactionBlock.pure(bcs.vector(bcs.U8).serialize(signatureArray)), // Serialize Uint8Array for signature
          transactionBlock.pure.string(String(hashedMessage)), // Serialize the hashed message
        ],
      });

      signAndExecute(
        {
          transaction: transactionBlock,
        },
        {
          onSuccess: (result) => {
            console.log("Claim successful", result);
            onClaimSuccessful(); // Trigger the success callback
          },
          onError: (error) => {
            console.error("Claim error:", error);
            showModal(`🚫 Error: ${error}`, 0); // Show error message in the modal
          },
        }
      );
    } catch (error) {
      console.error("Claim Error:", error);
      showModal(`🚫 Error: ${error}`, 0); // Show error message in the modal
    }
  }, [signAndExecute, onClaimSuccessful, mySignature, hashedMessage, walletObject, showModal]);

  return (
    <div className="claim-reward">
      {isClaiming ? (
        <p style={{ color: "white" }}>Claiming your reward...</p>
      ) : (
        <button onClick={handleClaimClick} disabled={isClaiming}>
          🎁 Claim {amount} $SITY Allocation
        </button>
      )}
    </div>
  );
};

export default ClaimReward;
