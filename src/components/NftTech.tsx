import React from "react";

interface NftSpecsProps {
  nft: any;
  officeLevel: number;
  factoryLevel: number;
  houseLevel: number;
  enterLevel: number;
  castleLevel: number;
  onShowChangeName: () => void; // Add a callback to show the Change Name section
}

const NftSpecs: React.FC<NftSpecsProps> = ({
  nft,
  officeLevel,
  factoryLevel,
  houseLevel,
  enterLevel,
  castleLevel,
  onShowChangeName, // Add the callback here
}) => {

  return (
    <>
      <div className="nft-info">
        {nft ? (
          <div style={{ display: "flex", alignItems: "center" }}>
            <a
              href={`https://suiscan.xyz/mainnet/object/${nft.objectId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <h2>{nft.content.fields.name}</h2>
            </a>
            <span onClick={onShowChangeName} className="rainbow-glow">
              ✍️
            </span>
          </div>
        ) : null}

        <p>
          🏢 Office Level: <strong>{officeLevel}</strong>
        </p>
        <p>
          🏭 Factory Level: <strong>{factoryLevel}</strong>
        </p>
        <p>
          🏡 House Level: <strong>{houseLevel}</strong>
        </p>
        <p>
          🎡 E. Complex Level: <strong>{enterLevel}</strong>
        </p>
        <p>
          🏰 Castle Level: <strong>{castleLevel}</strong>
        </p>
      </div>
    </>
  );
};

export default NftSpecs;
