import React, { useEffect, useRef, useState } from "react";
import Upgrade from "./Upgrade";
import ClaimFactoryBonus from "./ClaimFactoryBonus";


interface BuildingProps {
  nft: any; // NFT object
  currentBuilding: any; // Information about the current building (type, field, etc.)
  officeLevel: number; // Level of the residential office
  factoryLevel: number; // Level of the factory
  houseLevel: number; // Level of the house
  enterLevel: number; // Level of the entertainment complex
  castleLevel: number; // Level of the castle
  gameData: any; // Game data, including bonuses and accumulation speeds
  factoryBonusCountdown: number | null; // Countdown timer for factory bonus
  suiBalance: number; // User's SUI balance
  sityBalance: number; // User's SITY balance
  isTouchDevice: boolean; // Boolean to check if the user is on a touch device
  isTransactionInProgress: boolean; // Whether a transaction is in progress
  onClaimSuccess: () => void; // Callback on successful claim
  onClaimError: () => void; // Callback on claim error
  onUpgradeError: () => void; // Callback on upgrade error
  onUpgradeSuccess: () => void; // Callback on successful upgrade
  showModal: (message: string, bgColor: 0 | 1 | 2) => void; // Modal for showing feedback messages
  onUpgradeClick: (buildingType: number) => void; // Callback for when an upgrade is clicked
  onClaimClick: () => void; // Callback for when a claim is clicked
  buildingIndex: number; // Index of the current building
  preloadedVideoUrl?: string; // Add this prop
  walletObject: any; // Wallet object containing user's SUI and SITY balances
  accumulatedSity: number; // Add this prop for accumulated SITY


}

const Building: React.FC<BuildingProps> = ({
  nft,
  currentBuilding,
  officeLevel,
  factoryLevel,
  houseLevel,
  enterLevel,
  castleLevel,
  gameData,
  factoryBonusCountdown,
  suiBalance,
  sityBalance,
  isTouchDevice,
  onClaimSuccess,
  onClaimError,
  onUpgradeError,
  onUpgradeSuccess,
  showModal,
  onUpgradeClick,
  onClaimClick,
  buildingIndex,
  preloadedVideoUrl,
  walletObject,
  accumulatedSity, // Include the accumulated SITY value here

}) => {
  const [isUpgradeInfoExpanded, setIsUpgradeInfoExpanded] = useState(false);
  const buildingRef = useRef<HTMLDivElement>(null);
  const [isLoadingNewLevel, setIsLoadingNewLevel] = useState(false); // New state for image loading
  const videoRef = useRef<HTMLVideoElement | null>(null); // Reference to the video element
  const [isVideoPreloaded, setIsVideoPreloaded] = useState(false); // State for video preload
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>(""); // State to track the current video URL


  const handleUpgradeClick = () => {
    setIsUpgradeInfoExpanded(true);
    onUpgradeClick(buildingIndex);
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handleUpgradeError = () => {
    // Call the original onUpgradeSuccess callback
    onUpgradeError();

    // Wait 1 second before collapsing the expanded view
    setTimeout(() => {
      setIsUpgradeInfoExpanded(false);
    }, 1000);
  };

  // New function to preload all assets
  const preloadAssets = async () => {

    let assetsToLoad = [
      `${currentBuilding.buildingUrl}/${officeLevel}.webp`,
      `${currentBuilding.buildingUrl}/${factoryLevel}.webp`,
      `${currentBuilding.buildingUrl}/${houseLevel}.webp`,
      `${currentBuilding.buildingUrl}/${enterLevel}.webp`,
      `${currentBuilding.buildingUrl}/${castleLevel}.webp`,
      `${currentBuilding.videoBase}/${officeLevel}.webm`,
      `${currentBuilding.videoBase}/${factoryLevel}.webm`,
      `${currentBuilding.videoBase}/${houseLevel}.webm`,
      `${currentBuilding.videoBase}/${enterLevel}.webm`,
    ];

    if (isTouchDevice) {
      assetsToLoad = [
        `${currentBuilding.buildingUrl}/${officeLevel}.webp`,
        `${currentBuilding.buildingUrl}/${factoryLevel}.webp`,
        `${currentBuilding.buildingUrl}/${houseLevel}.webp`,
        `${currentBuilding.buildingUrl}/${enterLevel}.webp`,
        `${currentBuilding.buildingUrl}/${castleLevel}.webp`,

      ];
    }

    await Promise.all(
      assetsToLoad.map((url) =>
        new Promise<void>((resolve) => {
          const imgOrVid = url.endsWith(".webm") ? document.createElement('video') : new Image();
          imgOrVid.onload = () => resolve();
          imgOrVid.src = url;
        })
      )
    );
  };

  // Load assets when the component mounts or when the building changes
  useEffect(() => {
    preloadAssets();
  }, [currentBuilding]);

  // Determine the current level based on the building type
  const currentLevel =
    currentBuilding.type === "Office"
      ? Number(officeLevel)
      : currentBuilding.type === "Factory"
        ? Number(factoryLevel)
        : currentBuilding.type === "House"
          ? Number(houseLevel)
          : currentBuilding.type === "Entertainment Complex"
            ? Number(enterLevel)
            : Number(castleLevel);



  // Function to generate the video URL based on the current building level
  const generateVideoUrl = (level: number) => {
    return `${currentBuilding.videoBase}/${level}.webm`;
  };

  useEffect(() => {
    if (isTouchDevice) {
      return;
    }
    const videoElement = videoRef.current;
    if (videoElement && preloadedVideoUrl) {
      // Set the source to the preloaded object URL
      videoElement.src = preloadedVideoUrl;

      // Load and play the video
      videoElement.load();

      const playPromise = videoElement.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Error attempting to play video:", error);
        });
      }
    }
  }, [preloadedVideoUrl]);

  useEffect(() => {
    if (isTouchDevice) {
      return;
    }
    const newVideoUrl = generateVideoUrl(currentLevel);
    setCurrentVideoUrl(newVideoUrl);
    // No need to manually load or play the video
  }, [currentLevel, currentBuilding.videoBase]);
  useEffect(() => {
    if (isTouchDevice) {
      return;
    }
    const videoElement = videoRef.current;
    if (videoElement) {
      // Pause the video before changing the source
      videoElement.pause();
      // Update the source
      videoElement.src = currentVideoUrl;
      // Load the new video
      videoElement.load();

      // Define the event handler
      const handleLoadedData = () => {
        // Play the video once it's ready
        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Error attempting to play video:", error);
          });
        }
      };

      // Add event listener
      videoElement.addEventListener("loadeddata", handleLoadedData);

      // Clean up the event listener on unmount or when currentVideoUrl changes
      return () => {
        videoElement.removeEventListener("loadeddata", handleLoadedData);
      };
    }
  }, [currentVideoUrl]);

  const handleUpgradeSuccess = () => {
    // Call the original onUpgradeSuccess callback

    // Wait 1 second before collapsing the expanded view
    setTimeout(() => {
      setIsUpgradeInfoExpanded(false);
    }, 500);

    // Set loading state until new image is loaded
    setIsLoadingNewLevel(true);


    // Simulate loading new image (until it is fully loaded)
    const img = new Image();
    img.src = `${currentBuilding.buildingUrl}/${currentLevel + 1}.webp`;

    img.onload = () => {
      // Once the image is loaded, hide the loading screen
      setIsLoadingNewLevel(false);

      // Update the video URL to reflect the new building level
      const newVideoUrl = generateVideoUrl(currentLevel + 1);
      setCurrentVideoUrl(newVideoUrl);

      // Set the initial video URL when the component mounts
      useEffect(() => {
        setCurrentVideoUrl(generateVideoUrl(currentLevel));
      }, [currentLevel, currentBuilding.videoBase]);

      // Reload and play the new video
      if (videoRef.current) {
        videoRef.current.load(); // Reload the video
        videoRef.current.play(); // Play the video automatically
      }
    };

    onUpgradeSuccess();
  };

  // Use Intersection Observer to lazy-load the video when the building is close to visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Preload the video
            const videoElement = videoRef.current;
            if (videoElement && !isVideoPreloaded) {
              videoElement.load();
              setIsVideoPreloaded(true);
            }
          }
        });
      },
      { threshold: 0.1 } // Trigger when 10% of the building is visible
    );

    if (buildingRef.current) {
      observer.observe(buildingRef.current);
    }

    return () => {
      if (buildingRef.current) {
        observer.unobserve(buildingRef.current);
      }
    };
  }, [isVideoPreloaded]);



  return (
    <>


      <div
        ref={buildingRef}

        className={`buildingType ${isTouchDevice
          ? currentLevel < 7
            ? "expanded"
            : "collapsed"
          : isUpgradeInfoExpanded && currentLevel < 7
            ? "expanded"
            : "collapsed"
          }`}

      >



        {/* Add a loading overlay when upgrading */}
        {isLoadingNewLevel && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Loading new level...</p>
          </div>
        )}
        <div className="buildingType-top">
          <h2>{`${currentBuilding.type} Level: ${currentLevel}`}</h2>

        </div>

        {isUpgradeInfoExpanded && (
          <div className="additional-info">

            {/* Building Images */}
            <div className="building-images">
              <div className="building-image">
                <img
                  src={`${currentBuilding.buildingUrl}/${currentLevel}.webp`}
                  alt="Current Level"
                  className="building-image-zoom"
                />
                <p className="level-text current-level">{`Level ${currentLevel}`}</p>
              </div>

              {/* Arrow Between Images */}
              <div className="level-arrow">
                <p>➔</p>
              </div>

              <div className="building-image">
                <img
                  src={`${currentBuilding.buildingUrl}/${currentLevel + 1}.webp`}
                  alt="Next Level"
                  className="building-image-zoom"
                />
                <p className="level-text next-level">{`Level ${currentLevel + 1
                  }`}</p>
              </div>
            </div>

            {/* Upgrade Benefit Text */}
            <div className="upgrade-benefit">
              {currentBuilding.type === "Office" && (
                <>
                  <p style={{ color: "lightgray", fontSize: "14px" }}>
                    Accumulation Speed:
                  </p>
                  <p
                    className="benefit-value"
                    style={{ color: "lightgray", fontSize: "16px" }}
                  >
                    {`${gameData.accumulation_speeds[currentLevel] / 1000
                      } $SITY/hour`}
                  </p>

                  <h4
                    style={{
                      color: "lightgreen",
                      fontSize: "18px",
                      marginTop: "10px",
                      marginBottom: "0px",
                    }}
                  >
                    Accumulation Speed (Next Level):
                  </h4>
                  <h4
                    className="benefit-value next-level"
                    style={{
                      color: "lightgreen",
                      fontSize: "20px",
                      fontWeight: "bold",
                      marginBottom: "0px",
                    }}
                  >
                    {`${gameData.accumulation_speeds[currentLevel + 1] / 1000
                      } $SITY/hour`}

                  </h4>

                  <p className="info-text" >
                    The Office level affects hourly $SITY earnings. Additionally, thanks to dNFT technology, upgrading your building will change the appearance, metadata, and rarity of your NFT.

                  </p>

                  <a
                    target="_blank"
                    className="details"
                    href="https://docs.suicityp2e.com/buildings/office"
                    style={{ color: "lightblue", fontSize: "14px", textDecoration: "underline" }}
                  >
                    more details
                  </a>
                </>
              )}

              {currentBuilding.type === "Factory" && (
                <>
                  <p style={{ color: "lightgray", fontSize: "14px" }}>
                    Factory Bonus:
                  </p>
                  <p
                    className="benefit-value"
                    style={{ color: "lightgray", fontSize: "16px" }}
                  >
                    {`${gameData.factory_bonuses[currentLevel]}%`}
                  </p>

                  <h4
                    style={{
                      color: "lightgreen",
                      fontSize: "18px",
                      marginTop: "10px",
                    }}
                  >
                    Factory Bonus (Next Level):
                  </h4>
                  <h4
                    className="benefit-value next-level"
                    style={{
                      color: "lightgreen",
                      fontSize: "20px",
                      fontWeight: "bold",
                    }}
                  >
                    {`${gameData.factory_bonuses[currentLevel + 1]}%`}
                  </h4>

                  <p className="info-text" >
                    The Factory level affects percentage of daily revenue that can be collected. Additionally, thanks to dNFT technology, upgrading your building will change the appearance, metadata, and rarity of your NFT.

                  </p>

                  <a
                    target="_blank"
                    className="details"
                    href="https://docs.suicityp2e.com/buildings/factory"
                    style={{ color: "lightblue", fontSize: "14px", textDecoration: "underline" }}
                  >
                    more details
                  </a>
                </>
              )}

              {(currentBuilding.type === "House") && (
                <>
                  <p style={{ color: "lightgray", fontSize: "14px" }}>
                    Amenity Points:
                  </p>
                  <p
                    className="benefit-value"
                    style={{ color: "lightgray", fontSize: "16px" }}
                  >
                    {Number(houseLevel) + Number(enterLevel)}
                  </p>

                  <h4
                    style={{
                      color: "lightgreen",
                      fontSize: "18px",
                      marginTop: "10px",
                    }}
                  >
                    Amenity Points (Next Level):
                  </h4>
                  <h4
                    className="benefit-value next-level"
                    style={{
                      color: "lightgreen",
                      fontSize: "20px",
                      fontWeight: "bold",
                    }}
                  >
                    {Number(houseLevel) + Number(enterLevel) + 1}
                  </h4>

                  <p className="info-text" >
                    The House level affects Amenity points, impacting the frequency at which the player is required to claim rewards. Additionally, thanks to dNFT technology, upgrading your building will change the appearance, metadata, and rarity of your NFT.

                  </p>

                  <a
                    target="_blank"
                    className="details"
                    href="https://docs.suicityp2e.com/buildings/house"
                    style={{ color: "lightblue", fontSize: "14px", textDecoration: "underline" }}
                  >
                    more details
                  </a>


                </>
              )}

              {(currentBuilding.type === "Entertainment Complex") && (
                <>
                  <p style={{ color: "lightgray", fontSize: "14px" }}>
                    Amenity Points:
                  </p>
                  <p
                    className="benefit-value"
                    style={{ color: "lightgray", fontSize: "16px" }}
                  >
                    {Number(houseLevel) + Number(enterLevel)}
                  </p>

                  <h4
                    style={{
                      color: "lightgreen",
                      fontSize: "18px",
                      marginTop: "10px",
                    }}
                  >
                    Amenity Points (Next Level):
                  </h4>
                  <h4
                    className="benefit-value next-level"
                    style={{
                      color: "lightgreen",
                      fontSize: "20px",
                      fontWeight: "bold",
                    }}
                  >
                    {Number(houseLevel) + Number(enterLevel) + 1}
                  </h4>

                  <p className="info-text" >
                    The Entertainment C. level affects Amenity points, impacting the frequency at which the player is required to claim rewards. Additionally, thanks to dNFT technology, upgrading your building will change the appearance, metadata, and rarity of your NFT.
                  </p>

                  <a
                    target="_blank"
                    className="details"
                    href="https://docs.suicityp2e.com/buildings/entertainment-complex"
                    style={{ color: "lightblue", fontSize: "14px", textDecoration: "underline" }}
                  >
                    more details
                  </a>

                </>
              )}

              {(currentBuilding.type === "Castle") && (
                <>
                  <p style={{ color: "lightgray", fontSize: "14px" }}>
                    War Power:
                  </p>
                  <p
                    className="benefit-value"
                    style={{ color: "lightgray", fontSize: "16px" }}
                  >
                    {gameData.castle_powers[currentLevel]}
                  </p>

                  <h4
                    style={{
                      color: "lightgreen",
                      fontSize: "18px",
                      marginTop: "10px",
                    }}
                  >
                    War Power (Next Level):
                  </h4>
                  <h4
                    className="benefit-value next-level"
                    style={{
                      color: "lightgreen",
                      fontSize: "20px",
                      fontWeight: "bold",
                    }}
                  >
                    {gameData.castle_powers[Number(currentLevel) + 1]}
                  </h4>

                  <p className="info-text" >
                    As your Castle level increases, your probability of winning against your opponents increases. You will soon be able to battle with bots. ⚔️
                  </p>

                  <a
                    target="_blank"
                    className="details"
                    href="https://docs.suicityp2e.com/buildings/castle"
                    style={{ color: "lightblue", fontSize: "14px", textDecoration: "underline" }}
                  >
                    more details
                  </a>

                </>
              )}
              <div
                style={{

                  marginBottom: "6%",
                }}>

              </div>

            </div>
          </div>
        )}

        {/* Factory-specific bonus logic */}
        {currentBuilding.type === "Factory" ? (
          <div>
            {factoryBonusCountdown !== null && factoryBonusCountdown > 0 ? (
              <p>{`⌛︎ ${formatTime(factoryBonusCountdown)}`}</p>
            ) : (
              <ClaimFactoryBonus
                nft={nft}
                onClick={onClaimClick}
                onClaimSuccess={onClaimSuccess}
                onError={onClaimError}
                showModal={showModal}
                suiBalance={suiBalance}
                walletObject={walletObject}
                accumulatedSity={accumulatedSity}    // Assuming sityBalance is accumulated SITY
                gameData={gameData}              // Pass gameData prop
                factoryLevel={factoryLevel}      // Pass factoryLevel prop
              />
            )}
          </div>
        ) : null}
        <Upgrade
          nft={nft}
          buildingType={buildingIndex}
          officeLevel={officeLevel}
          factoryLevel={factoryLevel}
          houseLevel={houseLevel}
          enterLevel={enterLevel}
          castleLevel={castleLevel}
          onUpgradeSuccess={handleUpgradeSuccess}
          onClick={handleUpgradeClick}
          onError={handleUpgradeError}
          gameData={gameData}
          showModal={showModal}
          suiBalance={suiBalance}
          sityBalance={sityBalance}
          isTouchDevice={isTouchDevice}
          isExpanded={isUpgradeInfoExpanded}
          walletObject={walletObject}
        />
      </div>
      {/* Background video */}
      {
        !isTouchDevice ? (
          <video
            playsInline
            webkit-playsinline="true"
            autoPlay
            muted
            loop
            className="building-background-video"
            ref={videoRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: -1,
              pointerEvents: "none", // Prevent user interaction
            }}
          />
        ) : null
      }



    </>
  );
};

export default Building;