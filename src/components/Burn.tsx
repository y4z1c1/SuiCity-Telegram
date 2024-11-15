import { useCallback, useEffect, useState } from "react";
import { BURN } from "../../burn.ts";
import { coinWithBalance, Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";

const Burn = ({
    onBurnSuccessful,
    showModal,
    nftIdToBurn, // Add nftIdToBurn prop to specify the NFT to burn
}: {
    showModal: (message: string, bgColor: 0 | 1 | 2) => void;
    onBurnSuccessful: () => void;
    nftIdToBurn: string; // NFT ID to burn
}) => {
    const suiClient = useSuiClient();
    const [loading, setLoading] = useState<boolean>(false);
    const account = useCurrentAccount();
    const [, setOldBalance] = useState<number>(0);

    const provider = new SuiClient({
        url: getFullnodeUrl("mainnet"),
    });

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

    const fetchBalances = useCallback(async () => {
        if (!account?.address) {
            console.log("No account address found.");
            return 0; // Return 0 if no account
        }

        try {
            console.log("Fetching balance for account:", account?.address);
            const [sity] = await Promise.all([
                provider.getBalance({
                    owner: String(account?.address),
                    coinType: `${BURN.TOKEN_TYPE}`,
                }),
            ]);

            const fetched = parseInt(sity.totalBalance) / Number(1000);

            // Update state
            setOldBalance(fetched);
            console.log("Fetched balance:", fetched);

            // Return fetched balance
            return fetched;
        } catch (error) {
            console.error("Error fetching balances:", error);
            return 0; // Return 0 on error
        }
    }, [account?.address]);

    const burn = useCallback(async () => {
        console.log("Starting burn process...");

        const fetchedBalance = await fetchBalances();
        console.log("Fetched balance before burn:", fetchedBalance);

        setLoading(true);
        try {
            console.log("Burning NFT with ID:", nftIdToBurn);

            const transactionBlock = new Transaction();

            console.log("Preparing move call for claiming SITY.");
            transactionBlock.moveCall({
                target: `${BURN.PACKAGE}::nft::claim_sity`,
                arguments: [
                    transactionBlock.object(`${nftIdToBurn}`), // Pass the NFT to burn
                    transactionBlock.object(BURN.GAME),
                    transactionBlock.object(BURN.CLOCK),
                ],
            });

            console.log("Preparing move call for burning NFT.");
            transactionBlock.moveCall({
                target: `${BURN.PACKAGE}::nft::burn`,
                arguments: [
                    transactionBlock.object(`${nftIdToBurn}`), // Pass the NFT to burn
                ],
            });

            console.log("Setting sender to:", account?.address);
            transactionBlock.setSender(String(account?.address));

            console.log("Transferring objects (coins) with balance:", fetchedBalance * 1000);
            transactionBlock.transferObjects(
                [
                    coinWithBalance({
                        type: `${BURN.TOKEN_TYPE}`,
                        balance: Math.round(fetchedBalance * 1000), // Ensuring it's an integer
                    }),
                ],
                "0x0000000000000000000000000000000000000000000000000000000000000000",
            );

            console.log("Signing and executing the transaction...");
            signAndExecute(
                {
                    transaction: transactionBlock,
                },
                {
                    onSuccess: async (result) => {
                        console.log("Burn successful:", result);
                        // Handle successful burn
                        onBurnSuccessful(); // Trigger the success callback
                    },
                    onError: (error) => {
                        console.error("Burn error during execution:", error);
                        showModal(`🚫 Error: ${error}`, 0); // Show error message in the modal
                    },
                },
            );
        } catch (error) {
            console.error("Burn Error:", error);
            showModal(`🚫 Error: ${error}`, 0); // Show error message in the modal
        } finally {
            setLoading(false); // Stop loading when the burn is done
            console.log("Burn process completed.");
        }
    }, [signAndExecute, nftIdToBurn, onBurnSuccessful]);

    const reset = useCallback(() => {
        console.log("Resetting burn component state.");
    }, []);

    useEffect(() => {
        console.log("Component mounted. Running reset function.");
        reset();
    }, [reset]);

    return (
        <div className="burn">
            <button
                className="burn-button"
                onClick={burn}
                disabled={loading} // Disable button while burning
            >
                {loading ? "Burning..." : "🔥 Burn your Old NFT"}
            </button>

            <p>You are supposed to burn your old nft to continue with the new contract.</p>
        </div>
    );
};

export default Burn;
