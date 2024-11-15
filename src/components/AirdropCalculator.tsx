import { useEffect, useState } from "react";
import { airdropValues } from "../../airdrop"; // Import the airdrop values
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { KioskClient, Network } from "@mysten/kiosk"; // Import Kiosk SDK
import { useCurrentAccount } from "@mysten/dapp-kit";


const AirdropCalculator = ({
    showModal,
    onAirdropCalculated,
    onMessageGenerated,
    onSignatureGenerated,
}: {
    showModal: (message: string, bgColor: 0 | 1 | 2) => void;
    onAirdropCalculated: (totalAirdrop: number) => void;
    onMessageGenerated: (message: string | null) => void;
    onSignatureGenerated: (signature: string | null) => void;
}) => {
    const currentAccount = useCurrentAccount(); // Get the current wallet address
    const [loadingAirdrop, setLoadingAirdrop] = useState<boolean>(false); // Show spinning loading icon
    const [totalAirdrop, setTotalAirdrop] = useState<number | null>(null); // Track total airdrop value
    const [airdropBreakdown, setAirdropBreakdown] = useState<string[]>([]); // Breakdown of airdrop sources
    const [, setSignature] = useState<string | null>(null); // Store the signature
    const [message, setMessage] = useState<string | null>(null); // Store the message to be signed

    const [sarcasticMessage, setSarcasticMessage] = useState<string>("Checking your eligibility..."); // State for sarcastic message

    const sarcasticMessages = [
        "Still calculating... don't hold your breath.",
        "Just hang on, your patience is impressive.",
        "Oh, you're still here? Fascinating.",
        "Working hard or hardly working? We'll never know.",
        "This is taking longer than your last relationship.",
        "Wow, this is going fast… in sloth terms.",
        "Almost there… or not. Who knows?",
        "Don't worry, it's not your internet speed.",
        "Relax, we've only been doing this forever.",
        "The airdrop's on its way… possibly.",
    ];

    useEffect(() => {
        if (loadingAirdrop) {
            const interval = setInterval(() => {
                const randomMessage = sarcasticMessages[Math.floor(Math.random() * sarcasticMessages.length)];
                setSarcasticMessage(randomMessage);
            }, 5000);

            return () => clearInterval(interval); // Cleanup on unmount
        }
    }, [loadingAirdrop]);

    const client = new SuiClient({
        url: getFullnodeUrl("mainnet"),
    });

    const clientTestnet = new SuiClient({
        url: getFullnodeUrl("testnet"),
    });

    const kioskClient = new KioskClient({
        client,
        network: Network.MAINNET,
    });

    const tokenRanges: Record<string, { min: number; max: number }> = {
        BLUB: { min: 62e9, max: 1200e9 },
        FUD: { min: 1.55e13, max: 3.1e14 },
        PUFF: { min: 8e12, max: 1.55e14 },
        SUICUNE: { min: 2.5e12, max: 5e13 },
        LIQ: { min: 1.5e12, max: 3e13 },
        TUSK: { min: 6e14, max: 1.2e16 },
    };

    // Define a mapping from NFT addresses or types to collection names
    const nftCollectionMapping: Record<string, string> = {
        "0xff3923e6261d2f979bd5db60929ede5680b41b98d58a419281f1302058e38845::bluemove_launchpad::DSL_Legacy": "DSL Legacy",
        "0x71ef69d02e77dff830c7de41db1452928c8ecd9040a541eef6729f139df83ffd::enforcer_machin_prototypes_01::Emp": "Enforcer Machin",
        "0x034c162f6b594cb5a1805264dd01ca5d80ce3eca6522e6ee37fd9ebfb9d3ddca::factory::PrimeMachin": "Prime Machin",
        "0xac176715abe5bcdaae627c5048958bbe320a8474f524674f3278e31af3c8b86b::fuddies::Fuddies": "Fuddies",
        "0x4edaf43ada89b42ba4dee9fbf74a4dee3eb01f3cfd311d4fb2c6946f87952e51::dlab::Dlab": "DeSuiLabs",
        "0x8f74a7d632191e29956df3843404f22d27bd84d92cca1b1abde621d033098769::rootlet::Rootlet": "Rootlets",
        "0x1c3de8ab70e98fadd2c46b98bd617908c41ae0d13f11d6fec158153d0e127279::gommies::Gom": "Gommies",
        "0x75cab45b9cba2d0b06a91d1f5fa51a4569da07374cf42c1bd2802846a61efe33::avatar::Avatar": "Anima Genesis Avatars",
        "0xf78977221c9420f9a8ecf39b6bc28f7a576f92179bc29ecc34edca80ac7d9c55::tradeport::Nft<0x51e1abc7dfe02e348a3778a642ef658dd5c016116ee2e8813c4e3a12f975d88e::nft::UC>": "Unchained",
        "0x625d518a3cc78899742d76cf785609cd707e15228d4284aa4fee5ca53caa9849::dungeon_resident:": "Dungeon Move",
        "0x93195daadbc4f26c0c498f4ceac92593682d2325ce3a0f5ba9f2db3b6a9733dd::collection::DegenRabbit": "Degen Rabbit",
        "0x9414ec1700b5c391122cab0bb11781394098ec64403b6aa8b2e64bbef7e9e37b::bluemove_launchpad::SuiPunks": "Sui Punks",
        "0xbb35722bdffea8d6b19cbb329673d1ae77f17ee83e1cab23615e9c0c55dc4dfa::keepsake_nft::KEEPSAKE": "Sui Duckz",
        "0xf417417b1914266b634b3dc90050be9f28fb755e9d29f36d1892012e0ad6f816::novagen::Novagen": "Novagen",
        "0x4125c462e4dc35631e7b31dc0c443930bd96fbd24858d8e772ff5b225c55a792::avatars::Avatar": "Cosmocadia"

    };

    const calculateAirdropForToken = (_tokenType: string, balance: number, min: number, max: number) => {
        if (balance < min) return 0;
        if (balance >= max) return 500;
        const points = 100 + ((balance - min) * 400) / (max - min);
        return Math.round(points);
    };

    const calculateSuiActivityBonus = (totalObjects: number) => {
        const maxBonus = 750;
        const maxObjects = 500;
        return totalObjects >= maxObjects ? maxBonus : Math.round((totalObjects / maxObjects) * maxBonus);
    };
    const fetchAllObjects = async (client: SuiClient) => {
        if (!currentAccount?.address) return [];
        let allObjects: any[] = [];
        let hasMore = true;
        let cursor: string | null = null; // Ensure this starts as null

        try {
            while (hasMore) {
                // Fetch owned objects with pagination
                const { data, nextCursor } = await client.getOwnedObjects({
                    owner: currentAccount.address,
                    cursor: cursor, // Start with null for first call, then update
                    options: { showType: true, showContent: true, showPreviousTransaction: true },
                    limit: 50, // Fetch in batches to avoid hitting rate limits
                });

                // If no data is fetched, exit the loop to avoid unnecessary calls
                if (data.length === 0) {
                    hasMore = false;
                } else {
                    allObjects = allObjects.concat(data); // Add fetched objects to the array
                    cursor = nextCursor ?? null; // Update cursor for the next request
                    hasMore = Boolean(nextCursor); // Continue if there's a nextCursor
                }
            }

            // After fetching all objects, check for those containing 'kiosk' fields
            for (const obj of allObjects) {
                const kioskId = obj?.data?.content?.fields?.kiosk;
                if (kioskId) {
                    const kioskItems = await kioskClient.getKiosk({
                        id: kioskId,
                        options: { withObjects: true, objectOptions: { showPreviousTransaction: true } },
                    });
                    allObjects.push(...kioskItems.items); // Add kiosk items to the object list
                }
            }
        } catch (error) {
            console.error("Error fetching objects:", error);
        }



        return allObjects;
    };


    const fetchAllKiosks = async () => {
        if (!currentAccount?.address) return [];
        const { kioskIds } = await kioskClient.getOwnedKiosks({ address: currentAccount.address });
        const kioskItems = await Promise.all(
            kioskIds.map(async (kioskId) => {


                const kioskData = await kioskClient.getKiosk({ id: kioskId, options: { withObjects: true, objectOptions: { showPreviousTransaction: true } } });
                return kioskData.items;
            })
        );
        return kioskItems.flat();
    };

    const fetchTokenBalances = async () => {
        if (!currentAccount?.address) return;

        try {
            const tokenBalances: { [key: string]: number } = {};
            await Promise.all(
                airdropValues.tokens.map(async (tokenType) => {
                    const tokenBalance = await client.getBalance({
                        owner: String(currentAccount.address),
                        coinType: tokenType,
                    });
                    const balance = parseInt(tokenBalance.totalBalance) || 0;
                    tokenBalances[tokenType] = balance;
                })
            );

            return tokenBalances;
        } catch (error) {
            console.error("Error fetching token balances:", error);
        }
    };

    const fetchCSV = async (url: string): Promise<string[]> => {
        try {
            const response = await fetch(url);
            const csvText = await response.text();
            const walletAddresses = csvText.split("\n").map(line => line.trim());
            return walletAddresses;
        } catch (error) {
            console.error(`Error fetching CSV from ${url}:`, error);
            return [];
        }
    };


    const calculateAirdrop = async () => {
        setLoadingAirdrop(true);

        const [mainnetObjects, testnetObjects, kioskItems, tokenBalances] = await Promise.all([
            fetchAllObjects(client),
            fetchAllObjects(clientTestnet),
            fetchAllKiosks(),
            fetchTokenBalances(),
        ]);
        let total = 0;
        const breakdown: string[] = [];
        const processedCollections: string[] = []; // Track processed collection names
        const eligibleObjectIds: any[] = []; // Track eligible object IDs

        const feedbackProviderWallets = await fetchCSV("https://bafkreihnzw6g7kz4eytzqo6rfqp2oqajiuecyitp6yiso3o245qbzs565e.ipfs.w3s.link/");
        const earlySupporterWallets = await fetchCSV("https://bafkreierapxbtpy3y7nhx2flfxno4zn2cv6podoq47pu5lluthjhkqfqay.ipfs.w3s.link/");


        const processNFTs = async (allObjects: any[], network: string) => {

            let hasErrorInValidityCheck = false; // Flag to track errors

            const promises = allObjects.map(async (nft) => {
                const nftType = String(nft.data?.type || "");
                const kioskType = String(nft.type || "");

                // Process SuiNS domain separately
                if (nftType.includes("suins_registration::SuinsRegistration") && !processedCollections.includes("SuiNS")) {
                    total += 200;
                    breakdown.push(`Holding SuiNS domain ✅ : +600 $SITY`);
                    processedCollections.push("SuiNS");
                }

                // Process eligible NFTs for airdrop, ensuring no duplicates
                for (const airdropKey of Object.keys(airdropValues.nft)) {
                    if (nftType.includes(airdropKey) || kioskType.includes(airdropKey)) {

                        if (nftType.length > 240) {
                            return
                        }

                        if (kioskType.length > 240) {
                            return
                        }
                        const collectionName = nftCollectionMapping[nftType] || nftCollectionMapping[kioskType] || "";

                        // Call check-objects Netlify function to verify if the object is used by another wallet
                        const checkResponse = await fetch("/.netlify/functions/check-objects", {
                            method: "POST",
                            body: JSON.stringify({
                                wallet: currentAccount?.address || "",
                                objectIds: [nft.data?.objectId], // Pass the object ID to check
                            }),
                        });

                        if (processedCollections.includes(collectionName)) {
                            return
                        }

                        const checkResult = await checkResponse.json();
                        if (checkResponse.status !== 200) {
                            console.error("Error checking object ownership");
                            return; // Skip this object due to an error
                        }

                        // If the object belongs to another wallet, skip it
                        if (checkResult.conflictingObjects.includes(nft.data?.objectId)) {
                            console.log(`Skipping object ${nft.data?.objectId}, as it belongs to another wallet.`);
                            return; // Skip this object and don't count it
                        }

                        if (!processedCollections.includes(collectionName)) {
                            const airdropValue = airdropValues.nft[airdropKey];
                            total += airdropValue;

                            breakdown.push(`Holding ${collectionName || "NFT"} ✅ : +${3 * airdropValue} $SITY`);
                            processedCollections.push(collectionName);
                            eligibleObjectIds.push(nft.data?.objectId); // Add eligible object ID

                        }

                        return; // Stop further processing for this NFT, as it has been counted
                    }
                }

                // Specific condition for Testnet Minter
                if (network === "Testnet" && nftType.includes("0x8c880e085e95d3ff67a3b131f77c0105e6f373a45271a7c3d2112c19068d2848::nft::City")) {
                    total += 1000;
                    breakdown.push(`Testnet Minter ✅ : +3000 $SITY`);
                    if (currentAccount?.address && feedbackProviderWallets.includes(currentAccount.address)) {
                        total += 1000;
                        breakdown.push(`Feedback provider ✅ : +3000 $SITY`);
                    }
                }
            });

            // Wait for all promises to complete
            await Promise.all(promises);

            // Call add-objects Netlify function to add eligible objects to the database
            if (currentAccount?.address && eligibleObjectIds.length > 0) {
                const addResponse = await fetch("/.netlify/functions/add-objects", {
                    method: "POST",
                    body: JSON.stringify({
                        wallet: currentAccount.address,
                        objectIds: eligibleObjectIds, // Pass eligible object IDs to be added
                    }),
                });

                const addResult = await addResponse.json();
                if (addResponse.status !== 200) {
                    console.error("Failed to add eligible object IDs to MongoDB:", addResult.error);
                } else {
                    console.log("Successfully added eligible object IDs to MongoDB:", addResult.message);
                }
            }

            // If there were errors in transaction validity checks, inform the user
            if (hasErrorInValidityCheck) {
                breakdown.push(
                    "⚠️ Some items couldn't be checked due to errors in checking validity. Please refresh the page if you think there's a miscalculation."
                );
            }
        };


        const allObjects = [...mainnetObjects, ...kioskItems];



        // Ensure both processNFTs calls are awaited
        await processNFTs(allObjects, "Mainnet");
        await processNFTs(testnetObjects, "Testnet");

        Object.keys(tokenBalances || {}).forEach((tokenType) => {
            const balance = tokenBalances ? tokenBalances[tokenType] : 0;
            const tokenSymbol = (tokenType.split("::").pop() || "Unknown Token") as string;

            if (tokenRanges.hasOwnProperty(tokenSymbol)) {
                const { min, max } = tokenRanges[tokenSymbol];
                const tokenAirdrop = calculateAirdropForToken(tokenSymbol, balance, min, max);
                total += tokenAirdrop;

                if (tokenAirdrop > 0) {
                    breakdown.push(`Holding $${tokenSymbol} ✅ : +${3 * tokenAirdrop} $SITY`);
                }
            }
        });



        if (currentAccount?.address && earlySupporterWallets.includes(currentAccount.address)) {
            total += 750;
            breakdown.push(`Early supporter ✅ : +2250 $SITY`);
        }

        const totalObjects = (2 * mainnetObjects?.length || 0) + (testnetObjects?.length || 0) + (kioskItems?.length || 0);
        const suiActivityBonus = calculateSuiActivityBonus(totalObjects);
        total += suiActivityBonus;
        breakdown.push(`SUI Activity ✅ : +${3 * suiActivityBonus} $SITY`);

        // Cap the total airdrop to 20,000 if it exceeds that value
        if (total > 20000) {
            total = 20000;
        }


        setAirdropBreakdown(breakdown);
        setTotalAirdrop(total * 3);
        setLoadingAirdrop(false);
        onAirdropCalculated(total * 3);
        const newMessage = `${parseInt(String(total * 3000))}:${currentAccount?.address}:0`;
        setMessage(newMessage);
        onMessageGenerated(newMessage);
        localStorage.setItem("message", newMessage);
        localStorage.setItem("totalAirdrop", String(total));

    };

    const signMessage = async () => {
        if (!message) return;

        try {
            const response = await fetch("/.netlify/functions/sign-message", {
                method: "POST",
                body: JSON.stringify({ message }),
            });

            const data = await response.json();
            if (data.hexSign) {
                setSignature(data.hexSign);
                onSignatureGenerated(data.hexSign);
                localStorage.setItem("signature", data.hexSign);
            } else {
                console.error("Error signing message");
            }
        } catch (error) {
            console.error("Error signing message:", error);
            showModal("Error signing message", 0);
        }
    };

    useEffect(() => {
        if (currentAccount?.address) {
            calculateAirdrop();
        }
    }, [currentAccount?.address]);

    useEffect(() => {
        if (totalAirdrop !== null && message) {
            signMessage();
        }
    }, [totalAirdrop, message]);

    return (
        <div className="airdrop-calculator">
            {loadingAirdrop ? (
                <>
                    <p>{sarcasticMessage}</p>
                    <div className="spinner"></div>
                </>
            ) : (
                totalAirdrop !== null && (
                    <>
                        <p>🪂 Your total $SITY airdrop is: <span className="golden-text">{totalAirdrop} $SITY</span></p>

                        <ul>
                            {airdropBreakdown.map((breakdown, index) => (
                                <li key={index}>{breakdown}</li>
                            ))}
                        </ul>
                    </>
                )
            )}
        </div>
    );
};

export default AirdropCalculator;