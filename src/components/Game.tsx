import "../assets/styles/Game.css";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import Balances from "./Balances"; // Import the new Balances component
import Accumulation from "./Accumulation"; // Import the new Balances component
import Building from "./Building"; // Import the Building component
import { ADDRESSES } from "../../addresses";
import { BURN } from "../../burn";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import Modal from "./Modal"; // Import the new Modal component
import NftSpecs from "./NftSpecs";
import Population from "./Population";
import NftTech from "./NftTech";
import Reference from "./Reference";
import Leaderboard from "./Leaderboard";
import Burn from "./Burn";
import ClaimReward from "./ClaimReward";
import ChangeName from "./ChangeName";
import "../assets/styles/HoverCard.css";
import SingleplayerWar from "./SingleplayerWar";
import Partner from "./Partner";
import Wallet from "./Wallet";
import Mint from "./Mint";



const Game: React.FC = () => {

  const [connected, setConnectedWallet] = useState<string | null>(null);



  useEffect(() => {
    if (connected) {
      document.body.classList.remove("disconnected"); // Set background for connected wallet
    } else {
      document.body.classList.add("disconnected"); // Set background for disconnected wallet
    }
  }, [connected]);

  const account = { address: connected };
  const [filteredNft, setFilteredNft] = useState<any>(null); // Storing only a single filtered NFT
  const [domains, setDomains] = useState<any[]>([]);


  const [accumulatedSity, setAccumulatedSity] = useState<number>(0);
  const [gameData, setGameData] = useState<any>(null);
  const [sityBalance, setSityBalance] = useState<number>(0);
  const [suiBalance, setSuiBalance] = useState<number>(0);
  const [isTransactionInProgress, setTransactionInProgress] = useState(false);
  const [transactionType, setTransactionType] = useState<string | null>(null); // Tracks current transaction type
  const [, setCountdown] = useState<number | null>(null);
  const [factoryBonusCountdown, setFactoryBonusCountdown] = useState<
    number | null
  >(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Add loading state
  const [isAwaitingBlockchain, setIsAwaitingBlockchain] =
    useState<boolean>(false);
  const accumulationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [, setIsUpgradeInfoExpanded] = useState(false); // Track whether upgrade info is expanded
  const [isMobileExpanded, setIsMobileExpanded] = useState(false); // Track whether building is expanded on mobile
  const [bgColor, setBgColor] = useState<0 | 1 | 2>(0); // Default to red (0)
  const [currentBuildingIndex, setCurrentBuildingIndex] = useState<number>(0); // Track current building in the carousel
  const [refreshBalances, setRefreshBalances] = useState(false); // State to trigger balance refresh
  const [, setIsBuildingClickable] = useState<boolean>(true); // Manage clickable areas
  const [isMapView, setIsMapView] = useState(true); // Track if map view is active
  // State for tracking airdrop claim data
  const [totalPopulation, setTotalPopulation] = useState<number>(0);

  const [office, setOffice] = useState<number>(0);
  const [factory, setFactory] = useState<number>(0);
  const [house, setHouse] = useState<number>(0);
  const [enter, setEnter] = useState<number>(0);
  const [castle, setCastle] = useState<number>(0);
  const [mapUrl, setMapUrl] = useState<string>("https://bafkreia2mnsyixtopukbs3x2bgbtxaa3fv5uaroixbqzmrm35lem62qz6q.ipfs.w3s.link/");
  // Add this state to track if the Castle is hovered
  const [preloadedVideoUrls] = useState<{ [key: string]: string }>({}); // Store preloaded video URLs
  const clickAudioRef = useRef<HTMLAudioElement | null>(null); // Ref for click sound
  const [, setHasNftInDb] = useState<boolean | null>(null); // Initialize as null to avoid confusion

  // Add this state to manage the sound
  const [isGameActive, setIsGameActive] = useState(false); // Track if the game-container is on

  const [currentNonce, setCurrentNonce] = useState<number | null>(null); // Track the current nonce

  const audioRef = useRef<HTMLAudioElement | null>(null); // Ref to the audio element


  const [walletObject, setWalletObject] = useState<string | null>(null);

  const [oldNft, setOldNft] = useState<any>(null); // Storing only a single filtered NFT
  const [isChangeNameActive, setIsChangeNameActive] = useState(false); // New state to track the "Change Name" section

  const handleShowChangeName = () => {
    setIsChangeNameActive(!isChangeNameActive);
  };

  const handlePopulationUpdate = (population: number) => {
    setTotalPopulation(population); // Update the state with totalPopulation
  };


  const RPC_URLS = [
    "https://fullnode.mainnet.sui.io",
    "https://sui-rpc.publicnode.com",
    "https://sui-mainnet.nodeinfra.com",
    "https://sui-mainnet-endpoint.blockvision.org",
    "https://mainnet.suiet.app",
    "https://sui-mainnet-ca-2.cosmostation.io",
    "https://mainnet-rpc.sui.chainbase.online"



  ];

  useEffect(() => {
    const handleAssetLoaded = () => {
      assetsLoaded += 1;
    };

    let assetsToLoad = 0;
    let assetsLoaded = 0;

    // Mutation observer to detect dynamically added images/videos
    const observer = new MutationObserver(() => {
      const images = Array.from(document.querySelectorAll("img"));
      const videos = Array.from(document.querySelectorAll("video"));

      assetsToLoad = images.length + videos.length;


      // If there are assets to load, monitor each one
      if (assetsToLoad > 0) {
        images.forEach((img) => {
          if (img.complete) {
            handleAssetLoaded();
          } else {
            img.addEventListener("load", handleAssetLoaded);
            img.addEventListener("error", handleAssetLoaded);
          }
        });

        videos.forEach((video) => {
          video.addEventListener("loadeddata", handleAssetLoaded);
          video.addEventListener("error", handleAssetLoaded);
        });

        // Disconnect observer after assets are found and set up
        observer.disconnect();
      } else {
        // If no assets to load, end loading immediately
      }
    });

    // Observe the document body for added nodes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect(); // Clean up observer on unmount
    };
  }, []);



  const checkIfUserHasNft = useCallback(async () => {
    try {
      const response = await fetch(
        `/.netlify/functions/check-nft?walletAddress=${connected}`, // Add walletAddress as query parameter
        {
          method: "GET", // Change to GET request
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        console.log("data is: ", data);
        setHasNftInDb(data.hasNft); // Update the state based on the response
      } else {
        console.error("Failed to check NFT status:", data.error);
        setHasNftInDb(true); // Set to false if no NFT found or error occurred
      }
    } catch (error) {
      setHasNftInDb(true); // Set to false in case of an error
      console.error("Error checking if user has NFT:", error);
    }
  }, []);


  useEffect(() => {
    if (connected && connected) {
      checkIfUserHasNft(); // Check if the user has an NFT in the database
    }
  }, [checkIfUserHasNft]);

  useEffect(() => {
    if (connected) {
      setIsGameActive(true); // Set game active when wallet is connected
    } else {
      setIsGameActive(false); // Stop the game when the wallet is disconnected
    }
  }, []);


  const mintBackgroundUrl = useMemo(
    () =>
      "https://bafybeifzamdszfcbsrlmff7xqpdhjrjrp44u3iqzodm5r3bhg6aiycxjsu.ipfs.w3s.link/mint-2.webp",
    []
  );



  const handleAirdropClaimSuccess = useCallback(async () => {
    showModal("✅ Airdrop claimed successfully!", 1);


    localStorage.removeItem("signature");
    localStorage.removeItem("message");
    localStorage.removeItem("totalAirdrop");
    setStoredSignature(null); // Remove signature from state
    setAirdropAmount(0); // Set airdrop amount to 0
    setStoredMessage(null); // Remove message from state

    handleClaimSuccess(); // Trigger the claim success logic


  }, []);


  // State for tracking airdrop claim data
  const [storedSignature, setStoredSignature] = useState<string | null>(() => {
    const savedSignature = localStorage.getItem("signature");
    return savedSignature ? savedSignature : null;
  });


  const [storedMessage, setStoredMessage] = useState<string | null>(() => {
    const savedMessage = localStorage.getItem("message");
    return savedMessage ? savedMessage : null;
  });

  // Initialize airdropAmount from localStorage
  const [airdropAmount, setAirdropAmount] = useState<number>(() => {
    const savedAirdropAmount = localStorage.getItem('airdropAmount');
    return savedAirdropAmount ? parseFloat(savedAirdropAmount) : 0;
  });


  // Update airdropAmount when storedMessage changes
  useEffect(() => {
    if (storedMessage) {
      const messageParts = storedMessage.split(":");
      if (messageParts.length > 0) {
        const amountInSity = parseInt(messageParts[0], 10) / 1000; // Divide by 1000 to get the original amount
        setAirdropAmount(amountInSity);
      }
    }
  }, [storedMessage]);

  // Synchronize airdropAmount with localStorage
  useEffect(() => {
    if (airdropAmount > 0) {
      localStorage.setItem('airdropAmount', String(airdropAmount));
    } else {
      localStorage.removeItem('airdropAmount');
    }
  }, [airdropAmount]);

  const originalBackgroundSize = { width: 1280, height: 1280 }; // Original map size

  const buildings = useMemo(
    () => [
      {
        type: "Office",
        imageBaseUrl:
          "https://bafybeiat3x2wrv3b2vqjprvdutvbxnpw2g32flsnogfnwlmmfydjqgtyea.ipfs.w3s.link/",
        buildingUrl:
          "https://bafybeicz5hchwhdfde2pjeo3tbndppqfa7npyyauwi4rjio3edutqok7w4.ipfs.w3s.link/",
        posUrl:
          "https://bafybeig5vgubjuwhqreshajj2cmb2nfpug6aq7imjpbduhjvmta2cj5374.ipfs.w3s.link/",


      },
      {
        type: "Factory",
        imageBaseUrl:
          "https://bafybeie3jnj2qolzprowinmupykm4q3t77utkyejolase4uu2iwgp7qdf4.ipfs.w3s.link/",
        buildingUrl:
          "https://bafybeieb6jtila7flzlkybvl36wdrokz37v4nsjbw33itragrpdtl6o36a.ipfs.w3s.link/",
        posUrl:
          "https://bafybeihe5sssbkonsvpo6ggzejbt4j7s6lyydu4sx42xemaxja7ifsohtu.ipfs.w3s.link/",


      },
      {
        type: "House",
        imageBaseUrl:
          "https://bafybeiamjbdidb4ynhpbjl42npcmasrq4m6oussd5icrcijziurgiq237e.ipfs.w3s.link/",
        buildingUrl:
          "https://bafybeidwyrjf7ivqm76mg2wg3jbwtvo4sifuxkbrar3xzwn7xkugkbiqke.ipfs.w3s.link/",
        posUrl:
          "https://bafybeid7a7hu6e6izwdu2ocx5vb6v6uojwfa6u2wed5jzyfxt5ku7minwy.ipfs.w3s.link/",


      },
      {
        type: "Entertainment Complex",
        imageBaseUrl:
          "https://bafybeihdl2hkkro6gncq2nu522i7meuvsmjiks6ve3k7mgskglco6cjqai.ipfs.w3s.link/",
        buildingUrl:
          "https://bafybeibyvpq4sr33flefgewlxhvfyhgqdd5kcycaz2xortm6uqqrp6ahfa.ipfs.w3s.link/",
        posUrl:
          "https://bafybeiagsoqg2h4rh2xhgbsmybiszerwvhbip3u2iyyzn6baqfoykforpa.ipfs.w3s.link/",


      },
      {
        type: "Castle",

        imageBaseUrl: "https://bafybeicpdxgnbk5q5zucqblmrrkkkiyvyftuxzvbh3w7zas6fewvagcgpq.ipfs.w3s.link/",
        buildingUrl: "https://bafybeiadsxbslazwpkhtlh52afbasmc2friwtc7cniw56kcvnv74dfuzym.ipfs.w3s.link/",
        posUrl: "https://bafybeihvfyswgem7bijtfdt4qmzihabkp4apixn7fs4euf6qdgep45quze.ipfs.w3s.link/"
      },
    ],
    []
  );

  const [backgroundPosition,] = useState({
    x: 50,
    y: 50,
  });
  const [mousePosition,] = useState({ x: 50, y: 50 });
  const [isTouchDevice, setIsTouchDevice] = useState(false); // To detect if the device is touch-enabled

  useEffect(() => {
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(isTouch);
  }, []);



  // Inside your Game component
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // State to track if the game is muted

  // Toggle the mute state
  const handleMuteClick = () => {
    handlePlaySound(); // Play the sound when the mute button is clicked
    setIsMuted((prevMuted) => !prevMuted);
  };
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalMessage(null); // Clear message on close
  };

  const showModal = (message: string, bgColor: 0 | 1 | 2) => {
    setModalMessage(message);
    setIsModalOpen(true);

    if (bgColor === 1) {
      document.body.classList.add('success'); // Add success class
      setTimeout(() => {
        document.body.classList.remove('success'); // Remove success class after 5 seconds
      }, 2000);
    } else if (bgColor === 0) {
      document.body.classList.add('error'); // Add error class
      setTimeout(() => {
        document.body.classList.remove('error'); // Remove error class after 5 seconds
      }, 2000);
    }

    // Automatically close the modal after 4 seconds
    setTimeout(() => {
      handleCloseModal();
    }, 2000);

    setBgColor(bgColor); // Set the background color based on the passed value
  };
  const currentBuilding = useMemo(
    () => buildings[currentBuildingIndex],
    [buildings, currentBuildingIndex]
  );

  const handleBuildingClick = (index: number) => {
    if (oldNft != null || isChangeNameActive) {
      return;
    }
    setCurrentBuildingIndex(index); // Set the clicked building as the current one
    setMapUrl(""); // Clear the map URL when a building is clicked
    setIsBuildingClickable(false); // Disable clickable areas after a building is clicked
    setIsMapView(false); // Enable map view
    setIsHovered(false); // Reset hover state
  };
  const currentLevel =
    currentBuilding.type === "Office"
      ? office
      : currentBuilding.type === "Factory"
        ? factory
        : currentBuilding.type === "House"
          ? house
          : currentBuilding.type === "Entertainment Complex" ? enter : castle;

  const provider = new SuiClient({
    url: getFullnodeUrl("mainnet"),
  });


  // Helper to cancel any ongoing transaction
  const cancelCurrentTransaction = () => {
    if (transactionType) {
      setTransactionType(null);
      setTransactionInProgress(false);
    }
  };

  const handleBalancesUpdate = useCallback(
    (newSuiBalance: number) => {
      setSuiBalance(newSuiBalance);
    },
    []
  );

  // Function to trigger balance refresh after operations
  const triggerBalanceRefresh = () => {
    setRefreshBalances((prev) => !prev); // Toggle state to re-fetch balances
  };

  // Helper to fetch game data
  const fetchGameData = useCallback(async () => {
    try {
      const gameDataResponse = await provider.getObject({
        id: ADDRESSES.GAME,
        options: { showContent: true },
      });

      // Safely check for 'fields' in the content of the response
      const content = gameDataResponse?.data?.content;

      if (content && "fields" in content) {
        console.log("Game data fetched successfully:", content.fields);
        setGameData(content.fields); // This is safe now
      } else {
        console.warn("No fields found in the game data response.");

      }
    } catch (error) {
      console.error("Error fetching game data:", error);

    }
  }, []);

  const fetchCurrentNonce = useCallback(async () => {
    try {
      // Ensure gameData is available before proceeding
      if (!gameData || !gameData.nonces || !gameData.nonces.fields) {
        console.warn("Game data or nonces not ready yet");
        return; // Exit if gameData is not ready
      }

      console.log("Fetching nonce data...");
      console.log("nonce id is:", gameData.nonces.fields.id.id);

      const nonceResponse = await provider.getDynamicFieldObject({
        parentId: String(gameData.nonces.fields.id.id),
        name: { type: "address", value: String(connected) }
      });

      if (nonceResponse.data && nonceResponse.data.content && nonceResponse.data.content.dataType === "moveObject") {
        const fields = nonceResponse.data.content.fields as { value: any };  // Assert the correct type
        console.log("Nonce data fetched successfully:", fields.value);
        setCurrentNonce(fields.value);

        if (Number(fields.value) >= 1) {

          console.log("Nonce is greater than 1, clearing stored data...");

          localStorage.removeItem("signature");
          localStorage.removeItem("message");
          localStorage.removeItem("totalAirdrop");
          setStoredSignature(null); // Remove signature from state
          setAirdropAmount(0); // Set airdrop amount to 0
          setStoredMessage(null); // Remove message from state
        }
      }

    } catch (error) {
      console.error("Error fetching nonce data:", error);
    }
  }, [gameData, connected]);

  useEffect(() => {
    if (connected && gameData) {
      console.log("Account or game data changed, fetching nonce...");
      fetchCurrentNonce(); // Only call fetchCurrentNonce when both account and gameData are available
    }
  }, [gameData, fetchCurrentNonce]);



  const calculateFactoryBonusCountdown = (nft: any) => {
    const currentTime = Date.now();
    const lastDailyBonus = nft.content.fields?.last_daily_bonus;
    const elapsedTime = currentTime - lastDailyBonus;

    const bonusPeriod = (24 * 3600 * 1000) / gameData.speed; // 24 hours divided by game speed
    const remainingTime = bonusPeriod - elapsedTime;

    return remainingTime > 0 ? remainingTime : null;
  };

  const startCountdownInterval = (nft: any) => {
    if (countdownIntervalRef.current)
      clearInterval(countdownIntervalRef.current);

    countdownIntervalRef.current = setInterval(() => {
      const newFactoryBonusCountdown = calculateFactoryBonusCountdown(nft);

      setFactoryBonusCountdown(newFactoryBonusCountdown);
    }, 1000); // Update every second
  };

  useEffect(() => {
    if (filteredNft && gameData && !isAwaitingBlockchain) {
      const nft = filteredNft;
      startCountdownInterval(nft);

      return () => {
        if (accumulationIntervalRef.current)
          clearInterval(accumulationIntervalRef.current);
        if (countdownIntervalRef.current)
          clearInterval(countdownIntervalRef.current);
      };
    }
  }, [
    filteredNft,
    gameData,
    isAwaitingBlockchain,
    isTransactionInProgress,
  ]);

  const preloadImage = (url: string) => {
    const img = new Image();
    img.src = url;
  };

  const handleUpgradeClick = async (buildingType: number) => {

    if (isTouchDevice) {
      // Check if the view is expanded
      if (!isMobileExpanded) {
        // First click: expand the building type div
        setIsMobileExpanded(true);
        setIsUpgradeInfoExpanded(true);
      } else {
        // Second click: initiate upgrade and collapse the view
        setIsMobileExpanded(false);
        setIsUpgradeInfoExpanded(false);
        setTransactionType("upgrade");
        setTransactionInProgress(true);
        // Call upgrade function here
      }
    } else {
      // For non-mobile devices, just handle the upgrade click as usual
      setIsUpgradeInfoExpanded(false); // Collapse when clicked
      setTransactionType("upgrade");
      setTransactionInProgress(true);
      console.log("UPGRADE CLICKED", buildingType);
    }

    const newLevel =
      buildingType === 0
        ? Number(office) + 1
        : buildingType === 1
          ? Number(factory) + 1
          : buildingType === 2
            ? Number(house) + 1
            : Number(enter) + 1;

    const newImageUrl = `${buildings[buildingType].imageBaseUrl}/${newLevel}.webp`;
    const newBuildingUrl = `${buildings[buildingType].buildingUrl}/${newLevel}.webp`;
    const newPosUrl = `${buildings[buildingType].posUrl}/${newLevel}.png`;

    // Preload new images
    preloadImage(newImageUrl);
    preloadImage(newBuildingUrl);
    preloadImage(newPosUrl);


  };





  const handleClaimClick = () => {

    cancelCurrentTransaction(); // Cancel ongoing transaction
    setTransactionType("claim");
    setTransactionInProgress(true);

    // Proceed with claim logic...
  };
  const handleUpgradeSuccess = async () => {
    triggerBalanceRefresh(); // Trigger balance refresh


    // Store the previous levels before refreshing NFT data
    const previousLevels = {
      office,
      factory,
      house,
      enter,
      castle
    };

    setTransactionType(null);
    setIsAwaitingBlockchain(true);

    const retryLimit = 10; // Set a retry limit
    let retryCount = 0; // Counter for retries

    // Function to refresh levels and check if they have increased
    const waitForLevelChange = async () => {
      await refreshNft(); // Refresh the NFT data
      const newLevels = {
        office,
        factory,
        house,
        enter,
        castle
      };


      // Check if any of the levels have increased
      return (
        newLevels.office > previousLevels.office ||
        newLevels.factory > previousLevels.factory ||
        newLevels.house > previousLevels.house ||
        newLevels.enter > previousLevels.enter ||
        newLevels.castle > previousLevels.castle

      );
    };

    // Keep refreshing until the levels increase or retry limit is reached
    let levelIncreased = false;
    while (!levelIncreased && retryCount < retryLimit) {
      levelIncreased = await waitForLevelChange();
      retryCount++;

      if (!levelIncreased) {
        console.log(`No level increase detected, retrying... (${retryCount}/${retryLimit})`);
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds before trying again
      }
    }

    if (!levelIncreased) {
      console.warn("Reached retry limit without detecting a level increase.");
      // You can add logic here to handle the failure case, e.g., show a message to the user
      setIsAwaitingBlockchain(false);
      triggerBalanceRefresh(); // Trigger balance refresh
      setTransactionInProgress(false);
      return;
    }

    console.log("Level increased successfully.");

    // Trigger balance refresh and end transaction
    triggerBalanceRefresh(); // Trigger balance refresh
    setTransactionInProgress(false);
    setIsAwaitingBlockchain(false); // Re-enable interactions
  };


  const handleBurnSuccess = () => {
    setOldNft(null);

  };

  const handleNameSuccess = () => {
    setTimeout(() => {
      setIsChangeNameActive(false);
      refreshNft();
      refreshSity();
      fetchCurrentNonce();
      setTransactionType(null);
      setIsAwaitingBlockchain(true);
      triggerBalanceRefresh(); // Trigger balance refresh
      setTransactionInProgress(false);
    }, 2000); // 2000 milliseconds = 2 seconds
  };
  const handleClaimSuccess = () => {
    setTimeout(() => {
      refreshNft();
      refreshSity();
      fetchCurrentNonce();
      setTransactionType(null);
      setIsAwaitingBlockchain(true);
      triggerBalanceRefresh(); // Trigger balance refresh
      setTransactionInProgress(false);
    }, 2000); // 2000 milliseconds = 2 seconds
  };

  const handleWalletConnected = (address: string) => {
    setConnectedWallet(address);
    console.log("Wallet connected:", address);
  };


  const handleWarSuccess = () => {
    setTimeout(() => {

      refreshNft();
      refreshSity();
      fetchCurrentNonce();
      setTransactionType(null);
      setIsAwaitingBlockchain(true);
      triggerBalanceRefresh(); // Trigger balance refresh
      setTransactionInProgress(false);
    }, 1000); // 2000 milliseconds = 2 seconds

  };

  const handleError = () => {
    setTransactionInProgress(false);
    refreshNft();
  };

  const handleMintSuccess = async () => {
    setTimeout(async () => {
      console.log("MINT SUCCESSFUL, awaiting new data...");
      refreshNft();
      showModal("✅ Mint successful!", 1); // Show success message in the modal

      // Prepare the data to send to the server
      const walletAddress = connected; // Replace this with the actual wallet address
      const nftData = filteredNft; // Replace this with the actual NFT data string

      try {
        const response = await fetch("/.netlify/functions/add-nft", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ walletAddress, walletObject, nftData }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("NFT data and walletObject successfully added to MongoDB:", data);
        } else {
          console.error("Failed to update MongoDB:", response.statusText);
        }
      } catch (error) {
        console.error("Error sending data to MongoDB:", error);
      }

      setTransactionType(null);
      setIsAwaitingBlockchain(true);
      triggerBalanceRefresh(); // Trigger balance refresh
      setTransactionInProgress(false);
    }, 2000); // 2000 milliseconds
  };

  useEffect(() => {
    if (domains.length > 0) {
      console.log("User's domain data:", domains);
      // Add your logic to use the domain data here
    }
  }, [domains]);


  const refreshNft = useCallback(async () => {
    console.log("Refreshing NFTs...");
    let success = false;

    for (const rpcUrl of RPC_URLS) {
      try {
        console.log(`Trying to refresh NFTs with RPC URL: ${rpcUrl}`);
        const provider = new SuiClient({ url: rpcUrl });

        const allObjects: any[] = [];
        let lastObject = null;
        let hasMore = true;

        while (hasMore) {
          const object = await provider.getOwnedObjects({
            owner: String(connected),
            cursor:
              lastObject?.data?.[lastObject.data.length - 1]?.data?.objectId ||
              null,
            options: { showType: true, showContent: true },
          });

          allObjects.push(...object.data);

          if (object.data.length === 0 || !object.nextCursor) {
            hasMore = false;
          } else {
            lastObject = object;
          }
        }

        console.log("All objects found:", allObjects);

        const nft = allObjects.find(
          (nft) => String(nft.data?.type) === `${ADDRESSES.NFT_TYPE}`
        );

        const oldNft = allObjects.find(
          (nft) => String(nft.data?.type) === `${BURN.NFT_TYPE}`
        );
        console.log("Old NFT found:", oldNft?.data);

        setOldNft(oldNft?.data || null);

        console.log("NFT found:", nft?.data);
        setFilteredNft(nft?.data || null);


        const domainObjects = allObjects.filter(
          (obj) =>
            String(obj.data?.type) ===
            '0xd22b24490e0bae52676651b4f56660a5ff8022a2576e0089f79b3c88d44e08f0::suins_registration::SuinsRegistration'
        );

        console.log("Domains found:", domainObjects);
        setDomains(domainObjects || []);


        if (nft?.data) {
          const fields = nft.data.content.fields;
          if (fields.buildings) {
            setOffice(fields.buildings[0]);
            setFactory(fields.buildings[1]);
            setHouse(fields.buildings[2]);
            setEnter(fields.buildings[3]);
            setCastle(fields.buildings[4]);
          }
          if (fields.wallet) {
            setWalletObject(fields.wallet);
          }
        }

        setIsAwaitingBlockchain(false);
        setIsLoading(false);

        success = true;
        break; // Exit the loop on success
      } catch (error) {
        console.error(`Error refreshing NFTs with RPC URL ${rpcUrl}:`, error);
        // Continue to the next RPC URL
      }
    }

    if (!success) {
      console.error("Failed to refresh NFTs after trying all RPC URLs");
      setIsAwaitingBlockchain(false);

    }
  }, []);



  const refreshSity = useCallback(async () => {
    console.log("Refreshing SITY...");
    let success = false;

    for (const rpcUrl of RPC_URLS) {
      try {
        console.log(`Trying to refresh SITY with RPC URL: ${rpcUrl}`);
        const provider = new SuiClient({ url: rpcUrl });

        const object = await provider.getObject({
          id: String(walletObject),
          options: { showContent: true },
        });

        console.log("SITY object found:", object.data);
        if (object?.data) {
          const wallet = object as any;
          const fields = wallet.data.content.fields;

          if (fields.balance) {
            setSityBalance(parseInt(fields.balance) / 1000);
          }
        }

        success = true;
        break; // Exit the loop on success
      } catch (error) {
        console.error(`Error refreshing SITY with RPC URL ${rpcUrl}:`, error);
        // Continue to the next RPC URL
      }
    }

    if (!success) {
      console.error("Failed to refresh SITY after trying all RPC URLs");
    }
  }, [walletObject]);

  useEffect(() => {
    refreshSity();
  }, [filteredNft]);

  // Re-fetch NFTs and balances when account changes
  useEffect(() => {
    if (connected) {
      console.log("Account changed, resetting state and fetching data...");
      setFilteredNft(null); // Reset NFT state
      refreshNft();
      refreshSity();
      triggerBalanceRefresh(); // Trigger balance refresh
      fetchGameData();
      fetchCurrentNonce();
    }
  }, [refreshNft, fetchGameData, handleBalancesUpdate]);

  useEffect(() => {
    refreshNft();
    triggerBalanceRefresh(); // Trigger balance refresh
    fetchGameData();
    fetchCurrentNonce();
    refreshSity();


  }, []);

  const handleMapButtonClick = () => {

    setMapUrl("https://bafkreia2mnsyixtopukbs3x2bgbtxaa3fv5uaroixbqzmrm35lem62qz6q.ipfs.w3s.link/");
    setIsBuildingClickable(true); // Re-enable clickable areas when the map is shown
    setIsMapView(true); // Enable map view
  };

  const containerRef = useRef<HTMLDivElement | null>(null); // To reference the game container

  const [containerSize, setContainerSize] = useState({
    width: 1280,
    height: 720,
  });

  const scaleFactor = useMemo(() => {
    const widthRatio = containerSize.width / originalBackgroundSize.width;
    const heightRatio = containerSize.height / originalBackgroundSize.height;

    // Use the larger ratio to mimic "background-size: cover"
    return Math.max(widthRatio, heightRatio);
  }, [containerSize.width, containerSize.height]);

  // Function to handle resizing and update container size
  const updateContainerSize = () => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setContainerSize({ width, height });
    }
  };



  // Add a resize event listener
  useEffect(() => {
    window.addEventListener("resize", updateContainerSize);
    updateContainerSize(); // Initial size calculation

    return () => {
      window.removeEventListener("resize", updateContainerSize);
    };
  }, []);
  // Adjust top and left positions according to the container size and scale factor
  const adjustedBuildingPositions = useMemo(() => {
    const bgWidth = originalBackgroundSize.width * scaleFactor;
    const bgHeight = originalBackgroundSize.height * scaleFactor;

    const overflowX = (bgWidth - containerSize.width) / 2; // Horizontal overflow in pixels
    const overflowY = (bgHeight - containerSize.height) / 2; // Vertical overflow in pixels

    // Helper function to calculate adjusted positions
    const adjustPosition = (topPercent: number, leftPercent: number) => ({
      top: `${((topPercent / 100) * bgHeight - overflowY) / containerSize.height * 100}%`,
      left: `${((leftPercent / 100) * bgWidth - overflowX) / containerSize.width * 100}%`,
    });

    return {
      house: adjustPosition(34.06, 48.98),
      office: adjustPosition(9.84, 50),
      factory: adjustPosition(9.84, 10),
      entertainment: adjustPosition(33.83, 10.08),
      castle: adjustPosition(50, 28),
    };
  }, [scaleFactor, containerSize]);

  // Add this state to track if a building is hovered
  const [isHovered, setIsHovered] = useState(false);

  // Function to handle hover state for buildings
  const handleMouseEnterBuilding = () => {
    if (oldNft != null) {
      return;
    }
    else {
      setIsHovered(true);

    }
  };

  const handleMouseLeaveBuilding = () => {
    if (oldNft != null) {
      return;
    }
    else {
      setIsHovered(false);

    }
  };

  // Play audio on user interaction (e.g., clicking on the game)
  const handlePlaySound = () => {
    if (audioRef.current && !isMuted) {
      audioRef.current.play().catch((err) => console.error("Failed to play audio:", err));
    }
  };

  return (

    <>

      <p>{connected}</p>


      {isGameActive && (
        <>

          <audio ref={audioRef} loop>
            <source src="/ambient.mp3" type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
          <audio ref={clickAudioRef} src="/click.mp3" preload="auto" />

        </>
      )}
      <div
        className={`info-container ${!(filteredNft && connected) ? 'blurred' : ''}`} // Add the 'blurred' class if NFT is not minted
      >
        <NftTech
          nft={filteredNft}
          officeLevel={office}
          factoryLevel={factory}
          houseLevel={house}
          enterLevel={enter}
          castleLevel={castle}
          onShowChangeName={handleShowChangeName}
        />


        <div className="ref-partner">
          <Reference nft={filteredNft} showModal={showModal} officeLevel={office}
            factoryLevel={factory}
            houseLevel={house}
            enterLevel={enter}
            currentNonce={currentNonce}
            walletObject={walletObject}
            onClaimSuccessful={handleClaimSuccess} />

          <Partner showModal={showModal} currentNonce={Number(currentNonce)} walletObject={walletObject} onClaimSuccessful={handleClaimSuccess} />
        </div>

      </div>

      <div
        className={`social-container ${!(filteredNft && connected) ? 'blurred' : ''}`} // Add the 'blurred' class if NFT is not minted
      >

        <div className="leaderboard">

          <h2>🏆 Leaderboard</h2>


          {connected && <Leaderboard population={totalPopulation} />}
        </div>
      </div>

      <div
        className={`game-container ${isChangeNameActive ? 'disable-hover' : ''}`}
        ref={containerRef}
        style={{
          backgroundImage: isMapView // If mapUrl is set, use it as the background
            ? `url(${mapUrl})`
            : connected && filteredNft?.content?.fields
              ? `url(${currentBuilding.imageBaseUrl}/${currentLevel}.webp)`
              : `url(${mintBackgroundUrl})`, // Use mint background as fallback

          backgroundPosition:
            connected && filteredNft?.content?.fields
              ? isTouchDevice
                ? `${backgroundPosition.x}% ${backgroundPosition.y}%`
                : `${mousePosition.x}% ${mousePosition.y}%`
              : "50% 25%", // Fixed position in case of minting
          backgroundSize:
            connected && filteredNft?.content?.fields
              ? "cover" // Full coverage when NFT is loaded
              : "cover", // Fixed size for minting background
          backgroundColor:
            connected ||
              filteredNft === null
              ? "white"
              : "transparent",
          transition: "filter 0.3s ease-in-out", // Smooth transition for blur
        }}
      >
        <Modal
          show={isModalOpen}
          message={modalMessage || ""}
          onClose={handleCloseModal}
          bgColor={bgColor} // Pass the bgColor prop
        />


        {/* Mint Section - Only show if not minted and connected */}
        {connected && !filteredNft && !isLoading && (
          <div className="mint">
            <div className="wallet-checker">

              <Mint showModal={showModal} onMintSuccessful={handleMintSuccess} />
            </div>

          </div>
        )}



        {/* Please connect wallet section */}
        {!connected && (
          <div className="pleaseConnect">

            <Wallet onWalletConnected={handleWalletConnected} />

          </div>

        )}



        <div className={`game-container-wrapper 
  ${(!filteredNft ? 'blurred' : '')} 
  ${(storedSignature || airdropAmount > 0) ? 'mystic' : ''}`}
        >

          {/* Check if the wallet is connected */}
          {connected && (
            <>
              {isLoading ? (
                <div className="loading-screen"> <div className="spinner"></div></div>
              ) : filteredNft && (


                <>


                  <div className="upper-div">
                    <Balances
                      sityBalance={sityBalance}
                      onBalancesUpdate={handleBalancesUpdate}
                      refreshTrigger={refreshBalances}
                    />
                    <button onClick={handleMuteClick} className="mute-button">
                      {isMuted ? "🔇 Unmute" : "🔊 Mute"}
                    </button>


                    {/* New NftSpecs component */}
                    <NftSpecs
                      officeLevel={office}
                      factoryLevel={factory}
                      houseLevel={house}
                      enterLevel={enter}
                      castleLevel={castle}
                      gameData={gameData}
                    />
                  </div>


                  {/* Add a darken overlay when "Change Name" is active */}
                  {isChangeNameActive && (
                    <div
                      className="darken-overlay_name visible"
                      onClick={handleShowChangeName} // Close the section when clicking outside
                    ></div>
                  )}

                  {/* Render the Change Name component only when active */}
                  {isChangeNameActive && (
                    <ChangeName
                      currentAccount={account as { address: string }}
                      onChangeNameSuccessful={handleNameSuccess}
                      showModal={showModal}
                      nft={filteredNft}
                      currentNonce={currentNonce}
                      walletObject={walletObject}
                      sityBalance={sityBalance}
                      gameData={gameData}
                      domains={domains}
                    />
                  )}



                  {isMapView && (
                    <>
                      {!isChangeNameActive && (
                        <SingleplayerWar
                          showModal={showModal}
                          GameData={gameData}
                          CastleLevel={castle}
                          onWarComplete={handleWarSuccess}
                          nft={filteredNft}
                          walletObject={walletObject}
                          suiBalance={suiBalance}
                        />
                      )
                      }

                      {/* House */}
                      <div
                        className="buildingPos"
                        style={{
                          position: "absolute",
                          top: adjustedBuildingPositions.house.top,
                          left: adjustedBuildingPositions.house.left,
                          width: `${scaleFactor * 512}px`,
                          height: `${scaleFactor * 512}px`,


                        }

                        }
                      >
                        <img
                          src={`${buildings[2].posUrl}/${house}.png`}
                          alt="House"
                          style={{
                            width: '100%',
                            height: '100%',
                          }}

                        />
                        <div
                          className="buildingPos"

                          style={{
                            position: "absolute",
                            top: "30%", // center the clickable area vertically
                            left: "30%", // center the clickable area horizontally
                            width: "40%", // 30% width of the image
                            height: "40%", // 30% height of the image
                            cursor: "pointer",
                            zIndex: 10,

                          }}
                          onClick={() => handleBuildingClick(2)}
                          onMouseEnter={handleMouseEnterBuilding}
                          onMouseLeave={handleMouseLeaveBuilding}
                        />
                      </div>

                      {/* Office */}
                      <div
                        className="buildingPos"

                        style={{
                          position: "absolute",
                          top: adjustedBuildingPositions.office.top,
                          left: adjustedBuildingPositions.office.left,
                          width: `${scaleFactor * 512}px`,
                          height: `${scaleFactor * 512}px`,
                        }}
                      >
                        <img
                          src={`${buildings[0].posUrl}/${office}.png`}
                          alt="Office"
                          style={{
                            width: '100%',
                            height: '100%',
                          }}

                        />
                        <div
                          style={{
                            position: "absolute",
                            top: "30%", // center the clickable area vertically
                            left: "30%", // center the clickable area horizontally
                            width: "40%", // 30% width of the image
                            height: "40%", // 30% height of the image
                            cursor: "pointer",
                            zIndex: 10,

                          }}
                          onClick={() => {
                            handleBuildingClick(0);
                            handlePlaySound()
                          }}
                          onMouseEnter={handleMouseEnterBuilding}
                          onMouseLeave={handleMouseLeaveBuilding}
                        />
                      </div>

                      {/* Factory */}
                      <div
                        className="buildingPos"

                        style={{
                          position: "absolute",
                          top: adjustedBuildingPositions.factory.top,
                          left: adjustedBuildingPositions.factory.left,
                          width: `${scaleFactor * 512}px`,
                          height: `${scaleFactor * 512}px`,
                        }}
                      >
                        <img
                          src={`${buildings[1].posUrl}/${factory}.png`}
                          alt="Factory"
                          style={{
                            width: '100%',
                            height: '100%',
                          }}

                        />
                        <div
                          style={{
                            position: "absolute",
                            top: "30%", // center the clickable area vertically
                            left: "30%", // center the clickable area horizontally
                            width: "40%", // 30% width of the image
                            height: "40%", // 30% height of the image
                            cursor: "pointer",
                            zIndex: 10,

                          }}
                          onClick={() => {
                            handleBuildingClick(1);
                            handlePlaySound()
                          }}
                          onMouseEnter={handleMouseEnterBuilding}
                          onMouseLeave={handleMouseLeaveBuilding}
                        />
                      </div>

                      {/* castle Complex */}
                      <div
                        className="buildingPos"

                        style={{
                          position: "absolute",
                          top: adjustedBuildingPositions.castle.top,
                          left: adjustedBuildingPositions.castle.left,
                          width: `${scaleFactor * 512}px`,
                          height: `${scaleFactor * 512}px`,
                        }}
                      >
                        <img
                          src={`${buildings[4].posUrl}/${castle}.png`}
                          alt="Castle"
                          style={{
                            width: '100%',
                            height: '100%',
                          }}

                        />
                        <div
                          style={{
                            position: "absolute",
                            top: "30%", // center the clickable area vertically
                            left: "30%", // center the clickable area horizontally
                            width: "40%", // 30% width of the image
                            height: "40%", // 30% height of the image
                            cursor: "pointer",
                            zIndex: 100,
                          }}
                          onClick={() => {
                            handleBuildingClick(4);
                            handlePlaySound()
                          }} onMouseEnter={handleMouseEnterBuilding}
                          onMouseLeave={handleMouseLeaveBuilding}
                        />
                      </div>

                      {/* Entertainment Complex */}
                      <div
                        className="buildingPos"

                        style={{
                          position: "absolute",
                          top: adjustedBuildingPositions.entertainment.top,
                          left: adjustedBuildingPositions.entertainment.left,
                          width: `${scaleFactor * 512}px`,
                          height: `${scaleFactor * 512}px`,
                        }}
                      >
                        <img
                          src={`${buildings[3].posUrl}/${enter}.png`}
                          alt="Entertainment Complex"
                          style={{
                            width: '100%',
                            height: '100%',
                          }}

                        />
                        <div
                          style={{
                            position: "absolute",
                            top: "30%", // center the clickable area vertically
                            left: "30%", // center the clickable area horizontally
                            width: "40%", // 30% width of the image
                            height: "40%", // 30% height of the image
                            cursor: "pointer",
                            zIndex: 100,
                          }}
                          onClick={() => {
                            handleBuildingClick(3);
                            handlePlaySound()
                          }} onMouseEnter={handleMouseEnterBuilding}
                          onMouseLeave={handleMouseLeaveBuilding}
                        />
                      </div>

                      {/* Add a darken overlay when a building is hovered */}
                      <div className={`darken-overlay ${isHovered ? 'visible' : ''}`}></div>

                      {oldNft !== null && (<>
                        <Burn
                          onBurnSuccessful={handleBurnSuccess}
                          showModal={showModal}
                          nftIdToBurn={oldNft?.objectId}
                        />
                        <div className={`darken-overlay ${oldNft || (storedSignature != null) ? 'visible' : ''}`}></div></>
                      )
                      }

                      {/* Mint button */}
                      {
                        storedSignature && storedMessage && (
                          <>
                            <ClaimReward
                              mySignature={storedSignature}
                              hashedMessage={storedMessage}
                              amount={airdropAmount}
                              showModal={showModal}
                              onClaimSuccessful={handleAirdropClaimSuccess} // Handle success
                              walletObject={walletObject}
                            />
                          </>
                        )
                      }




                    </>
                  )}



                  {/* Map Button as an image */}
                  {
                    !isMapView && (
                      <button onClick={handleMapButtonClick} className="map-button">
                        🗺️ Show Map
                      </button>
                    )
                  }


                  {
                    !isMapView && (
                      <>
                        <Building
                          nft={filteredNft}
                          currentBuilding={currentBuilding}
                          officeLevel={office}
                          factoryLevel={factory}
                          houseLevel={house}
                          enterLevel={enter}
                          castleLevel={castle}
                          gameData={gameData}
                          buildingIndex={currentBuildingIndex}
                          suiBalance={suiBalance}
                          sityBalance={sityBalance}
                          factoryBonusCountdown={factoryBonusCountdown}
                          isTransactionInProgress={isTransactionInProgress}
                          onClaimSuccess={handleClaimSuccess}
                          onClaimError={handleError}
                          onUpgradeSuccess={handleUpgradeSuccess}
                          onUpgradeError={handleError}
                          showModal={showModal}
                          isTouchDevice={false}
                          onUpgradeClick={handleUpgradeClick}
                          onClaimClick={handleClaimClick}
                          preloadedVideoUrl={preloadedVideoUrls[currentBuilding.type]} // Pass the preloaded video URL
                          walletObject={walletObject}
                          accumulatedSity={accumulatedSity}
                        />
                      </>
                    )
                  }

                  <Accumulation
                    nft={filteredNft}
                    gameData={gameData}
                    isTransactionInProgress={isTransactionInProgress}
                    onAccumulatedSityUpdate={setAccumulatedSity}
                    onCountdownUpdate={setCountdown}
                    showModal={showModal}
                    onClaimSuccess={handleClaimSuccess}
                    onClaimError={handleError}
                    suiBalance={suiBalance}
                    officeLevel={office}
                    factoryLevel={factory}
                    houseLevel={house}
                    enterLevel={enter}
                    walletObject={walletObject}
                  />

                  <Population
                    filteredNft={filteredNft}
                    accumulatedSity={accumulatedSity}
                    sityBalance={sityBalance}
                    officeLevel={office}
                    factoryLevel={factory}
                    houseLevel={house}
                    enterLevel={enter}
                    castleLevel={castle}
                    onPopulationUpdate={handlePopulationUpdate}
                  />

                </>

              )

              }
            </>
          )}

        </div >


      </div >

    </>

  );
};

export default Game;