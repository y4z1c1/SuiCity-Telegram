import React, { useEffect, useState, useRef, useCallback } from "react";
import Claim from "./Claim"; // Import the Claim component
import * as HoverCard from "@radix-ui/react-hover-card";

interface AccumulationProps {
  nft: any; // NFT object containing levels and timestamps
  gameData: any; // Game data containing accumulation speeds and bonuses
  isTransactionInProgress: boolean; // Indicates if a transaction is in progress
  onAccumulatedSityUpdate: (sity: number) => void; // Callback to update accumulated SITY
  onCountdownUpdate: (countdown: number) => void; // Callback to update countdown timer
  showModal: (message: string, bgColor: 0 | 1 | 2) => void; // Modal handler for success/error messages
  onClaimSuccess: () => void; // Callback when claim is successful
  onClaimError: () => void; // Callback when claim fails
  suiBalance: number; // Pass the user's SUI balance
  officeLevel: number; // Level of the residential office
  factoryLevel: number; // Level of the factory
  houseLevel: number; // Level of the house
  enterLevel: number; // Level of the entertainment complex
  walletObject: any; // Wallet object containing user's SUI and SITY balances
}

const Accumulation: React.FC<AccumulationProps> = ({
  nft,
  gameData,
  isTransactionInProgress,
  onAccumulatedSityUpdate,
  onCountdownUpdate,
  showModal,
  onClaimSuccess,
  onClaimError,
  suiBalance,
  officeLevel,
  houseLevel,
  factoryLevel,
  enterLevel,
  walletObject,
}) => {
  const [accumulatedSity, setAccumulatedSity] = useState<number>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const accumulationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const factoryBonus = gameData.factory_bonuses[factoryLevel];

  const calculateAccumulatedSity = useCallback(
    (nft: any) => {
      if (!nft || !gameData) return 0;

      // Fetch relevant fields from the NFT data
      const lastAccumulatedTimestamp =
        nft.content.fields?.last_accumulated || 0;
      const lastClaimedTimestamp = nft.content.fields?.last_claimed || 0;

      // Get current time and calculate time elapsed
      const currentTime = Date.now();
      const elapsedTime = currentTime - lastAccumulatedTimestamp;
      const elapsedTimeFromClaim = currentTime - lastClaimedTimestamp;

      // Calculate the maximum accumulation period based on house and entertainment levels
      const maxAccumulationPeriod = calculateMaxAccumulation(
        houseLevel,
        enterLevel
      );

      // Calculate the effective elapsed time by limiting to the max accumulation period
      let effectiveElapsedTime;

      if (elapsedTimeFromClaim <= maxAccumulationPeriod) {
        effectiveElapsedTime = elapsedTime;
      } else {
        effectiveElapsedTime =
          maxAccumulationPeriod -
          (lastAccumulatedTimestamp - lastClaimedTimestamp);
      }

      // If no effective time has passed, return 0
      if (effectiveElapsedTime <= 0) return 0;

      // Fetch the accumulation speed based on the residential office level
      const accumulationPerHour = gameData.accumulation_speeds[officeLevel];

      // Calculate the accumulated SITY based on effective elapsed time (in hours)
      const accumulatedSityMs =
        effectiveElapsedTime * accumulationPerHour * gameData.speed;

      const accumulatedSity = accumulatedSityMs / 3600000;

      // Log and return accumulated SITY (adjust division by 100 as needed)
      return accumulatedSity / 1000;
    },
    [nft, gameData]
  );

  // Function to calculate the countdown timer based on house and entertainment levels
  const calculateCountdown = useCallback(() => {
    const maxTime = calculateMaxAccumulation(houseLevel, enterLevel);
    const currentTime = Date.now();
    const lastClaimedTimestamp = nft.content.fields?.last_claimed;
    const elapsedTime = currentTime - lastClaimedTimestamp;
    const remainingTime = maxTime - elapsedTime;

    return remainingTime > 0 ? remainingTime : 0;
  }, [nft]);

  // Function to calculate the maximum accumulation period based on house and entertainment levels
  const calculateMaxAccumulation = (
    houseLevel: number,
    entertainmentLevel: number
  ): number => {
    const totalLevel =
      parseInt(houseLevel.toString()) + parseInt(entertainmentLevel.toString());

    if (totalLevel === 0) {
      return (3 * 3600 * 1000) / gameData.speed;
    } else if (totalLevel <= 7) {
      return ((3 + totalLevel) * 3600 * 1000) / gameData.speed;
    }

    return ((10 + 2 * (totalLevel - 7)) * 3600 * 1000) / gameData.speed;
  };

  // Function to start accumulation and countdown intervals
  const startAccumulationAndCountdown = useCallback(() => {
    if (!nft) return;

    if (accumulationIntervalRef.current)
      clearInterval(accumulationIntervalRef.current);
    if (countdownIntervalRef.current)
      clearInterval(countdownIntervalRef.current);

    // Start accumulation interval
    accumulationIntervalRef.current = setInterval(() => {
      const newAccumulatedSity = calculateAccumulatedSity(nft);
      setAccumulatedSity(newAccumulatedSity);
      onAccumulatedSityUpdate(newAccumulatedSity);
    }, 100); // Update every second

    // Start countdown interval
    countdownIntervalRef.current = setInterval(() => {
      const newCountdown = calculateCountdown();
      setCountdown(newCountdown);
      onCountdownUpdate(newCountdown);
    }, 1000); // Update every second
  }, [
    nft,
    isTransactionInProgress,
    calculateAccumulatedSity,
    calculateCountdown,
    onAccumulatedSityUpdate,
    onCountdownUpdate,
  ]);

  useEffect(() => {
    startAccumulationAndCountdown();

    return () => {
      if (accumulationIntervalRef.current)
        clearInterval(accumulationIntervalRef.current);
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);
    };
  }, [startAccumulationAndCountdown]);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  // Define the onClick handler to be passed to Claim component
  const handleClick = () => {
    console.log("Claim button clicked");
  };

  const formatBalance = (balance: number) => {
    if (balance >= 1000) {
      return (balance / 1000).toFixed(2) + "k";
    }
    return balance.toFixed(2);
  };

  return (
    <div className="accumulated">
      <div className="accumulated-top">
        <HoverCard.Root>


          <h2>
            <HoverCard.Trigger asChild>

              <img
                src="https://bafybeiahevtcpw4pxgklnglmoayfoer3asgha6ajk3pxbu35g4npwb54ey.ipfs.w3s.link/coins1.webp"
                alt="coin-icon"
                className="coin-icon"
                style={{
                  width: "30px",
                  height: "30px",
                  marginRight: "5px",
                  borderRadius: "50%",
                  transform: "translateY(5px)",
                  cursor: "help",
                }}
              />
            </HoverCard.Trigger>

            {`${formatBalance(parseFloat((accumulatedSity + nft.content.fields.balance / 1000).toFixed(
              2
            )))} $SITY`}
          </h2>


          <HoverCard.Portal container={document.getElementById("game-container-wrapper")}>
            <HoverCard.Content
              className="HoverCardContent"
              align="start"
              sideOffset={25}
              side="top"
              alignOffset={-40}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <div className="Text bold">Accumulated $SITY</div>
                <div className="Text faded">You currently accumulated <strong>{`${formatBalance(parseFloat((accumulatedSity + nft.content.fields.balance / 1000).toFixed(
                  2
                )))} $SITY`}</strong></div>
                <div className="Text faded">Your factory provides <strong>{`${formatBalance((factoryBonus / 100) * parseFloat((accumulatedSity + nft.content.fields.balance / 1000).toFixed(
                  2
                )))} $SITY`}</strong> bonus.</div>


              </div>

              <HoverCard.Arrow className="HoverCardArrow" width={20} height={10} />
            </HoverCard.Content>
          </HoverCard.Portal>

        </HoverCard.Root>

      </div>
      <p>{countdown ? `⌛︎ ${formatTime(countdown)}` : "Full, claim to restart accumulation"}</p>
      <Claim
        nft={nft}
        onClaimSuccess={onClaimSuccess}
        onClick={handleClick}
        onError={onClaimError}
        showModal={showModal}
        suiBalance={suiBalance}
        walletObject={walletObject}
      />


      <div className="accumulated-bottom">
      </div>

    </div>

  );
};

export default Accumulation;
