import { useCallback, useMemo, useState } from "react";
import { ADDRESSES } from "../../addresses";
import { Transaction, coinWithBalance } from "@mysten/sui/transactions";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { MIST_PER_SUI } from "@mysten/sui/utils";
import useWallet from "../hooks/useWallet"; // Ensure correct path to your hook


const Upgrade = ({
  buildingType, // 0 for office, 1 for factory, 2 for house, 3 for entertainment_complex, 4 for castle
  officeLevel, // Level of the residential office
  factoryLevel, // Level of the factory
  houseLevel, // Level of the house
  enterLevel, // Level of the entertainment complex
  castleLevel,
  onUpgradeSuccess,
  onClick,
  onError,
  gameData, // Pass the gameData object containing cost_multiplier and other values
  showModal, // Add showModal as a prop
  // Add isTouchDevice as a prop
  suiBalance, // Receive SUI balance as prop
  sityBalance, // Receive SITY balance as prop
  nft, // Include the NFT object for transaction purposes
  isExpanded, // New prop
  walletObject

}: {
  buildingType: number;
  officeLevel: number;
  factoryLevel: number;
  houseLevel: number;
  enterLevel: number;
  castleLevel: number;
  onUpgradeSuccess: () => void;
  onClick: () => void;
  onError: () => void;
  suiBalance: number; // Add SUI balance as prop
  sityBalance: number; // Add SITY balance as prop
  gameData: any; // Add gameData as a prop
  showModal: (message: string, bgColor: 0 | 1 | 2) => void; // Define showModal prop type with message and bg
  isTouchDevice: boolean; // Define the type for isTouchDevice
  nft: any;
  isExpanded: boolean; // New prop
  walletObject: any;

}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const [castleUpgradeClicked, setCastleUpgradeClicked] = useState(false); // State to track castle upgrade button click
  const requiredTotalLevels = [2, 4, 6, 8, 10, 12, 13, 14]; // Required total levels for castle upgrades
  const totalOtherBuildingsLevel = useMemo(() => {
    return Number(officeLevel) + Number(factoryLevel) + Number(houseLevel) + Number(enterLevel);
  }, [officeLevel, factoryLevel, houseLevel, enterLevel]);
  const canUpgradeCastle = useMemo(() => {
    return totalOtherBuildingsLevel >= requiredTotalLevels[castleLevel];
  }, [totalOtherBuildingsLevel, castleLevel, requiredTotalLevels]);

  const { wallet, signAndExecuteTransaction } = useWallet();

  const { mutate: signAndExecute } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        requestType: "WaitForEffectsCert",
        options: {
          showRawEffects: true,
          showEffects: true,
          showBalanceChanges: true,
        },
      }),
  });

  const formatBalance = (balance: number) => {
    if (balance >= 1000000) {
      return (balance / 1000000).toFixed(2) + "M";
    } else if (balance >= 1000) {
      return (balance / 1000).toFixed(2) + "k";
    }
    return balance.toFixed(2);
  };

  // Memoized current level based on building type
  const currentLevel = useMemo(() => {
    switch (buildingType) {
      case 0:
        return officeLevel;
      case 1:
        return factoryLevel;
      case 2:
        return houseLevel;
      case 3:
        return enterLevel;
      case 4:
        return castleLevel;

      default:
        console.log("Unknown building type");
        return 0;
    }
  }, [buildingType, officeLevel, factoryLevel, houseLevel, enterLevel, castleLevel]);

  const handleCastleClick = () => {
    if (!canUpgradeCastle) {
      // Calculate how many more levels are needed
      const requiredLevels = requiredTotalLevels[castleLevel] - totalOtherBuildingsLevel;
      const message = `❗️ Total level of other buildings is insufficient to upgrade the castle. You need to upgrade other buildings by a total of ${requiredLevels} more levels.`;

      showModal(message, 0); // Show the modal with the specific info
      return;
    }

    if (isExpanded) {
      onClick();
      upgrade(); // Call the upgrade function
      console.log("Upgrade initiated...");
      if (!castleUpgradeClicked) {
        setCastleUpgradeClicked(true);
      }
    } else {
      onClick();
      if (!castleUpgradeClicked) {
        setCastleUpgradeClicked(true);
      }
      console.log("Building expanded, click again to upgrade.");
    }
  };




  // Memoized function to calculate the upgrade costs based on level and building type
  const getUpgradeCosts = useCallback(
    (level: number) => {
      const officeHouseCosts = [
        { sui: 0.5, sity: 0 },
        { sui: 0, sity: 680 },
        { sui: 2.5, sity: 0 },
        { sui: 0, sity: 3200 },
        { sui: 12.5, sity: 0 },
        { sui: 0, sity: 10300 },
        { sui: 46.5, sity: 0 },
        { sui: 0, sity: 0 },
      ];

      const factoryCosts = [
        { sui: 0, sity: 220 },
        { sui: 0, sity: 680 },
        { sui: 0, sity: 1540 },
        { sui: 5.8, sity: 0 },
        { sui: 0, sity: 6820 },
        { sui: 21.8, sity: 0 },
        { sui: 0, sity: 22000 },
        { sui: 0, sity: 0 },
      ];

      const enterCosts = [
        { sui: 0, sity: 220 },
        { sui: 1.1, sity: 0 },
        { sui: 0, sity: 1540 },
        { sui: 7, sity: 0 },
        { sui: 0, sity: 6800 },
        { sui: 21.8, sity: 0 },
        { sui: 0, sity: 22000 },
        { sui: 0, sity: 0 },
      ];

      const castleCosts = [
        { sui: 0.5, sity: 5500 },
        { sui: 1.1, sity: 13750 },
        { sui: 2.5, sity: 35200 },
        { sui: 5.8, sity: 88000 },
        { sui: 12.5, sity: 220000 },
        { sui: 21.8, sity: 550000 },
        { sui: 46.5, sity: 1375000 },
        { sui: 0, sity: 0 },
      ];

      const baseCosts =
        buildingType === 0 || buildingType === 2
          ? officeHouseCosts[level]
          : buildingType === 1 ? factoryCosts[level]
            : buildingType === 3 ? enterCosts[level] :
              castleCosts[level];

      const costMultiplier = gameData?.cost_multiplier || 100;
      return {
        sui:
          Math.round(
            baseCosts.sui * Number(MIST_PER_SUI) * (costMultiplier / 100) * 100
          ) / 100,
        sity:
          Math.round(baseCosts.sity * 1000 * (costMultiplier / 100) * 100) /
          100,
      };
    },
    [buildingType, gameData]
  );
  const costs = useMemo(
    () => getUpgradeCosts(currentLevel),
    [currentLevel, getUpgradeCosts]
  );

  // Function to check user's balance before initiating transaction
  const checkUserBalance = useCallback(() => {
    if (suiBalance < 0.01) {
      showModal("❗️ You need more SUI in order to pay gas.", 0);
      throw new Error("You need more SUI in order to pay gas.");
    }

    if (costs.sui > 0 && suiBalance * Number(MIST_PER_SUI) < costs.sui) {
      showModal("❗️ Insufficient SUI balance.", 0);
      throw new Error("Insufficient SUI balance.");
    }

    if (costs.sity > 0 && sityBalance * 1000 < costs.sity) {
      showModal("❗️ Insufficient SITY balance.", 0);
      throw new Error("Insufficient SITY balance.");
    }

    return true;
  }, [costs, suiBalance, sityBalance, showModal]);

  // Upgrade logic
  const upgrade = useCallback(async () => {
    try {
      setIsProcessing(true); // Set processing state
      console.log("Processing your upgrade...");

      const costs = getUpgradeCosts(currentLevel);

      // Check if the user has sufficient balance before proceeding
      checkUserBalance(); // Throws error if balance is insufficient

      const transactionBlock = new Transaction();

      // Handle SUI-based upgrades
      if (costs.sui > 0) {
        transactionBlock.moveCall({
          target: `${ADDRESSES.PACKAGE}::nft::upgrade_building_with_sui`,
          arguments: [
            transactionBlock.objectRef({
              objectId: nft.objectId,
              digest: nft.digest,
              version: nft.version,
            }),
            transactionBlock.object(ADDRESSES.GAME),
            transactionBlock.object(String(buildingType)),
            coinWithBalance({ balance: costs.sui }),
            transactionBlock.object(ADDRESSES.CLOCK),
          ],
        });
      }
      // Handle SITY-based upgrades
      else if (costs.sity > 0) {
        transactionBlock.setGasBudgetIfNotSet(10000000);
        console.log("Upgrade with SITY:", costs.sity * 1000);
        transactionBlock.moveCall({
          target: `${ADDRESSES.PACKAGE}::nft::upgrade_building_with_sity`,
          arguments: [
            transactionBlock.objectRef({
              objectId: nft.objectId,
              digest: nft.digest,
              version: nft.version,
            }),
            transactionBlock.object(ADDRESSES.GAME),
            transactionBlock.object(String(walletObject)),
            transactionBlock.object(String(buildingType)),
            transactionBlock.object(ADDRESSES.CLOCK),
          ],
        });
      }

      // Use signAndExecuteTransaction for executing the transaction
      const result = await signAndExecuteTransaction(transactionBlock, {
        showEffects: true,
        showObjectChanges: true,
      });

      console.log("Upgrade successful:", result);
      showModal("✅ Upgrade successful!", 1); // Show success message in the modal
      onUpgradeSuccess(); // Trigger the success callback
    } catch (error) {
      console.error("Upgrade Error:", error);
      showModal(`🚫 Error: ${error}`, 0); // Show error message in the modal
      onError(); // Trigger the error callback
    } finally {
      setIsProcessing(false); // Reset processing state
    }

  }, [
    wallet,
    signAndExecuteTransaction,
    nft,
    buildingType,
    currentLevel,
    getUpgradeCosts,
    signAndExecute,
    onUpgradeSuccess,
    onError,
    checkUserBalance, // Include the balance check logic in the dependencies
  ]);


  const checkUserBalanceCastle = useCallback(
    (isSui: boolean) => {
      if (suiBalance < 0.01) {
        showModal("❗️ You need more SUI to pay gas.", 0);
        throw new Error("You need more SUI to pay gas.");
      }

      if (isSui && suiBalance * Number(MIST_PER_SUI) < costs.sui) {
        showModal("❗️ Insufficient SUI balance.", 0);
        throw new Error("Insufficient SUI balance.");
      }

      if (!isSui && sityBalance * 1000 < costs.sity) {
        showModal("❗️ Insufficient SITY balance.", 0);
        throw new Error("Insufficient SITY balance.");
      }

      return true;
    },
    [costs, suiBalance, sityBalance, showModal]
  );


  const upgradeCastle = useCallback(
    async (useSui: boolean) => {

      setIsProcessing(true); // Set processing state
      console.log("Processing your upgrade...");

      const costs = getUpgradeCosts(currentLevel);
      try {
        setIsProcessing(true);
        checkUserBalanceCastle(useSui); // Check user's balance based on SUI or SITY usage

        const transactionBlock = new Transaction();
        transactionBlock.setSender(String(wallet.address));

        if (useSui) {
          // Upgrade with SUI
          transactionBlock.moveCall({
            target: `${ADDRESSES.PACKAGE}::nft::upgrade_building_with_sui`,
            arguments: [
              transactionBlock.objectRef({
                objectId: nft.objectId,
                digest: nft.digest,
                version: nft.version,
              }),
              transactionBlock.object(ADDRESSES.GAME),
              transactionBlock.object(String(buildingType)),
              coinWithBalance({ balance: costs.sui }),
              transactionBlock.object(ADDRESSES.CLOCK),
            ],
          });
        } else {
          // Upgrade with SITY
          transactionBlock.moveCall({
            target: `${ADDRESSES.PACKAGE}::nft::upgrade_building_with_sity`,
            arguments: [
              transactionBlock.objectRef({
                objectId: nft.objectId,
                digest: nft.digest,
                version: nft.version,
              }),
              transactionBlock.object(ADDRESSES.GAME),
              transactionBlock.object(String(walletObject)),
              transactionBlock.object(String(buildingType)),
              transactionBlock.object(ADDRESSES.CLOCK),
            ],
          });
        }

        // Use signAndExecuteTransaction for execution
        const result = await signAndExecuteTransaction(transactionBlock, {
          showEffects: true,
          showObjectChanges: true,
        });

        console.log("Castle upgrade successful:", result);
        showModal("✅ Upgrade successful!", 1); // Show success message in the modal
        onUpgradeSuccess(); // Trigger the success callback
        setCastleUpgradeClicked(false); // Reset castle upgrade state
      } catch (error) {
        console.error("Upgrade Error:", error);
        showModal(`🚫 Error: ${(error as Error).message}`, 0); // Show error message in the modal
        onError(); // Trigger the error callback
      } finally {
        setIsProcessing(false); // Reset processing state
      }

    },
    [wallet, signAndExecuteTransaction, nft, buildingType, costs, account, signAndExecute, checkUserBalance, onUpgradeSuccess, onError, showModal]
  );


  const handleClick = () => {
    if (isExpanded) {
      // Perform the upgrade logic only if the building is already expanded
      onClick();
      upgrade(); // Call the upgrade function
      console.log("Upgrade initiated...");
    } else {
      onClick();

      // Do nothing except expanding the building
      console.log("Building expanded, click again to upgrade.");
    }
  };

  return (
    <div>
      {currentLevel < 7 ? (
        <>
          {buildingType === 4 && !castleUpgradeClicked ? (
            <>
              <button
                onClick={handleCastleClick}
                disabled={isProcessing || !canUpgradeCastle}
              >
                {isProcessing ? "Processing..." : "Upgrade"}
              </button>

              {/* Display info when the upgrade is blocked */}
              {!canUpgradeCastle && (
                <p>
                  You need to upgrade other buildings by a total of{" "}
                  {requiredTotalLevels[castleLevel] - totalOtherBuildingsLevel}{" "}
                  more levels to unlock the castle upgrade.
                </p>
              )}
            </>
          ) : buildingType === 4 && castleUpgradeClicked ? (
            <>

              <button onClick={() => upgradeCastle(true)} disabled={isProcessing}>
                {isProcessing ? "Processing..." : `Upgrade for ${(costs.sui / Number(MIST_PER_SUI)).toFixed(2)} SUI`}
              </button>
              <button onClick={() => upgradeCastle(false)} disabled={isProcessing}>
                {isProcessing ? "Processing..." : `Upgrade for ${formatBalance(costs.sity / 1000)} SITY`}
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                handleClick(); // Handle the upgrade logic
              }}
              disabled={isProcessing} // Disable button if processing
            >
              {isProcessing
                ? "Processing..."
                : !isExpanded // If not expanded, show only "Upgrade"
                  ? "Upgrade"
                  : costs.sui > 0
                    ? `Upgrade for ${(costs.sui / Number(MIST_PER_SUI)).toFixed(2)} $SUI`
                    : `Upgrade for ${formatBalance(costs.sity / 1000)} $SITY`}
            </button>
          )}
        </>
      ) : (
        <p>Max level reached 🎉</p> // Message when the level is maxed out
      )}
    </div>
  );

};

export default Upgrade;
