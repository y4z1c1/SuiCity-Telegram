import { useState, useCallback, useEffect, useMemo } from "react";
import { ADDRESSES } from "../../addresses.ts";
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { bcs } from "@mysten/sui/bcs";

interface Domain {
    data: {
        content: {
            fields: {
                domain_name: string;
                expiration_timestamp_ms: string;
            };
        };
    };
}

// Helper function to convert hex string to Uint8Array
const hexToUint8Array = (hexString: string) => {
    if (hexString.startsWith("0x") || hexString.startsWith("0X")) {
        hexString = hexString.slice(2);
    }
    if (hexString.length % 2 !== 0) {
        throw new Error("Invalid hex string");
    }
    const array = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
        array[i / 2] = parseInt(hexString.substr(i, 2), 16);
    }
    return array;
};

const ChangeName = ({
    currentAccount,
    onChangeNameSuccessful,
    showModal,
    nft,
    currentNonce,
    sityBalance,
    walletObject,
    gameData,
    domains,
}: {
    currentAccount: { address: string };
    onChangeNameSuccessful: () => void;
    showModal: (message: string, bgColor: 0 | 1 | 2) => void;
    nft: any;
    currentNonce: number | null;
    sityBalance: number;
    walletObject: any;
    gameData: any;
    domains: Domain[];
}) => {
    const [newName, setNewName] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const domainsPerPage = 5;
    const extractedName = newName.replace(".sui", "");

    const suiClient = useSuiClient();
    const { mutate: signAndExecute } = useSignAndExecuteTransaction({
        execute: async ({ bytes, signature }) =>
            await suiClient.executeTransactionBlock({
                transactionBlock: bytes,
                signature,
                options: {
                    showRawEffects: true,
                    showEffects: true,
                },
            }),
    });

    // Fetch required SITY amount from gameData
    const [requiredSityAmount, setRequiredSityAmount] = useState<number>(0);

    useEffect(() => {
        if (gameData) {
            try {
                const extraSityCosts = gameData.extra_sity_costs;
                const costMultiplier = parseInt(gameData.cost_multiplier);

                const sityCost = parseInt(extraSityCosts[0]) * costMultiplier;
                const adjustedSityCost = sityCost / 100;

                setRequiredSityAmount(adjustedSityCost);
            } catch (error) {
                console.error("Error fetching required SITY amount:", error);
                setRequiredSityAmount(100000000); // Default amount
            }
        }
    }, [gameData]);

    const filteredDomains = useMemo(() => {
        const currentTime = Date.now();
        const currentNftName = nft?.content?.fields?.name?.toLowerCase() || ""; // Get the current name of the NFT
        console.log("currentNftName: ", currentNftName);

        return domains.filter((domain) => {
            const fields = domain.data.content.fields;
            const expirationTimestamp = parseInt(fields.expiration_timestamp_ms, 10);
            const domainName = fields.domain_name.toLowerCase();
            const transformedDomainName = `${domainName.replace(".sui", "")}'s city`.toLowerCase(); // Apply the transformation

            const matchesSearch = domainName.includes(searchTerm.toLowerCase());

            console.log("transformedDomainName: ", transformedDomainName);

            // Exclude the domain if its transformed name matches the current NFT name
            return (
                expirationTimestamp > currentTime &&
                matchesSearch &&
                transformedDomainName !== currentNftName
            );
        });
    }, [domains, searchTerm, nft]);



    // Pagination logic
    const indexOfLastDomain = currentPage * domainsPerPage;
    const indexOfFirstDomain = indexOfLastDomain - domainsPerPage;
    const currentDomains = filteredDomains.slice(indexOfFirstDomain, indexOfLastDomain);
    const totalPages = Math.ceil(filteredDomains.length / domainsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleDomainSelect = (domainName: string) => {
        setNewName(domainName);
    };

    const handleChangeName = useCallback(async () => {
        try {
            setLoading(true);

            if (!newName) {
                showModal("❗️ Please select a domain name.", 0);
                setLoading(false);
                return;
            }

            if (sityBalance * 1000 < requiredSityAmount) {
                showModal("❗️ Insufficient SITY balance.", 0);
                setLoading(false);
                return;
            }

            const senderAddress = currentAccount.address;
            const nonce = currentNonce !== null ? currentNonce : 0;
            const message = `${extractedName}'s City:${senderAddress}:${nonce}`;

            const signResponse = await fetch("/.netlify/functions/sign-change-name", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message }),
            });

            const signData = await signResponse.json();
            if (!signData.hexSign) {
                showModal("❗️ Failed to sign the message.", 0);
                setLoading(false);
                return;
            }

            const signatureArray = hexToUint8Array(signData.hexSign);

            const transactionBlock = new Transaction();
            transactionBlock.moveCall({
                target: `${ADDRESSES.PACKAGE}::nft::change_name_with_sity_updated`,
                arguments: [
                    transactionBlock.object(`${nft.content.fields.id.id}`),
                    transactionBlock.object(`${ADDRESSES.GAME}`),
                    transactionBlock.object(String(walletObject)),
                    transactionBlock.pure(bcs.vector(bcs.U8).serialize(signatureArray)),
                    transactionBlock.pure.string(message),
                ],
            });

            signAndExecute(
                { transaction: transactionBlock },
                {
                    onSuccess: () => {
                        onChangeNameSuccessful();
                        showModal("✅ Name changed successfully!", 1);
                        setLoading(false);
                    },
                    onError: (error) => {
                        showModal(`🚫 Error: ${error.message}`, 0);
                        setLoading(false);
                    },
                }
            );
        } catch (error) {
            showModal(`🚫 Error: ${(error as Error).message}`, 0);
            setLoading(false);
        }
    }, [
        newName,
        requiredSityAmount,
        currentAccount,
        currentNonce,
        signAndExecute,
        nft,
        onChangeNameSuccessful,
        showModal,
        sityBalance,
        walletObject,
    ]);

    return (
        <div className="change-name">
            <h3>Change Your City's Name 🌇</h3>
            <p>Select one of your SuiNS domains to set as the new name.</p>

            <input
                type="text"
                placeholder="🔍 Search SuiNS domains..."
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                }}
            />

            {filteredDomains.length === 0 ? (
                <p>No SuiNS domains found.</p>
            ) : (
                <>

                    <ul>
                        {currentDomains.map((domain, index) => {
                            const domainName = domain.data.content.fields.domain_name;
                            return (
                                <li key={index}>
                                    <button
                                        onClick={() => handleDomainSelect(domainName)}
                                        className={newName === domainName ? 'selected' : ''}
                                    >
                                        {domainName.replace(".sui", "")}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="pagination-controls">
                        <button onClick={handlePrevPage} disabled={currentPage === 1}>
                            ←
                        </button>
                        <span>
                            {currentPage}/{totalPages}
                        </span>
                        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                            →
                        </button>
                    </div>
                </>
            )}

            <button
                className="change-name-button"
                onClick={handleChangeName}
                disabled={loading || !newName}
            >
                {loading ? "Processing..." : "✍️ Change Name for 100k $SITY"}
            </button>
        </div>
    );
};

export default ChangeName;
