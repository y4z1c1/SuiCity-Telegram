import { useEffect, useState } from "react";
import Mint from "./Mint";
import { useSignPersonalMessage, useCurrentAccount } from "@mysten/dapp-kit";


const WalletChecker = ({
    showModal,
    onMintSuccess,

}: {
    showModal: (message: string, bgColor: 0 | 1 | 2) => void;
    onMintSuccess: () => void;
}) => {
    const [screenName, setScreenName] = useState<string | null>(null); // Track Twitter screen name
    const [accessToken, setAccessToken] = useState<string | null>(null); // Track access token for Twitter
    const [boundWallet, setBoundWallet] = useState<string | null>(null); // Track the bound wallet address
    const [checkedBoundStatus, setCheckedBoundStatus] = useState<boolean>(false); // Track if the bound check has been made
    const [, setBindingChecked] = useState<boolean>(false); // Track if the bind check has been completed
    const currentAccount = useCurrentAccount(); // Get the current wallet address
    const tweetId = "1838160920129782259"; // Example tweet ID to check
    const { mutate: signPersonalMessage } = useSignPersonalMessage(); // Hook to sign message
    const [, setLoadingVerification] = useState<boolean>(false); // Track verification loading state
    const [, setIsFollowed] = useState<boolean>(false); // Track if follow task is clicked
    const [, setIsLiked] = useState<boolean>(false); // Track if like task is clicked
    const [, setIsRetweeted] = useState<boolean>(false); // Track if retweet task is clicked
    const [isQuoted,] = useState<boolean>(false); // Track if quote task is clicked
    const [, setIsVerified] = useState<boolean>(false); // Track if tasks are verified
    const [, setTasksEnabled] = useState<boolean>(true); // State to track if task buttons are enabled




    // Mimic checking if liked
    const checkIfLikedTweetAPI = async () => {
        if (!accessToken) {
            console.error("No access token available.");
            return false;
        }
        try {
            const response = await fetch("/.netlify/functions/check-like", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ tweetId }),
            });
            const data = await response.json();
            if (data.isLiked) {
                setIsLiked(true);
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error("Error checking tweet like:", error);
            return false;
        }
    };

    // Mimic checking if retweeted
    const checkIfRetweetedTweetAPI = async () => {
        if (!accessToken) {
            console.error("No access token available.");
            return false;
        }
        try {
            const response = await fetch("/.netlify/functions/check-retweet", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ tweetId }),
            });
            const data = await response.json();
            if (data.isRetweeted) {
                setIsRetweeted(true);
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error("Error checking tweet retweet:", error);
            return false;
        }
    };

    // Mimic checking if followed
    const checkIfFollowedAPI = async () => {
        if (!accessToken) {
            console.error("No access token available.");
            return false;
        }
        try {
            const response = await fetch("/.netlify/functions/follow", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();
            if (data.success) {
                setIsFollowed(true);
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error("Error checking follow:", error);
            return false;
        }
    };




    // Function to bind Twitter and wallet with signature
    const handleBindTwitterToWallet = async () => {
        if (!currentAccount?.address || !screenName) {
            console.error("No wallet address or Twitter screen name found.");
            return;
        }

        const message = `Binding Twitter ID ${screenName} to wallet ${currentAccount.address}`;

        // Sign the message
        signPersonalMessage(
            {
                message: new TextEncoder().encode(message),
            },
            {
                onSuccess: async (result) => {

                    // Send the signature and message to the backend
                    try {
                        const response = await fetch("/.netlify/functions/bind-twitter", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                twitterId: screenName,
                                walletAddress: currentAccount.address,
                                message,
                                signature: result.signature,
                            }),
                        });

                        const data = await response.json();
                        if (data.success) {
                            setBoundWallet(currentAccount.address); // Store the bound wallet
                            showModal("✅ Binding successful!", 1); // Show success modal (green)
                        } else {
                            showModal(`🚫 Binding failed: ${data.error}`, 0); // Show failure modal (red)
                        }
                    } catch (error) {
                        console.error("Error binding Twitter and wallet:", error);
                        showModal("🚫 Error binding Twitter and wallet.", 0); // Show error modal (red)
                    }
                },
                onError: (error) => {
                    console.error("Error signing the message:", error);
                    showModal("🚫 Error signing the message.", 0); // Show error modal (red)
                },
            }
        );
    };

    // Check if the bound Twitter account matches the current wallet
    const checkIfAlreadyBound = async (twitterId: string) => {
        if (!currentAccount?.address || checkedBoundStatus) return; // Prevent multiple calls

        try {
            const response = await fetch(
                `/.netlify/functions/check-binding?twitterId=${twitterId}`
            );
            const data = await response.json();

            if (data.isBound && data.walletAddress === currentAccount?.address) {
                console.log("Twitter account is already bound to this wallet.");
                setBoundWallet(currentAccount.address); // Set the bound wallet address
            } else if (data.isBound && data.walletAddress !== currentAccount?.address) {
                console.log("Twitter is bound to a different wallet. Showing error modal.");
                handleLogout(); // Log out if bound to a different wallet
                showModal(
                    "⚠️ This Twitter account is already bound to a different wallet. Please use another account.",
                    0 // Red background for errors
                );
            }

            setCheckedBoundStatus(true); // Mark as checked
            setBindingChecked(true); // Mark binding check as completed
        } catch (error) {
            console.error("Error checking binding status:", error);
            showModal("🚫 Error checking binding status.", 0); // Show error modal in red
        }
    };

    // Log the user out by clearing stored access token and screen name
    const handleLogout = () => {
        console.log("Logging out...");
        localStorage.removeItem("access_token");
        localStorage.removeItem("screen_name");
        setAccessToken(null);
        setScreenName(null);
    };

    // Rehydrate login state from URL or localStorage
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get("access_token");
        const screenNameFromUrl = urlParams.get("screen_name");

        // Store token and screenName from URL and remove the query params without refreshing the page
        if (tokenFromUrl && screenNameFromUrl) {
            try {
                const decodedAccessToken = decodeURIComponent(tokenFromUrl);
                const decodedScreenName = decodeURIComponent(screenNameFromUrl);

                // Update localStorage first
                localStorage.setItem("access_token", decodedAccessToken);
                localStorage.setItem("screen_name", decodedScreenName);

                // Set state after localStorage is updated
                setAccessToken(decodedAccessToken);
                setScreenName(decodedScreenName);

                // Remove the query params from the URL without refreshing the page
                window.history.replaceState({}, document.title, window.location.pathname);

                handleBindTwitterToWallet(); // Automatically bind after login
            } catch (error) {
                console.error("Error decoding URL parameters or saving to local storage:", error);
            }
        } else {
            // Fallback: Check if token and screen name exist in localStorage
            const tokenFromStorage = localStorage.getItem("access_token");
            const screenNameFromStorage = localStorage.getItem("screen_name");

            if (tokenFromStorage && screenNameFromStorage) {
                // Rehydrate state from localStorage
                setAccessToken(tokenFromStorage);
                setScreenName(screenNameFromStorage);
            } else {
                console.error("Access token or screen name not found in local storage or URL.");
            }
        }
    }, [currentAccount]);

    // Effect to check if Twitter and wallet are already bound
    useEffect(() => {
        if (screenName && currentAccount?.address && !checkedBoundStatus) {
            console.log("Checking if Twitter is already bound to wallet...::", screenName);
            checkIfAlreadyBound(screenName);
        }
    }, [screenName, currentAccount?.address, checkedBoundStatus]);

    // Effect to handle logging out of Twitter when the wallet address changes
    useEffect(() => {
        if (boundWallet && currentAccount?.address && boundWallet !== currentAccount.address) {
            console.log("Wallet address changed, logging out of Twitter...");
            handleLogout(); // Log out if the wallet address changes
        }
    }, [currentAccount?.address, boundWallet]);



    return (
        <div className="wallet-checker">

            <>
                <Mint showModal={showModal} onMintSuccessful={onMintSuccess} />

            </>


        </div>
    );
};

export default WalletChecker;
