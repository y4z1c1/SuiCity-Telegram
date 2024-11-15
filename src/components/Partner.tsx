import { useEffect, useState, useCallback } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { bcs } from "@mysten/sui/bcs";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { ADDRESSES } from "../../addresses.ts";
import "../assets/styles/Partner.css";

// Helper function to convert hex string to Uint8Array
const hexToUint8Array = (hexString: string) => {
    if (hexString.length % 2 !== 0) {
        throw new Error("Invalid hex string");
    }
    const array = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
        array[i / 2] = parseInt(hexString.substr(i, 2), 16);
    }
    return array;
};

const Partner = ({
    showModal,
    currentNonce,
    walletObject,
    onClaimSuccessful,
}: {
    showModal: (message: string, bgColor: 0 | 1 | 2) => void;
    currentNonce: number;
    walletObject: any;
    onClaimSuccessful: () => void;

}) => {
    const currentAccount = useCurrentAccount();
    const [isBobHolder, setIsBobHolder] = useState<boolean>(false);
    const [hasClaimed, setHasClaimed] = useState<boolean>(false);
    const [loadingClaim, setLoadingClaim] = useState<boolean>(false); // State for loading spinner
    const [isCheckingClaimStatus, setIsCheckingClaimStatus] = useState<boolean>(true); // State for database check loading

    const client = new SuiClient({ url: getFullnodeUrl("mainnet") });

    const { mutate: signAndExecute } = useSignAndExecuteTransaction({
        execute: async ({ bytes, signature }) =>
            await client.executeTransactionBlock({
                transactionBlock: bytes,
                signature,
                options: { showRawEffects: true, showEffects: true },
            }),
    });

    // Function to fetch token balances and check BOB holdings
    const fetchTokenBalances = async () => {
        if (!currentAccount?.address) return;

        try {
            const tokenBalance = await client.getBalance({
                owner: String(currentAccount.address),
                coinType: "0x5f3a18cdfd7ef0527a65ba5c07dbe0efe276507d4d1a4d1bebe87f5d40df6cf6::bob::BOB",
            });
            const balance = parseInt(tokenBalance.totalBalance) || 0;

            if (balance > 500000000000) {
                setIsBobHolder(true);
            }
        } catch (error) {
            console.error("Error fetching BOB token balance:", error);
        }
    };

    // Function to handle signing and claiming rewards
    const claimReward = useCallback(async () => {
        if (!currentAccount?.address) return;

        const message = `10000000:${currentAccount.address}:${currentNonce}`;
        setLoadingClaim(true); // Start loading spinner

        try {
            // Request to sign the message
            const response = await fetch("/.netlify/functions/sign-message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message }),
            });

            if (!response.ok) {
                throw new Error("Failed to sign the message");
            }

            const { hexSign } = await response.json();
            const signatureArray = hexToUint8Array(hexSign);

            // Prepare the transaction
            const transactionBlock = new Transaction();
            transactionBlock.moveCall({
                target: `0x6408a4f4cb3579347cd3f377a8e04a182be5e54631e6f97dca67f8ee61c59b18::nft::claim_reward`,
                arguments: [
                    transactionBlock.object(`${ADDRESSES.GAME}`), // Game data object
                    transactionBlock.object(`${walletObject}`), // Wallet object
                    transactionBlock.pure(bcs.vector(bcs.U8).serialize(signatureArray)),
                    transactionBlock.pure.string(message),
                ],
            });

            signAndExecute(
                {
                    transaction: transactionBlock,
                },
                {
                    onSuccess: async (result) => {
                        console.log("Claim successful", result);
                        onClaimSuccessful(); // Trigger the success callback

                        // Update claim status in MongoDB
                        await fetch("/.netlify/functions/update-bob-claim", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                walletAddress: currentAccount.address,
                                bobClaimed: true,
                            }),
                        });

                        showModal("✅ Claim successful!", 1); // Show success message in the modal
                        setHasClaimed(true);
                        setLoadingClaim(false); // End loading spinner
                    },
                    onError: (error) => {
                        console.error("Claim error:", error);
                        showModal(`🚫 Error: ${error}`, 0);
                        setLoadingClaim(false); // End loading spinner
                    },
                }
            );
        } catch (error) {
            console.error("Claim Error:", error);
            setLoadingClaim(false); // End loading spinner
            showModal(`🚫 Error: ${error}`, 0);
        }
    }, [currentAccount, showModal, currentNonce, client, signAndExecute, walletObject, onClaimSuccessful]);

    // Check if the user has already claimed the reward
    const checkClaimStatus = async () => {
        if (currentAccount?.address) {
            const response = await fetch("/.netlify/functions/check-bob-claim", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ walletAddress: currentAccount.address }),
            });
            const data = await response.json();
            setHasClaimed(data.bobClaimed);
            setIsCheckingClaimStatus(false); // End checking status after response
        }
    };

    // Effect to fetch data on component mount and when `currentAccount` changes
    useEffect(() => {
        // Reset states when the current account changes
        setIsBobHolder(false);
        setHasClaimed(false);
        setLoadingClaim(false);
        setIsCheckingClaimStatus(true); // Start the checking status again

        // Re-fetch data for the new account
        if (currentAccount?.address) {
            fetchTokenBalances();
            checkClaimStatus();
        }
    }, [currentAccount]);

    // Conditional rendering
    if (isCheckingClaimStatus) return null; // Show spinner during database check
    if (!isBobHolder || hasClaimed) return null;

    return (
        <div className="partner-system">
            <button onClick={claimReward} disabled={loadingClaim || isCheckingClaimStatus}>
                {loadingClaim ? <div className="partner-spinner"></div> : <><img src="/bob.webp" alt="bob" /> Claim 10K $SITY</>}
            </button>
            <p>This is an exclusive allocation for $BOB holders.</p>
        </div>
    );
};

export default Partner;
