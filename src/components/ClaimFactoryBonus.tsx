import { useCallback, useEffect, useState } from "react";
import { ADDRESSES } from "../../addresses";
import { Transaction } from "@mysten/sui/transactions";
import useWallet from "../hooks/useWallet"; // Ensure correct path to your hook

const ClaimFactoryBonus = ({
  nft,
  onClaimSuccess,
  onClick,
  onError,
  showModal,
  suiBalance,
  walletObject,
  accumulatedSity,
  gameData,
  factoryLevel,
}: {
  nft: any;
  onClaimSuccess: () => void;
  onClick: () => void;
  onError: () => void;
  showModal: (message: string, bgColor: 0 | 1 | 2) => void;
  suiBalance: number;
  walletObject: any;
  accumulatedSity: number;
  gameData: any;
  factoryLevel: number;
}) => {
  const { wallet, signAndExecuteTransaction } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [bonusAmount, setBonusAmount] = useState<number>(0);

  const checkUserBalance = useCallback(() => {
    if (suiBalance < 0.005) {
      showModal("You need more SUI in order to pay gas.", 0);
      throw new Error("You should have more SUI in order to pay gas.");
    }
    return true;
  }, [suiBalance, showModal]);

  const formatBalance = (balance: number) => {
    if (balance >= 1000000) {
      return (balance / 1000000).toFixed(2) + "M";
    } else if (balance >= 1000) {
      return (balance / 1000).toFixed(2) + "k";
    }
    return balance.toFixed(2);
  };

  const calculateBonus = useCallback(() => {
    if (gameData && gameData.factory_bonuses) {
      const bonusPercentage = gameData.factory_bonuses[factoryLevel] || 0;
      const calculatedBonus = (accumulatedSity * bonusPercentage) / 100;
      setBonusAmount(calculatedBonus);
    }
  }, [accumulatedSity, factoryLevel, gameData]);

  useEffect(() => {
    calculateBonus();
  }, [calculateBonus]);

  const claimBonus = useCallback(async () => {
    if (!wallet.address) {
      showModal("🚫 Please connect a wallet first.", 0);
      return;
    }

    setIsProcessing(true);
    try {
      await checkUserBalance();

      const transaction = new Transaction();
      transaction.moveCall({
        target: `${ADDRESSES.PACKAGE}::nft::claim_factory_bonus`,
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

      const result = await signAndExecuteTransaction(transaction, {
        showEffects: true,
        showObjectChanges: true,
      });

      console.log("Claim successful:", result);
      showModal("✅ Bonus claimed successfully!", 1);
      onClaimSuccess();
    } catch (error) {
      console.error("Claim Error:", error);
      showModal(`🚫 Error: ${error}`, 0);
      onError();
    } finally {
      setIsProcessing(false);
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
    <div>
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
