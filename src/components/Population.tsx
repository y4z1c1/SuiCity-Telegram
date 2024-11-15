import React, { useEffect, useMemo, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import * as HoverCard from "@radix-ui/react-hover-card";

// Debounce utility function
const debounce = (func: (...args: any[]) => void, wait: number) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

interface PopulationProps {
  filteredNft: any; // The user's filtered NFT object
  accumulatedSity: number; // The accumulated SITY amount
  sityBalance: number; // The current SITY balance
  officeLevel: number; // Level of the residential office
  factoryLevel: number; // Level of the factory
  houseLevel: number; // Level of the house
  enterLevel: number; // Level of the entertainment complex
  castleLevel: number; // Level of the castle
  onPopulationUpdate: (population: number) => void; // New prop

}

const Population: React.FC<PopulationProps> = ({
  filteredNft,
  accumulatedSity,
  sityBalance,
  officeLevel,
  factoryLevel,
  houseLevel,
  enterLevel,
  castleLevel,
  onPopulationUpdate,
}) => {
  const account = useCurrentAccount(); // Get the current account
  const [hasUpdated, setHasUpdated] = useState(false); // State to track whether the update has happened
  const [lastDatabasePopulation, setLastDatabasePopulation] = useState(0); // Initialize with 0 or fetch from the database if available

  // Function to format the balance for readability
  const formatBalance = (balance: number) => {
    if (balance >= 1000000) {
      return (balance / 1000000).toFixed(2) + "M";
    } else if (balance >= 1000) {
      return (balance / 1000).toFixed(2) + "k";
    }
    return balance.toFixed(2);
  };

  const extractDomain = (nftName: string) => {
    const match = nftName.match(/^(.*?)'s City$/);
    return match ? match[1] : null;
  };

  // Helper function to calculate population based on building level
  const calculateForBuilding = (level: number) => {
    const basePopulation = 20000;
    let population = basePopulation;
    for (let i = 0; i < level; i++) {
      population = Math.floor((population * 18) / 10); // Multiply by 1.8
    }
    return population;
  };

  // Function to calculate population based on building levels
  const calculatePopulation = () => {

    // Population values for each building based on level
    const residentialOfficePopulation = calculateForBuilding(officeLevel);
    const housePopulation = calculateForBuilding(houseLevel);
    const factoryPopulation = calculateForBuilding(factoryLevel);
    const entertainmentPopulation = calculateForBuilding(enterLevel);
    const castlePopulation = calculateForBuilding(castleLevel);

    // Calculate domain bonus based on NFT name length
    const nftName = filteredNft?.content?.fields?.name || "";
    const domain = extractDomain(nftName);
    let domainBonus = 0;
    if (domain && domain.length === 3) {
      domainBonus = 2000000; // Add 2 million if domain length is 3
    } else if (domain && domain.length === 4) {
      domainBonus = 1000000; // Add 1 million if domain length is 4
    }

    return (
      residentialOfficePopulation +
      housePopulation +
      factoryPopulation +
      entertainmentPopulation +
      castlePopulation +
      domainBonus // Add domain bonus to total population
    );
  };

  // Calculate domain bonus based on NFT name length
  const nftName = filteredNft?.content?.fields?.name || "";
  const domain = extractDomain(nftName);
  let domainBonus = 0;
  if (domain && domain.length === 3) {
    domainBonus = 2000000; // Add 2 million if domain length is 3
  } else if (domain && domain.length === 4) {
    domainBonus = 1000000; // Add 1 million if domain length is 4
  }

  // Memoize the population and totalPopulation calculation to prevent recalculations
  const population = useMemo(() => calculatePopulation(), [officeLevel, houseLevel, factoryLevel, enterLevel, castleLevel, filteredNft]);
  const totalPopulation = useMemo(() => population + Number((accumulatedSity + sityBalance) + 100000 * (filteredNft?.content?.fields?.extra_data?.[0] || 0)), [population, accumulatedSity, sityBalance, filteredNft]);

  // Function to call the Netlify function to update the population in MongoDB
  const updatePopulation = async () => {
    if (!account?.address) {
      console.error("No account address found");
      return;
    }


    try {
      const response = await fetch("/.netlify/functions/add-population", {
        method: "POST",
        body: JSON.stringify({
          walletAddress: account.address,
          population: totalPopulation,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("Failed to update population");

      } else {
        console.log("Population updated successfully");
        setLastDatabasePopulation(totalPopulation); // Update the last database population

      }
    } catch (error) {
      console.error("Error updating population:", error);
    }
  };

  // Debounced version of updatePopulation
  const debouncedUpdatePopulation = debounce(updatePopulation, 5000); // Debounce with 5-second delay

  // Trigger updatePopulation only when sityBalance and accumulatedSity are available and it has not updated yet
  useEffect(() => {
    if (sityBalance && accumulatedSity && account?.address && !hasUpdated) {
      debouncedUpdatePopulation(); // Debounced call
      onPopulationUpdate(totalPopulation); // Pass totalPopulation to parent

      setHasUpdated(true); // Set the flag so it only updates once
    }
  }, [population, accumulatedSity, sityBalance, filteredNft, hasUpdated]);


  useEffect(() => {
    if (account?.address && totalPopulation > lastDatabasePopulation + 5000) {
      // Update the parent component with the latest population
      onPopulationUpdate(totalPopulation);

      setHasUpdated(true);
    }
  }, [totalPopulation, account?.address]);



  return (
    <div className="population">
      <div className="population-top">
        <HoverCard.Root>
          <h2>
            <HoverCard.Trigger asChild>
              <img
                src="https://bafybeiahevtcpw4pxgklnglmoayfoer3asgha6ajk3pxbu35g4npwb54ey.ipfs.w3s.link/peop1.webp"
                alt="people-icon"
                className="people-icon"
                style={{
                  width: "30px",
                  height: "30px",
                  marginRight: "5px",
                  transform: "translateY(5px)",
                  cursor: "help",
                }}
              />
            </HoverCard.Trigger>

            {`${formatBalance(totalPopulation)}`}
          </h2>

          <HoverCard.Portal container={document.getElementById("game-container-wrapper")}>
            <HoverCard.Content
              className="HoverCardContent"
              align="end"
              sideOffset={25}
              side="top"
              alignOffset={-120}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <div className="Text bold">Population</div>
                <div className="Text faded">Your population breakdown:</div>

                <div className="Text faded">
                  <strong>Office Level {officeLevel}:</strong> {formatBalance(calculateForBuilding(officeLevel))} residents
                </div>

                <div className="Text faded">
                  <strong>House Level {houseLevel}:</strong> {formatBalance(calculateForBuilding(houseLevel))} residents
                </div>

                <div className="Text faded">
                  <strong>Factory Level {factoryLevel}:</strong> {formatBalance(calculateForBuilding(factoryLevel))} residents
                </div>

                <div className="Text faded">
                  <strong>E. Complex Level {enterLevel}:</strong> {formatBalance(calculateForBuilding(enterLevel))} residents
                </div>

                <div className="Text faded">
                  <strong>Castle Level {castleLevel}:</strong> {formatBalance(calculateForBuilding(castleLevel))} residents
                </div>

                {domainBonus > 0 && (
                  <div className="Text faded">
                    <strong>Domain Bonus:</strong> {formatBalance(domainBonus)} residents
                  </div>
                )}

                <div className="Text faded">
                  <strong>Extra residents:</strong> {formatBalance((100000 * filteredNft.content.fields.extra_data[0]) + parseInt((Number(accumulatedSity + sityBalance)).toString()))} residents
                </div>



              </div>

              <HoverCard.Arrow className="HoverCardArrow" width={20} height={10} />
            </HoverCard.Content>
          </HoverCard.Portal>
        </HoverCard.Root>
      </div>

      <p>Population</p>

      <button
        onClick={() => {
          const sity = (
            accumulatedSity +
            filteredNft.content.fields.balance / 1000
          ).toFixed(2);
          const tweetText = `I just reached a population of ${formatBalance(
            totalPopulation + parseInt(sity)
          )} on SuiCity with ${formatBalance(
            Number(sityBalance) + parseInt(sity)
          )} $SITY! 🚀 Check out the game now! @SuiCityP2E`;
          const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            tweetText
          )}&url=https://play.suicityp2e.com`;

          window.open(twitterUrl, "_blank");
        }}
      >
        Share on Twitter
      </button>
    </div>
  );
};

export default Population;
