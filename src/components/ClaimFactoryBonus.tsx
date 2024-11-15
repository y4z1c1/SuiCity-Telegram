import { useCallback, useEffect, useState } from "react";
import { ADDRESSES } from "../../addresses.ts";
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";

const ClaimFactoryBonus = ({
  nft,
  onClaimSuccess,
  onClick,
  onError,
  showModal, // Add showModal as a prop
  suiBalance,
  walletObject,
  accumulatedSity, // Pass accumulated SITY
  gameData,        // Pass gameData to access factory bonuses
  factoryLevel     // Pass factory level to calculate the bonus
}: {
  nft: any;
  onClaimSuccess: () => void;
  onClick: () => void;
  onError: () => void;
  showModal: (message: string, bgColor: 0 | 1 | 2) => void; // Define showModal prop type with message and bg
  suiBalance: number;
  walletObject: any;
  accumulatedSity: number;
  gameData: any;
  factoryLevel: number;
}) => {
  const suiClient = useSuiClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [bonusAmount, setBonusAmount] = useState<number>(0); // New state to store calculated bonus

  const checkUserBalance = useCallback(() => {
    if (suiBalance < 0.005) {
      showModal("You need more SUI in order to pay gas.", 0);
      throw new Error("You should have more SUI in order to pay gas.");
    }



    return true;
  }, [suiBalance, showModal]);

  // Function to format the balance for readability
  const formatBalance = (balance: number) => {
    if (balance >= 1000000) {
      return (balance / 1000000).toFixed(2) + "M";
    } else if (balance >= 1000) {
      return (balance / 1000).toFixed(2) + "k";
    }
    return balance.toFixed(2);
  };

  // Function to calculate the bonus amount
  const calculateBonus = useCallback(() => {
    if (gameData && gameData.factory_bonuses) {
      const bonusPercentage = gameData.factory_bonuses[factoryLevel] || 0;
      const calculatedBonus = (accumulatedSity * bonusPercentage) / 100;
      setBonusAmount(calculatedBonus);
    }
  }, [accumulatedSity, factoryLevel, gameData]);

  useEffect(() => {
    calculateBonus(); // Calculate bonus when component mounts or dependencies change
  }, [calculateBonus]);
  const { mutate: signAndExecute } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          showRawEffects: true,
          showEffects: true,
        },
      }),
  });

  const claimBonus = useCallback(async () => {
    setIsProcessing(true); // Disable the button while the transaction is in progress
    try {
      const transactionBlock = new Transaction();

      await checkUserBalance(); // Check user balance before proceeding
      transactionBlock.moveCall({
        target: `${ADDRESSES.PACKAGE}::nft::claim_factory_bonus`,
        arguments: [
          transactionBlock.objectRef({
            objectId: nft.objectId,
            digest: nft.digest,
            version: nft.version,
          }),
          transactionBlock.object(`${ADDRESSES.GAME}`),
          transactionBlock.object(`${String(walletObject)}`),
          transactionBlock.object(`${ADDRESSES.CLOCK}`),
        ],
      });

      await signAndExecute(
        { transaction: transactionBlock },
        {
          onSuccess: (result) => {
            console.log("Claim successful:", result);
            showModal(`✅ Bonus claimed successfully!`, 1); // Show success message in the modal

            onClaimSuccess();
          },
          onError: (error) => {
            console.error("Claim failed:", error);
            showModal(`🚫 Error: ${error}`, 0); // Show success message in the modal

            onError();
          },
        }
      );
    } catch (error) {
      console.error("Claim Error:", error);

      onError();
    } finally {
      setIsProcessing(false); // Re-enable the button
    }
  }, [nft, signAndExecute, onClaimSuccess, onError]);

  return (
    <div>
      {/* Display the calculated bonus */}
      <p style={{ color: "lightgreen" }}>
        Factory Bonus: {formatBalance(bonusAmount)} $SITY
      </p>

      <button
        onClick={() => {
          onClick();
          claimBonus();
        }}
        disabled={isProcessing}
      >
        {isProcessing ? "Processing..." : "Claim Factory Bonus"}
      </button>
    </div>
  );

};

export default ClaimFactoryBonus;
