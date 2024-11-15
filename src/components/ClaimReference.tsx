import { useState, useCallback, useEffect } from "react";
import { ADDRESSES } from "../../addresses.ts";
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { bcs } from "@mysten/sui/bcs";

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

const ClaimReference = ({
  currentAccount, // Receive currentAccount as a prop
  onClaimSuccessful,
  showModal,
  nft, // New prop to accept NFT
  currentNonce,
  walletObject

}: {
  currentAccount: { address: string }; // Define the shape of currentAccount
  showModal: (message: string, bgColor: 0 | 1 | 2) => void;
  onClaimSuccessful: () => void;
  currentNonce: number | null;
  walletObject: any;
  nft: any;
}) => {
  const [refNumber, setRefNumber] = useState<string>(""); // Reference number input by the user
  const [, setReferenceWalletAddress] = useState<string | null>(null); // Fetched wallet address
  const [, setMySignature] = useState<string | null>(null); // Signature from backend
  const [, setHashedMessage] = useState<string | null>(null); // Hashed message from backend
  const [refUsed, setRefUsed] = useState<boolean>(false); // Hashed message from backend
  const [loading, setLoading] = useState<boolean>(false); // Loading state for button

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

  useEffect(() => {
    if (!nft) return;
    setRefUsed(nft.content.fields.use_check[0]);
  }, [nft]); // Ensure 'nft' is passed correctly as a dependency

  // Function to claim the reference reward
  const claimReferenceReward = useCallback(async () => {
    try {
      setLoading(true); // Start loading when the function is triggered

      if (!refNumber) {
        showModal("❗️ Please enter a reference number.", 0);
        setLoading(false);
        return;
      }

      // Step 1: Fetch the reference wallet address automatically
      const fetchReferenceResponse = await fetch(
        "/.netlify/functions/get-reference-wallet",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refNumber }),
        }
      );
      const refData = await fetchReferenceResponse.json();

      if (!refData.walletAddress) {
        showModal("❗️ Reference wallet not found", 0); // Show error modal
        setLoading(false);
        return;
      }

      setReferenceWalletAddress(refData.walletAddress);

      // Step 2: Sign the reference claim automatically
      const signResponse = await fetch("/.netlify/functions/ref-sign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentWalletAddress: currentAccount?.address, // Use currentAccount from prop
          referenceWalletAddress: refData.walletAddress,
          currentNonce: currentNonce,
        }),
      });

      const signData = await signResponse.json();
      if (!signData.hexSign || !signData.message) {
        showModal("❗️ Failed to sign the claim", 0);
        setLoading(false);
        return;
      }

      setMySignature(signData.hexSign); // Set the signature
      setHashedMessage(signData.message); // Set the hashed message


      // Check if the reference code belongs to the current user
      if (refData.walletAddress === currentAccount.address) {
        showModal("🚫 You cannot use your own reference code.", 0); // Show error modal
        setLoading(false);
        return;
      }

      // Step 3: Execute the claim transaction
      const signatureArray = hexToUint8Array(signData.hexSign);
      const transactionBlock = new Transaction();

      console.log("message is: ", signData.message);

      transactionBlock.moveCall({
        target: `${ADDRESSES.PACKAGE}::nft::claim_reference`,
        arguments: [
          transactionBlock.object(`${ADDRESSES.GAME}`), // Game data object
          transactionBlock.object(`${nft.content.fields.id.id}`),
          transactionBlock.object(`${walletObject}`),
          transactionBlock.object(`${refData.walletId}`),
          transactionBlock.object(`${refData.walletAddress}`),
          transactionBlock.pure(bcs.vector(bcs.U8).serialize(signatureArray)), // Serialize Uint8Array for signature
          transactionBlock.pure.string(signData.message), // Serialize message
        ],
      });


      signAndExecute(
        { transaction: transactionBlock },
        {
          onSuccess: async () => {
            onClaimSuccessful(); // Trigger the success callback
            setRefUsed(true); // Disable the button after successful claim
            showModal("✅ Claim Successful!", 1); // Show success modal
            setLoading(false); // Stop loading

            // Call add-ref function to update the reference owner's usedRefs array
            try {
              const response = await fetch("/.netlify/functions/add-ref", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  refOwnerWallet: refData.walletAddress, // Reference owner
                  claimerWallet: currentAccount.address, // Claimer's address
                }),
              });

              const refUpdateData = await response.json();
              if (refUpdateData.message) {
                console.log("Reference updated:", refUpdateData.message);
              } else {
                console.error("Error updating reference:", refUpdateData.error);
                showModal("🚫 Error :" + refUpdateData.error, 0); // Show error modal
              }
            } catch (error) {
              console.error("Error calling add-ref function:", error);
              showModal(`🚫 Error: ${(error as Error).message}`, 0);
            }
          },
          onError: (error) => {
            console.error("Claim error:", error);
            showModal(`🚫 Error: ${error.message}`, 0); // Show error modal
            setLoading(false); // Stop loading on error
          },
        }
      );
    } catch (error) {
      console.error("Claim Error:", error);
      showModal(`🚫 Claim Error: ${(error as Error).message}`, 0); // Show generic error modal
      setLoading(false); // Stop loading on error
    }
  }, [signAndExecute, onClaimSuccessful, refNumber, currentAccount, nft, showModal]);

  return (
    <div className="ref">

      <div style={{ marginBottom: "2%", textAlign: "center" }}>
        <span>Claim your <span className="golden-text">5000 $SITY</span> reward.</span>

      </div>


      {/* Input for the reference number */}
      <input
        type="text"
        value={refNumber}
        onChange={(e) => setRefNumber(e.target.value)}
        placeholder="🎁 Enter Reference Number"
        className="px-4 py-2 border border-gray-300 rounded-md"
      />

      {/* Single button to claim reference reward */}
      <button
        className="claim-ref-button"
        onClick={claimReferenceReward}
        disabled={refUsed || loading} // Disable the button if ref_used is true or loading is true
      >
        {loading ? "Processing..." : "Claim Reference Reward"}
      </button>
    </div>
  );
};

export default ClaimReference;
