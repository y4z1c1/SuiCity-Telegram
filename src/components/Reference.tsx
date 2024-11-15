import { useState, useEffect } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import ClaimReference from "./ClaimReference";

interface ReferenceProps {
    nft: any;
    showModal: (message: string, bgColor: 0 | 1 | 2) => void;
    officeLevel: number;
    factoryLevel: number;
    houseLevel: number;
    enterLevel: number;
    walletObject: any;
    currentNonce: number | null;
    onClaimSuccessful: () => void;
}

const Reference = ({ nft, showModal, officeLevel, factoryLevel, houseLevel, enterLevel, currentNonce, onClaimSuccessful, walletObject }: ReferenceProps) => {
    const currentAccount = useCurrentAccount();
    const [refNumber, setRefNumber] = useState<number | null>(null);
    const [usedRefs, setUsedRefs] = useState<{ wallet: string; twitterId?: string; emoji?: string }[]>([]);
    const [, setNewUsedRefs] = useState<string[]>([]);
    const [refUsed, setRefUsed] = useState<boolean>(false);
    const [isUsersListOpen, setIsUsersListOpen] = useState<boolean>(false);
    const [loadingRef, setLoadingRef] = useState<boolean>(false);

    const personEmojis = ['👩', '👨', '🧑', '👧', '👦', '👵', '👴', '🧓'];

    const getRandomEmoji = () => {
        const randomIndex = Math.floor(Math.random() * personEmojis.length);
        return personEmojis[randomIndex];
    };

    useEffect(() => {
        if (nft?.content?.fields?.use_check) {
            setRefUsed(nft.content.fields.use_check[0]);
            console.log("Reference used:", nft.content.fields.use_check[0]);
        }
    }, [nft]);

    useEffect(() => {
        const fetchReferences = async () => {
            await fetchUsedRefs();
        };

        fetchReferences();

        const intervalId = setInterval(() => {
            console.log("Fetching used references...");
            fetchUsedRefs();
        }, 900000);

        return () => clearInterval(intervalId);
    }, [currentAccount]);

    const fetchRefNumber = async () => {
        setLoadingRef(true);
        if (!currentAccount?.address || !nft) {
            console.error("No wallet address or NFT found.");
            return;
        }

        try {
            const response = await fetch("/.netlify/functions/get-ref-number", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ walletAddress: currentAccount.address }),
            });

            const data = await response.json();
            if (data.refNumber) {
                setRefNumber(data.refNumber);
                setLoadingRef(false);
            } else {
                console.error("Reference number not found:", data.error);
                showModal("❗️ Reference number not found.", 0);
                setLoadingRef(false);
            }
        } catch (error) {
            console.error("Error fetching reference number:", error);
            if (error instanceof Error) {
                setLoadingRef(false);

                showModal(`🚫 Error fetching reference number: ${error.message}`, 0);
            } else {
                setLoadingRef(false);

                showModal("🚫 Error fetching reference number.", 0);
            }
        }
    };

    const fetchUsedRefs = async () => {
        try {
            console.log("Fetching used references...");
            const response = await fetch("/.netlify/functions/get-used-refs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ walletAddress: currentAccount?.address }),
            });

            const data = await response.json();
            if (data.usedRefs) {
                console.log("Used references found:", data.usedRefs);

                const twitterResponse = await fetch("/.netlify/functions/get-twitter-id", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ walletAddresses: data.usedRefs }),
                });

                const twitterData = await twitterResponse.json();
                const enrichedRefs = data.usedRefs.map((wallet: string) => {
                    const twitterEntry = twitterData.twitterIds.find((entry: { walletAddress: string }) => entry.walletAddress === wallet);
                    return {
                        wallet,
                        twitterId: twitterEntry ? twitterEntry.twitterId : undefined,
                        emoji: getRandomEmoji(),
                    };
                });

                setUsedRefs(enrichedRefs);
                console.log("Enriched used references:", enrichedRefs);
            }
            if (data.newRefs) {
                console.log("New references found:", data.newRefs);
                setNewUsedRefs(data.newRefs);
            } else {
                console.error("No new references found:", data.error);
            }
        } catch (error) {
            console.error("Error fetching used refs:", error);
            if (error instanceof Error) {
                console.log(`🚫 Error fetching used references: ${error.message}`);
            } else {
                console.log("🚫 Error fetching used references.");
            }
        }
    };

    const toggleUsersList = () => {
        setIsUsersListOpen(!isUsersListOpen);
    };

    return (
        <div className="reference-system">
            <button className="reference-system-button" onClick={fetchRefNumber} disabled={!!refNumber}>
                {loadingRef ? <div className="ref-spinner"></div> : (refNumber ? `${refNumber}` : "Generate Reference Code")}
            </button>

            {refNumber && (
                <p>
                    This is your reference code. Share it with your friends to get 5K $SITY when they use it.
                </p>
            )}

            {currentAccount && !refUsed && (Number(houseLevel) + Number(officeLevel) + Number(factoryLevel) + Number(enterLevel) >= 3) && (
                <ClaimReference
                    nft={nft}
                    currentAccount={currentAccount}
                    onClaimSuccessful={() => {
                        showModal("✅ Claim was successful!", 1);
                        setRefUsed(true);
                        onClaimSuccessful();
                    }}
                    showModal={showModal}
                    currentNonce={currentNonce}
                    walletObject={walletObject}
                />
            )}

            {(Number(houseLevel) + Number(officeLevel) + Number(factoryLevel) + Number(enterLevel) < 3) && (
                <p>
                    You need at least 3 total building level to use the reference reward.
                </p>
            )}

            {refUsed && (Number(houseLevel) + Number(officeLevel) + Number(factoryLevel) + Number(enterLevel) >= 3) && (
                <>
                    Share your reference code with your friends to get 5K $SITY when they use it.
                </>
            )}

            {usedRefs.length > 0 && (
                <div>
                    <h3 onClick={toggleUsersList} style={{ cursor: 'pointer' }}>
                        👥 Your references
                        <span style={{ fontSize: "50%" }}>{isUsersListOpen ? '▲' : '▼'}</span>
                    </h3>
                    {isUsersListOpen && (
                        <>
                            <div className="reflist" style={{ maxHeight: '150px', overflowX: 'auto', overflowY: 'scroll', display: 'flex', flexWrap: 'wrap', gap: '1px', justifyContent: "center" }}>

                                {usedRefs.map((ref, index) => (
                                    <div key={index} style={{ minWidth: '100px', maxWidth: '100px', textAlign: 'center' }}>
                                        {ref.twitterId ? (
                                            <p style={{ fontWeight: "500" }}>{ref.twitterId}</p>
                                        ) : (
                                            <p>{ref.wallet.slice(0, 12)}...{ref.wallet.slice(-12)}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default Reference;
