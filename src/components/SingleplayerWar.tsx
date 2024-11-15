import { useCallback, useEffect, useState } from "react";
import { ADDRESSES } from "../../addresses.ts";
import { Transaction, coinWithBalance } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction, useSuiClient, useCurrentAccount } from "@mysten/dapp-kit";
import "../assets/styles/War.css";
import { MIST_PER_SUI } from "@mysten/sui/utils";

const SingleplayerWar = ({
    showModal,
    GameData,
    CastleLevel,
    onWarComplete,
    nft,
    walletObject,
    suiBalance,
}: {
    showModal: (message: string, bgColor: 0 | 1 | 2) => void;
    GameData: any;
    CastleLevel: number;
    onWarComplete: (result: string) => void; // Callback when war completes
    nft: any;
    walletObject: any;
    suiBalance: number;
}) => {
    const suiClient = useSuiClient();
    const account = useCurrentAccount();

    const [loading, setLoading] = useState<boolean>(false); // Add loading state
    const [showModeSelection, setShowModeSelection] = useState<boolean>(false); // Control mode selection modal visibility
    const [opponentPower, setOpponentPower] = useState<number | null>(null); // Track the selected power
    const [opponentName, setOpponentName] = useState<string>(""); // Track the selected opponent name
    const [isWarInProgress, setIsWarInProgress] = useState(false); // Track if war is ongoing
    const [warResult, setWarResult] = useState<"win" | "lose" | null>(null); // Track war result
    const [showWarVideo, setShowWarVideo] = useState(false); // Track if war video should be shown
    const [isResultShown, setIsResultShown] = useState(false); // Track if the result is shown after video ends
    const [reward, setReward] = useState<number>(0); // Track the reward
    const [videoStarted, setVideoStarted] = useState(false); // Track if the video has started
    const [isFading, setIsFading] = useState(false); // Track if the screen is fading to dark
    const [isVideoEnded, setIsVideoEnded] = useState(false); // Track if video ended
    const [isBlurring, setIsBlurring] = useState(false); // Track if the video is blurring
    const [bgSwitchInterval, setBgSwitchInterval] = useState<NodeJS.Timeout | null>(null);
    const [selectedEnemyIndex, setSelectedEnemyIndex] = useState<number | null>(null); // Track selected enemy
    const [warStory, setWarStory] = useState<string>(""); // Track the war story
    const [transactionDigest, setTransactionDigest] = useState<string | null>(null); // New state to track digest
    const [countdown, setCountdown] = useState<string | null>(null); // Countdown timer for 6 hours
    const [canStartWar, setCanStartWar] = useState(false); // Track if war can be started
    const [isShieldActive, setIsShieldActive] = useState<boolean>(false); // Track if shield is active
    const [videoSource, setVideoSource] = useState<string>(""); // Track the video source
    const [skipAnimation, setSkipAnimation] = useState<boolean>(
        /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    );


    const toggleSkipAnimation = () => {
        setSkipAnimation(!skipAnimation);
    };

    const calculateWinProbability = (userPower: number, opponentPower: number): string => {
        let probability = (userPower / (Number(userPower) + Number(opponentPower))) * 100;
        if (isShieldActive) {
            probability = ((userPower * 2.5) / (Number(userPower) * 2.5 + Number(opponentPower))) * 100; // Multiply by 1.5 if shield is active
        }
        return probability.toFixed(2) + '%';
    };

    const { mutate: signAndExecute } = useSignAndExecuteTransaction({
        execute: async ({ bytes, signature }) =>
            await suiClient.executeTransactionBlock({
                transactionBlock: bytes,
                signature,
                options: {
                    showRawEffects: true,
                    showEffects: true,
                    showEvents: true,
                },
            }),
    });


    // Function to check user's balance before initiating transaction
    const checkUserBalance = useCallback(() => {
        if (suiBalance < 0.01) {
            showModal("❗️ You need more SUI in order to pay gas.", 0);
            throw new Error("You need more SUI in order to pay gas.");
        }

        if (isShieldActive && suiBalance * Number(MIST_PER_SUI) < 150000000) {
            showModal("❗️ Insufficient SUI balance.", 0);
            throw new Error("Insufficient SUI balance.");
        }

        return true;
    }, [suiBalance, showModal]);

    // Function to format the balance for readability
    const formatBalance = (balance: number) => {
        if (balance >= 1000000) {
            return (balance / 1000000) + "M";
        } else if (balance >= 1000) {
            return (balance / 1000) + "k";
        }
        return balance;
    };

    const warPower = GameData.castle_powers[CastleLevel];

    const determineVideoType = (winProbability: number): number => {
        if (winProbability >= 80) {
            return 1; // Very high probability
        } else if (winProbability >= 60) {
            return 2; // High probability
        } else if (winProbability >= 40) {
            return 3; // Balanced probability
        } else if (winProbability >= 20) {
            return 4; // Low probability
        } else {
            return 5; // Very low probability
        }
    };

    const getProbabilityColor = (probability: number) => {
        // Convert probability from 0-100 to a 0-1 scale
        const normalizedProbability = probability / 100;

        // Define the start (red), middle (yellow), and end (green) colors in RGB format
        const startColor = { r: 255, g: 0, b: 0 }; // Red
        const middleColor = { r: 255, g: 255, b: 0 }; // Yellow
        const endColor = { r: 0, g: 255, b: 0 }; // Green

        // Custom thresholds for color transition (create illusion for more favorable colors at lower probabilities)
        // Custom thresholds for color transition
        const yellowThreshold = isShieldActive ? 0.3 : 0.5;
        const greenThreshold = isShieldActive ? 0.7 : 0.8;

        let r, g, b;

        if (normalizedProbability < yellowThreshold) {
            // Interpolate between startColor (red) and middleColor (yellow)
            const ratio = normalizedProbability / yellowThreshold;
            r = Math.round(startColor.r + (middleColor.r - startColor.r) * ratio);
            g = Math.round(startColor.g + (middleColor.g - startColor.g) * ratio);
            b = Math.round(startColor.b + (middleColor.b - startColor.b) * ratio);
        } else if (normalizedProbability < greenThreshold) {
            // Interpolate between middleColor (yellow) and endColor (green)
            const ratio = (normalizedProbability - yellowThreshold) / (greenThreshold - yellowThreshold);
            r = Math.round(middleColor.r + (endColor.r - middleColor.r) * ratio);
            g = Math.round(middleColor.g + (endColor.g - middleColor.g) * ratio);
            b = Math.round(middleColor.b + (endColor.b - middleColor.b) * ratio);
        } else {
            // Use full green for probabilities above the greenThreshold
            r = endColor.r;
            g = endColor.g;
            b = endColor.b;
        }

        return `rgb(${r}, ${g}, ${b})`;
    };



    // Calculate the time remaining until 6 hours are up
    useEffect(() => {
        const checkLastWarTime = () => {
            const lastWarTime = new Date(Number(nft.content.fields.last_war)); // No need to multiply by 1000

            const currentTime = new Date();
            const diffInMs = lastWarTime.getTime() + 8 * 60 * 60 * 1000 - currentTime.getTime(); // 6 hours in milliseconds


            if (diffInMs > 0) {
                const hours = Math.floor(diffInMs / (1000 * 60 * 60));
                const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diffInMs % (1000 * 60)) / 1000);
                setCountdown(`${hours}h ${minutes}m ${seconds}s`);

                setCanStartWar(false);
            } else {
                setCountdown(null);
                setCanStartWar(true);
            }
        };

        // Start an interval to update the countdown every second
        const intervalId = setInterval(checkLastWarTime, 1000);

        return () => clearInterval(intervalId); // Clear the interval on component unmount
    }, [nft.content.fields.last_war]);

    const generateRandomEvents = (
        isWin: boolean,
        nftName: string,
        warPower: number,
        opponentPower: number,
        _opponentName: string
    ): string => {
        const powerDifference = Number(warPower) - Number(opponentPower);
        console.log("Power Difference:", powerDifference);

        const winEvents = [
            // Win with significantly higher power
            powerDifference > 10
                ? [
                    `${nftName}'s forces charged fiercely, overwhelming the enemy in a show of unmatched strength.`,
                    "Victory was swift as your forces moved decisively, crushing any resistance before them.",
                    `The enemy’s ranks quickly shattered, and soon, all that remained were banners of triumph.`,
                    "In a brilliant display of power, your troops pushed forward, driving the opposing forces into a full retreat.",
                    "The clash was brief, with your soldiers overwhelming the battlefield and securing a dominant victory."
                ]
                :
                // Win with lower power
                powerDifference < 0
                    ? [
                        "With cunning tactics, your forces exploited weaknesses, claiming victory despite the odds.",
                        `${nftName} inspired their troops to press on, turning the tide with skillful maneuvers.`,
                        "Though outmatched, your soldiers fought bravely, securing an unexpected but hard-earned victory.",
                        "Displaying remarkable skill, your troops outmaneuvered the enemy, turning the power gap into a strength.",
                        "In a battle that seemed destined for defeat, quick thinking led to a victory few could have predicted."
                    ]
                    :
                    // Win with equal power
                    [
                        "In a fierce clash between nearly equal forces, your side prevailed through sheer determination.",
                        `${nftName} led a hard-fought battle, where neither side held an advantage for long.`,
                        "The standoff was intense, but in the end, your forces claimed victory in a close and brutal fight.",
                        "Both sides fought valiantly, with victory finally tipping in your favor after an exhausting struggle.",
                        "Against a resilient enemy, your troops proved their endurance, taking control of the battlefield."
                    ]
        ];

        const loseEvents = [
            // Lose with much lower power
            powerDifference < -10
                ? [
                    "Your forces fought valiantly but were overwhelmed by the enemy's sheer might.",
                    `${nftName} held the line as long as possible, but the opponent’s strength proved too great.`,
                    "The enemy swept forward with overwhelming power, forcing a hasty retreat.",
                    "Despite their bravery, your troops were simply outmatched by a stronger force.",
                    "The clash was brief, as the enemy's superior numbers and strength claimed a swift victory."
                ]
                :
                // Lose despite having higher power
                powerDifference > 0
                    ? [
                        "The enemy's cunning tactics turned the tide, snatching victory from your grasp.",
                        "Despite holding a power advantage, your forces were caught off guard, leading to an unexpected defeat.",
                        "Surprise maneuvers from the opponent outsmarted your troops, pushing them into a retreat.",
                        `${nftName} tried to press the advantage, but the enemy’s strategy turned the battle in their favor.`,
                        "Holding the upper hand wasn’t enough, as the opponent’s wit and quick thinking led to a stunning reversal."
                    ]
                    :
                    // Lose with equal power
                    [
                        "In a balanced clash, the enemy managed to seize control after an intense struggle.",
                        `${nftName}'s troops met a tough adversary, and after a brutal exchange, were forced to retreat.`,
                        "The battle was evenly matched, but the enemy capitalized on a small opening, claiming victory.",
                        "After a fierce, close fight, your forces withdrew, leaving the enemy to claim the battlefield.",
                        "Despite fighting to the last, the battle finally tipped in the enemy's favor, marking a hard-fought defeat."
                    ]
        ];

        const selectedEvents = isWin ? winEvents : loseEvents;
        const randomIndex = Math.floor(Math.random() * selectedEvents.length);

        return `${selectedEvents[randomIndex][0]} ${selectedEvents[randomIndex][1]} ${selectedEvents[randomIndex][2]}`;
    };



    const startWar = useCallback(async () => {
        if (opponentPower === null) return; // Prevent starting without selecting a mode
        setLoading(true); // Set loading to true
        setIsResultShown(false); // Ensure the result isn't shown before video ends
        checkUserBalance(); // Throws error if balance is insufficient


        try {
            const transactionBlock = new Transaction();
            transactionBlock.setSender(String(account?.address));

            transactionBlock.moveCall({
                target: `0x716ca8485cdfb4ea0ceaa517bd892a12451b022a584be9ffb5013959abf57ee9::nft::${isShieldActive ? "simulate_singleplayer_war_with_sui" : "simulate_singleplayer_war"}`,
                arguments: [
                    transactionBlock.object("0x8"), // opponent power
                    transactionBlock.objectRef({
                        objectId: nft.objectId,
                        digest: nft.digest,
                        version: nft.version,
                    }),
                    transactionBlock.object(`${ADDRESSES.CLOCK}`),
                    transactionBlock.object(`${ADDRESSES.GAME}`),
                    transactionBlock.object(String(walletObject)),
                    transactionBlock.pure.u64(opponentPower), // opponent power
                    ...(isShieldActive ? [coinWithBalance({ balance: 150000000 }),] : []), // Additional SUI cost if shield is on

                ],
            });

            signAndExecute(
                {
                    transaction: transactionBlock,
                },
                {
                    onSuccess: async (result) => {
                        console.log("War simulation successful", result);
                        const event = result.events;
                        const digest = result.digest; // Capture the transaction digest

                        setTransactionDigest(digest); // Set the digest in state

                        if (event) {
                            const { result: warResult, reward } = event[0].parsedJson as { result: string; reward: string };
                            console.log("War result:", warResult, "Reward:", `${Number(reward) / 1000} $SITY`);
                            setReward(Number(reward) / 1000); // Set reward
                            onWarComplete(warResult); // Notify game of result
                            const isWin = warResult === "Win";
                            setWarResult(isWin ? "win" : "lose");
                            setWarStory(generateRandomEvents(isWin, nft.content.fields.name, warPower, opponentPower, opponentName));
                            // Determine the video type based on power comparison
                            const winProbability = calculateWinProbability(warPower, opponentPower);
                            const videoType = determineVideoType(parseFloat(winProbability));
                            const videoPath = `/videos/${videoType}${isWin ? "w" : "l"}`;
                            setVideoSource(videoPath);

                            if (skipAnimation) {
                                setIsWarInProgress(true);
                                setLoading(false);
                                setIsVideoEnded(true);
                                setShowWarVideo(true);
                                setIsResultShown(true); // Show result immediately
                                setIsFading(true);

                                document.body.classList.remove('success', 'error');

                                if (warResult === 'win') {
                                    console.log("You won the war!");
                                    document.body.classList.add('success');
                                } else {
                                    console.log("You lost the war!");
                                    document.body.classList.add('error');
                                }

                                setShowModeSelection(false);


                                setTimeout(() => {
                                    document.body.classList.remove('success', 'error');
                                }, 5000); // Remove the background color after 5 seconds

                            } else {
                                setIsWarInProgress(true);
                                setIsFading(true);
                                setTimeout(createAnimation, 500);
                            }

                            setTimeout(() => {
                                setShowModeSelection(false);
                            }, 5000);
                            // Add 'error' class to document body and start background switching
                            document.body.classList.add('error');
                            const interval = setInterval(() => {
                                document.body.classList.toggle('red');
                                document.body.classList.toggle('darkred');
                            }, 750); // Toggle between red and darkred every 500ms

                            setBgSwitchInterval(interval);
                        } else {
                            console.error("No war result found");
                        }
                        setLoading(false); // Stop loading when war is done

                    },
                    onError: (error) => {
                        console.error("War error:", error);
                        showModal(`🚫 ${error}`, 0); // Show error message in the modal
                        setLoading(false); // Stop loading when war is done

                    },
                }
            );
        } catch (error) {
            console.error("War Error:", error);
            showModal(`🚫 ${error}`, 0); // Show error message in the modal
            setLoading(false); // Stop loading when war is done

        }
    }, [signAndExecute, onWarComplete, opponentPower, canStartWar, isShieldActive]);

    // Handle fade-in effect and video start
    const createAnimation = () => {
        setShowWarVideo(true); // Show the war video after fade

        const fadeTimer = setTimeout(() => {
            setShowWarVideo(true); // Show the war video after fade
            setIsFading(false); // End fade
        }, 500); // 1 second fade duration

        const videoTimer = setTimeout(() => {
            setVideoStarted(true); // Start the video 2 seconds after fade-in
            console.log("Video started");
        }, 1500); // 1 second fade + 1.5 second delay

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(videoTimer);
        };
    };



    const openModeSelection = () => {
        setShowModeSelection(true); // Show the mode selection modal
        setShowWarVideo(false);
        setWarResult(null);
        setIsResultShown(false);
        setIsWarInProgress(false); // Reset after the video and results are shown
        setVideoStarted(false); // Reset video state
        setIsBlurring(false); // Reset blurring state
        setIsVideoEnded(false); // Reset video end state


    };

    const selectMode = (power: number, index: number, name: string) => {
        setOpponentPower(power);
        setOpponentName(name);
        setSelectedEnemyIndex(index); // Set selected enemy index for styling
    };

    const closeWarVideo = () => {
        setShowWarVideo(false);
        setWarResult(null);
        setIsResultShown(false);
        setIsWarInProgress(false); // Reset after the video and results are shown
        setVideoStarted(false); // Reset video state
        setShowModeSelection(false);
        setSelectedEnemyIndex(null); // Reset selected enemy index
        setIsResultShown(false); // Show the detailed result overlay after fade-out
        setIsVideoEnded(false); // Reset video end state
        setOpponentPower(null); // Reset opponent power

    };

    const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
        const videoElement = e.currentTarget;
        const remainingTime = videoElement.duration - videoElement.currentTime;

        // Start blurring when the last 2 seconds of the video play
        if (remainingTime <= 3 && !isBlurring) {
            setIsBlurring(true); // Start blurring
            // Stop the background switching when blurring begins
            if (bgSwitchInterval) {
                clearInterval(bgSwitchInterval);
                document.body.classList.remove('red', 'darkred', 'error', 'success');
                // Apply result-specific background class
                if (warResult === 'win') {
                    document.body.classList.add('success');
                } else {
                    document.body.classList.add('error');
                }
            }
        }


    };

    const handleVideoEnded = () => {
        setIsVideoEnded(true);
        setTimeout(() => {
            setIsResultShown(true); // Show the detailed result overlay after fade-out
        }, 1000); // Delay to allow fade-out animation

        document.body.classList.remove('success', 'error');
        if (warResult === 'win') {
            console.log("You won the war!");
            document.body.classList.add('success');
        } else {
            console.log("You lost the war!");
            document.body.classList.add('error');
        }


        setTimeout(() => {
            document.body.classList.remove('success', 'error');
        }, 5000); // Remove the background color after 5 seconds
    };




    const handleVideoError = () => {
        console.error("Video failed to load. Please check the video file paths.");
    };

    return (
        <>
            {/* War button inside war div */}
            <div className="war">
                {!showModeSelection ? (
                    <button
                        className="war-button"
                        onClick={openModeSelection}
                    >
                        {loading ? "Simulating..." : "⚔️ Battle"}


                    </button>
                ) : null}
            </div>


            {/* Modal outside of war div */}
            {showModeSelection && (
                <div className="war-modal">
                    <h3>Select Your Opponent:</h3>



                    <div className="war-cards-container">
                        {[
                            { image: "e4.png", cityName: "Jack's City", population: "350k", power: 100, reward: "480 $SITY" },
                            { image: "e1.png", cityName: "Fred's City", population: "350k", power: 500, reward: "2400 $SITY" },
                            { image: "e2.png", cityName: "Jonas's City", population: "350k", power: 1500, reward: "7500 $SITY" },

                            { image: "e0.png", cityName: "Paul's City", population: "2.4M", power: 5000, reward: "26000 $SITY" },
                            { image: "e3.png", cityName: "Theodor's City", population: "16M", power: 15000, reward: "80000 $SITY" }
                        ].map((enemy, index) => (
                            <div
                                className={`war-card-item ${selectedEnemyIndex === index ? 'selected' : ''}`}
                                key={index}
                                onClick={() => selectMode(enemy.power, index, enemy.cityName)} // Make card clickable
                            >
                                <img src={`/${enemy.image}`} alt={`${enemy.cityName} image`} className="enemy-image" />
                                <h4 className="city-name">{enemy.cityName}</h4>
                                <p
                                    className="probability-text"
                                    style={{ color: getProbabilityColor(parseFloat(calculateWinProbability(warPower, enemy.power))) }}
                                >
                                    Win chance: {calculateWinProbability(warPower, enemy.power)}
                                </p>

                                <p className="reward-text">Loot: <span className="reward-golden-text">{formatBalance(parseInt(enemy.reward))} $SITY</span></p>
                            </div>
                        ))}
                    </div>





                    <div className="war-buttons">
                        <div className="first-row">
                            <button
                                className={`shield-button ${isShieldActive ? "on" : ""}`}
                                onClick={() => setIsShieldActive(!isShieldActive)}
                            >
                                🛡️ Shield : {isShieldActive ? "On" : "Off"}
                            </button>
                            <button onClick={toggleSkipAnimation} className={`animation-button ${skipAnimation ? "" : "on"}`}
                            >
                                📹 Animation: {skipAnimation ? "Off" : "On"}
                            </button>
                        </div>

                        <div className="second-row">
                            <button
                                className="start-war-button"
                                onClick={startWar}
                                disabled={loading || opponentPower === null || !canStartWar}
                            >
                                {loading ? "Preparing for War..." : `Start War ${isShieldActive ? "for 0.15 SUI" : "for Free"}`}
                            </button>


                            <button className="close-button" onClick={() => setShowModeSelection(false)}>
                                Cancel
                            </button>

                        </div>




                    </div>

                    {!canStartWar && ( // Display countdown if it exists
                        <p className="countdown">⏳ Next War in: {countdown}</p> // Display countdown
                    )}

                </div>
            )}



            {isWarInProgress && (
                <div className={`war-overlay ${isFading ? 'fading' : ''} ${showWarVideo || skipAnimation ? 'visible' : ''} ${isResultShown || skipAnimation ? 'background-none' : ''}`}>
                    {/* War Video */}
                    {!skipAnimation && videoStarted && (
                        <div className={`war-video-container`}>
                            <video
                                autoPlay
                                playsInline
                                onTimeUpdate={handleTimeUpdate}
                                onEnded={handleVideoEnded}
                                onError={handleVideoError}
                                className={`war-video ${isVideoEnded ? 'war-video-fade-out' : ''}`}
                            >
                                <source src={`${videoSource}.webm`} type="video/webm" />
                                <source src={`${videoSource}.mp4`} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>


                        </div>
                    )}


                    {isResultShown && (
                        <div className="result-modal">

                            <div className="result-overlay visible">
                                <div className="result-header">
                                    {warResult === "win" ? "🎉 Victory!" : "💀 Defeat"}
                                </div>
                                <div className="result-details">
                                    <p>{warStory}</p> {/* Display unique story */}
                                    {warResult === "win" && (
                                        <>
                                            <p className="reward-info">You plundered {formatBalance(reward)} $SITY in this battle!</p>
                                            <button
                                                className="twitter-share-button"
                                                onClick={() => {
                                                    const tweetText = `I plundered ${formatBalance(reward)} $SITY in battle! Try the new battle feature of @SuiCityP2E and test your might! 🚀🔥`;
                                                    const quotedTweetUrl = "https://x.com/SuiCityP2E/status/1852283532787294235"; // Replace this with the specific tweet URL you want to quote
                                                    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(quotedTweetUrl)}`;
                                                    window.open(twitterUrl, '_blank');
                                                }}

                                            >
                                                Share on Twitter
                                            </button>

                                        </>
                                    )}
                                </div>
                                {transactionDigest && (
                                    <p className="transaction-link">
                                        Transaction:{" "}
                                        <a
                                            href={`https://suiscan.xyz/mainnet/tx/${transactionDigest}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {transactionDigest}
                                        </a>
                                    </p>
                                )}
                                <button className="close-button" onClick={closeWarVideo}>Close</button>
                            </div>
                        </div>

                    )}



                </div>
            )}

        </>
    );
};

export default SingleplayerWar;
