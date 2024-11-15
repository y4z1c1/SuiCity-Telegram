import React, { useCallback, useEffect, useState } from "react";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { MIST_PER_SUI } from "@mysten/sui/utils";
import * as HoverCard from "@radix-ui/react-hover-card";
import useWallet from "../hooks/useWallet"; // Ensure correct path to your hook

interface BalancesProps {
  sityBalance: number; // The current SITY balance
  onBalancesUpdate: (suiBalance: number) => void; // Callback to pass balances back to Game
  refreshTrigger: boolean; // Use this prop to trigger refresh
}

const Balances: React.FC<BalancesProps> = ({
  sityBalance,
  onBalancesUpdate,
  refreshTrigger,
}) => {
  const { wallet } = useWallet();
  const [suiBalance, setSuiBalance] = useState<number>(0);

  const provider = new SuiClient({
    url: getFullnodeUrl("mainnet"),
  });

  const fetchBalances = useCallback(async () => {
    if (!wallet.address) return;

    try {
      const [suiResponse] = await Promise.all([

        provider.getBalance({ owner: String(wallet.address) }),
      ]);

      console.log("suiResponse", suiResponse);

      const fetchedSuiBalance =
        parseInt(suiResponse.totalBalance) / Number(MIST_PER_SUI);

      // Update state
      setSuiBalance(fetchedSuiBalance);

      // Pass the balances back to Game.tsx
      onBalancesUpdate(fetchedSuiBalance);
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  }, [wallet.address, onBalancesUpdate]);

  useEffect(() => {
    fetchBalances();
  }, [wallet.address, fetchBalances, refreshTrigger]);


  // Function to format the balance for readability
  const formatBalance = (balance: number) => {
    if (balance >= 1000000) {
      return (balance / 1000000).toFixed(2) + "M";
    } else if (balance >= 1000) {
      return (balance / 1000).toFixed(2) + "k";
    }
    return balance.toFixed(2);
  };

  return (
    <div className="balance-columns">
      <div className="balance-bar">
        <img
          src="https://assets.staticimg.com/cms/media/8uGGQmvkfODw7cnx3GuekBb404A2bTYUcTjBklHja.png"
          alt="SUI logo"
          className="balance-bar-icon"
        />
        <div className="balance-bar-track">
          <div
            className="balance-bar-fill balance-bar-fill-sui"
            style={{ width: `${suiBalance}%` }}
          ></div>
          <div
            className="balance-amount"
            style={{
              color: suiBalance < 0.01 ? "red" : "inherit", // Text will turn red if balance is below 0.005
            }}
          >{`${formatBalance(suiBalance)}  $SUI`}</div>
        </div>
      </div>



      <HoverCard.Root>

        <div className="balance-bar">
          <HoverCard.Trigger asChild>
            <img
              src="https://bafybeig4236djyafwvxzkb3km7o3xa25lsfg55bxvyrwbxyemlzjnjjpsi.ipfs.w3s.link/sity%20logo.png"
              alt="SITY logo"
              className="balance-bar-icon"
              style={{ cursor: "help" }}
            />
          </HoverCard.Trigger>

          <div className="balance-bar-track">
            <div
              className="balance-bar-fill balance-bar-fill-sity"
              style={{ width: `${sityBalance / 100000}%` }}
            ></div>
            <div className="balance-amount">{`${formatBalance(
              sityBalance
            )}  $SITY`}</div>
          </div>
        </div>

        <HoverCard.Portal container={document.getElementById("game-container-wrapper")}>
          <HoverCard.Content className="HoverCardContent" align="start" sideOffset={20} arrowPadding={10}>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                <div>
                  <div className="Text bold">$SITY Token</div>
                  <div className="Text faded">$SITY is the native token of the SuiCityP2E ecosystem.</div>
                  <a href="https://suiscan.xyz/mainnet/coin/0x5b9b4cd82aee3d5a942eebe9c2da38f411d82bfdfea1204f2486e45b5868b44f::sity::SITY/txs" target="_blank">contract address</a>
                </div>


              </div>
            </div>

            <HoverCard.Arrow className="HoverCardArrow" />
          </HoverCard.Content>
        </HoverCard.Portal>

      </HoverCard.Root>
    </div >
  );
};

export default Balances;
