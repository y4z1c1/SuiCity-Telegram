import React, { useState } from "react";
import * as HoverCard from "@radix-ui/react-hover-card";

interface NftSpecsProps {
  officeLevel: number;
  factoryLevel: number;
  houseLevel: number;
  enterLevel: number;
  castleLevel: number;
  gameData: any;
}

const NftSpecs: React.FC<NftSpecsProps> = ({
  officeLevel,
  factoryLevel,
  houseLevel,
  enterLevel,
  castleLevel,
  gameData,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const accumulationSpeed = Number(gameData.accumulation_speeds[officeLevel]) / 1000;
  const factoryBonus = gameData.factory_bonuses[factoryLevel];
  const amenityPoints = Number(houseLevel) + Number(enterLevel);
  const castlePowers = gameData.castle_powers[castleLevel];

  const intervals = [3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24];
  return (
    <div className="nft-specs" id="specs">
      <div className={`content ${isOpen ? "open" : "closed"}`}>

        {/* Accumulation Speed Section */}
        <HoverCard.Root>
          <p>Accumulation Speed: </p>
          <h2>
            <HoverCard.Trigger asChild>
              <img
                src="https://bafybeiahevtcpw4pxgklnglmoayfoer3asgha6ajk3pxbu35g4npwb54ey.ipfs.w3s.link/acc1.webp"
                alt="acc-icon"
                className="acc-icon"
                style={{
                  width: "30px",
                  height: "30px",
                  marginRight: "3px",
                  cursor: "help",
                }}
              />
            </HoverCard.Trigger>
            {`${accumulationSpeed} $SITY/h`}
          </h2>
          <HoverCard.Portal container={document.getElementById("game-container-wrapper")}>
            <HoverCard.Content className="HoverCardContent" align="start" sideOffset={15} side="left">

              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <div className="Text bold">Accumulation Speed</div>
                <div className="Text faded">Indicates how many $SITY tokens your office produces per hour.</div>
                <div className="Text faded">You are currently accumulating <strong>{`${accumulationSpeed} $SITY`}</strong> per hour.</div>
                <a href="https://docs.suicityp2e.com/buildings/office" target="blank"> read more</a>

              </div>
              <HoverCard.Arrow className="HoverCardArrow" width={20} height={10} />
            </HoverCard.Content>
          </HoverCard.Portal>
        </HoverCard.Root>

        {/* Factory Bonus Section */}
        <HoverCard.Root>
          <p>Factory Bonus:</p>
          <h2>
            <HoverCard.Trigger asChild>
              <img
                src="https://bafybeiahevtcpw4pxgklnglmoayfoer3asgha6ajk3pxbu35g4npwb54ey.ipfs.w3s.link/gear1.webp"
                alt="gear-icon"
                className="gear-icon"
                style={{
                  width: "30px",
                  height: "30px",
                  marginRight: "5px",
                  cursor: "help",
                }}
              />
            </HoverCard.Trigger>
            {`${factoryBonus}%`}
          </h2>
          <HoverCard.Portal container={document.getElementById("game-container-wrapper")}>
            <HoverCard.Content className="HoverCardContent" align="start" sideOffset={15} side="left">

              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <div className="Text bold">Factory Bonus</div>
                <div className="Text faded">The percentage that factory building allow you to claim as bonus.</div>
                <div className="Text faded">Your factory currently provides <strong>{`${factoryBonus}%`}</strong> bonus.</div>
                <a href="https://docs.suicityp2e.com/buildings/factory" target="blank"> read more</a>

              </div>
              <HoverCard.Arrow className="HoverCardArrow" width={20} height={10} />
            </HoverCard.Content>
          </HoverCard.Portal>
        </HoverCard.Root>

        {/* Amenity Points Section */}
        <HoverCard.Root>
          <p>Amenity Points:</p>
          <h2>
            <HoverCard.Trigger asChild>
              <img
                src="https://bafybeiahevtcpw4pxgklnglmoayfoer3asgha6ajk3pxbu35g4npwb54ey.ipfs.w3s.link/star1.webp"
                alt="star-icon"
                className="star-icon"
                style={{
                  width: "30px",
                  height: "30px",
                  marginRight: "5px",
                  cursor: "help",
                }}
              />
            </HoverCard.Trigger>
            {`${amenityPoints}`}
          </h2>
          <HoverCard.Portal container={document.getElementById("game-container-wrapper")}>
            <HoverCard.Content className="HoverCardContent" align="start" sideOffset={15} side="left">
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <div className="Text bold">Amenity Points</div>
                <div className="Text faded">Amenity points increase the time your office is able to accumulate.</div>
                <div className="Text faded">You have <strong>{`${amenityPoints}`}</strong> amenity points which is <strong>{`${intervals[amenityPoints]} hours`}</strong>.</div>
                <a href="https://docs.suicityp2e.com/buildings/entertainment-complex" target="blank"> read more</a>

              </div>
              <HoverCard.Arrow className="HoverCardArrow" width={20} height={10} />
            </HoverCard.Content>
          </HoverCard.Portal>
        </HoverCard.Root>

        {/* War Power Section */}
        <HoverCard.Root>
          <p>War Power:</p>
          <h2>
            <HoverCard.Trigger asChild>
              <img
                src="https://bafkreiflzltftnwnnetui2mmmj74vo4cuqwk3ryqi36sgrp3xhxhbx6v3u.ipfs.w3s.link/"
                alt="sword-icon"
                className="sword-icon"
                style={{
                  width: "30px",
                  height: "30px",
                  marginRight: "5px",
                  cursor: "help",
                }}
              />
            </HoverCard.Trigger>
            {`${castlePowers}`}
          </h2>
          <HoverCard.Portal container={document.getElementById("game-container-wrapper")}>
            <HoverCard.Content className="HoverCardContent" align="start" sideOffset={15} side="left">
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <div className="Text bold">War Power</div>
                <div className="Text faded">The power of your army. It can be boosted using shield in wars.</div>
                <div className="Text faded">You currently have <strong>{`${castlePowers}`}</strong> war power.</div>
                <a href="https://docs.suicityp2e.com/buildings/castle" target="blank"> read more</a>

              </div>
              <HoverCard.Arrow className="HoverCardArrow" width={20} height={10} />
            </HoverCard.Content>
          </HoverCard.Portal>
        </HoverCard.Root>

      </div>
      <div className="toggle-header" onClick={() => setIsOpen(!isOpen)}>
        <span>{isOpen ? "▲" : "▼"}</span>
      </div>
    </div>
  );
};

export default NftSpecs;
