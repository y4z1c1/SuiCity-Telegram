import React, { useEffect, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";

interface LeaderboardItem {
    _id: string;
    walletAddress: string;
    population: number;
    nft: string;
    nftName: string;
    twitterId: string;
}

interface LeaderboardProps {
    population: number; // The current SITY balance
}

const Leaderboard: React.FC<LeaderboardProps> = ({
    population,
}) => {
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [rank, setRank] = useState<number | null>(null);
    const [currentUserData, setCurrentUserData] = useState<LeaderboardItem | null>(null);
    const account = useCurrentAccount();
    const [showNFTName, setShowNFTName] = useState(true);
    const [cooldown, setCooldown] = useState<number | null>(null);

    const walletAddress = account?.address || "";
    const formatBalance = (balance: number) => {
        if (balance >= 1000000) {
            return (balance / 1000000).toFixed(2) + "M";
        } else if (balance >= 1000) {
            return (balance / 1000).toFixed(2) + "k";
        }
        return balance.toFixed(2);
    };

    const fetchLeaderboard = async (walletAddress: string) => {
        try {
            setLoading(true);
            const response = await fetch(`/.netlify/functions/get-leaderboard?walletAddress=${encodeURIComponent(walletAddress)}`);
            if (!response.ok) {
                throw new Error("Failed to fetch leaderboard");
            }
            const data = await response.json();
            const { topUsers, currentUser } = data;
            setLeaderboardData(topUsers);
            setRank(currentUser.rank);
            setCurrentUserData(currentUser);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An error occurred while fetching leaderboard data.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (walletAddress) {
            fetchLeaderboard(walletAddress);
        }
    }, [walletAddress]);

    const updatePopulation = async () => {
        if (!account?.address) {
            console.error("No account address found");
            return false;
        }

        try {
            const response = await fetch("/.netlify/functions/add-population", {
                method: "POST",
                body: JSON.stringify({
                    walletAddress: account.address,
                    population: population,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                console.error("Failed to update population");
                return false;
            } else {
                console.log("Population updated successfully with values:", account.address, population);
                return true;
            }
        } catch (error) {
            console.error("Error updating population:", error);
            return false;
        }
    };

    const handleRefresh = async () => {
        setLoading(true);
        const populationUpdated = await updatePopulation();
        if (populationUpdated) {
            await fetchLeaderboard(walletAddress);
        }
        setLoading(false);

        // Start the cooldown countdown from 30 seconds
        setCooldown(30);
    };

    // Countdown effect
    useEffect(() => {
        if (cooldown === null || cooldown <= 0) return;

        const intervalId = setInterval(() => {
            setCooldown((prevCooldown) => (prevCooldown !== null ? prevCooldown - 1 : null));
        }, 1000);

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, [cooldown]);

    if (loading) {
        return (
            <>
                <div className="leaderboard-content">
                    <table>
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>NFT Name</th>
                                <th>Population</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...Array(50)].map((_, index) => (
                                <tr key={index}>
                                    <td>
                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                                    </td>
                                    <td className="skeleton-animate" style={{ width: '190%' }}></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <button onClick={handleRefresh} disabled={loading} className="refresh-button">
                    <div className="refr-spinner"></div>
                </button>
            </>
        );
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <>
            <div className="leaderboard-content">
                <table>
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>{showNFTName ? "NFT Name" : "Twitter ID"} <span style={{ cursor: "pointer" }} onClick={() => setShowNFTName(!showNFTName)}>🔁</span></th>
                            <th>Population</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboardData.map((user, index) => (
                            <tr
                                key={user._id}
                                className={user.walletAddress === currentUserData?.walletAddress ? "highlight-row" : ""}
                            >
                                <td>
                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                                </td>
                                <td style={user.walletAddress === currentUserData?.walletAddress ? { color: "black", fontWeight: "500" } : { color: "white", fontWeight: "300" }}>
                                    {showNFTName ? user.nftName : user.twitterId}
                                </td>
                                <td>{formatBalance(user.population)}</td>
                            </tr>
                        ))}
                        {rank && rank > 50 && currentUserData && (
                            <tr className="highlight-row">
                                <td>{rank}.</td>
                                <td>{showNFTName ? currentUserData.nftName : currentUserData.twitterId}</td>
                                <td>{formatBalance(currentUserData.population)}</td>
                            </tr>
                        )}
                        {rank === 0 && (
                            <tr>
                                <td className="refresh-message">Please refresh the page.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <button onClick={handleRefresh} disabled={loading || cooldown !== null && cooldown > 0} className="refresh-button">
                {cooldown !== null && cooldown > 0 ? `${cooldown}` : "Refresh"}
            </button>
        </>
    );
};

export default Leaderboard;
