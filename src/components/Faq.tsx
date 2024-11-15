// Faq.tsx
import "../assets/styles/Faq.css"; // Make sure you link the correct stylesheet

const Faq: React.FC = () => {
  return (
    <div className="faq-container">
      <section className="faq-section">
        <h2 style={{ marginTop: "0", textAlign: "left" }}>FAQ</h2>

        <div className="faq-item">
          <h2>How do I start playing SuiCityP2E? </h2>
          <p>
            To start playing SuiCityP2E, you first need to freemint your SuiCity
            NFT. This NFT represents your city and includes four buildings:
            Entertainment Complex, Factory, House, and Office. All buildings
            start at level 0. Once you have minted your NFT, you can begin
            upgrading your buildings using. Upgrades will improve various
            aspects of your city, including increasing your passive income and
            enhancing the visual appearance and rarity of your CityNFT.
          </p>
        </div>

        <div className="faq-item">
          <h2>What is $SITY and how can I earn it?</h2>
          <p>
            $SITY is the native token of SuiCityP2E and is fully
            community-owned. It can be earned through various in-game
            activities, such as collecting daily factory revenue and earning
            passive income based on the level of your Office. Players can also
            earn $SITY through social media and Zealy tasks, art, and content
            creation events. Additionally, early community members, test
            players, and active Sui users may receive $SITY airdrops. The goal
            is to accumulate as much $SITY as possible before it gets listed.
          </p>
        </div>

        <div className="faq-item">
          <h2>How does the Play2Airdrop model work?</h2>
          <p>
            The Play2Airdrop model in SuiCityP2E allows players to earn $SITY
            tokens by participating in the game. As players engage with the
            game, upgrade their buildings, and complete various in-game tasks,
            they earn $SITY tokens, which can later be used for further upgrades
            or exchanged once the token is listed on exchanges. The model
            rewards active participation, encouraging players to contribute to
            the game's ecosystem.
          </p>
        </div>

        <div className="faq-item">
          <h2>How can I upgrade my buildings?</h2>
          <p>
            Buildings in SuiCityP2E can be upgraded using $SITY or $SUI tokens.
            Each building—Office, Factory, House, and Entertainment
            Complex—affects different aspects of the game. Upgrading these
            buildings enhances their functionality, such as increasing passive
            income, extending claim intervals, or boosting daily production
            revenue. Additionally, upgrades also improve the visual appearance,
            metadata, and rarity of your CityNFT, thanks to the use of dynamic
            NFTs.
          </p>
        </div>

        <div className="faq-item">
          <h2>What happens if I miss a claim for my passive income?</h2>
          <p>
            If you miss a claim for your passive income in SuiCityP2E, your
            accumulated $SITY tokens will continue to be stored, but you won't
            generate any new passive income until you make your next claim. To
            maximize your earnings, it's essential to log in at the specified
            intervals to collect your passive income and keep your city's
            productivity high.
          </p>
        </div>

        <div className="faq-item">
          <h2>How does the referral system work?</h2>
          <p>
            SuiCityP2E's referral system allows players to earn additional $SITY
            tokens by inviting friends to join the game. For every friend a
            player invites using their unique referral link, they will earn 750
            $SITY tokens. However, if players are found to be abusing the
            referral system (e.g., creating fake accounts), their accounts will
            be flagged as sybil accounts, and appropriate actions will be taken.
          </p>
        </div>

        <div className="faq-item">
          <h2>What is the Marketplace, and what can I do there?</h2>
          <p>
            The Marketplace in SuiCityP2E will be launched before the $SITY
            token is listed, with the goal of increasing $SITY's utility and
            reducing its supply. In the Marketplace, players can exchange $SITY
            tokens for limited stock NFTs from various Sui collections, $SUI,
            meme tokens, and even physical rewards like merchandise in the
            future. A ticket system will also be introduced, allowing players to
            participate in raffles for various rewards and interact with
            different projects.
          </p>
        </div>

        <div className="faq-item">
          <h2>Are there any risks or scams to be aware of?</h2>
          <p>
            Since $SITY is not currently listed on any DEX or CEX, players
            should be cautious of scams and fake tokens. Only trust official
            sources and avoid interacting with suspicious accounts or websites.
          </p>
        </div>

        <div className="faq-item">
          <h2>
            What are dynamic NFTs (dNFTs), and how do they affect my gameplay?
          </h2>
          <p>
            Dynamic NFTs (dNFTs) in SuiCityP2E are NFTs that evolve based on
            in-game actions, such as upgrading buildings. As players upgrade
            their city’s buildings, the metadata, visual appearance, and rarity
            of their CityNFT will change. This adds a layer of depth and
            personalization to the game, making each player’s city unique.
          </p>
        </div>

        <div className="faq-item">
          <h2>When will $SITY be listed on exchanges?</h2>
          <p>
            SuiCityP2E is a Play2Airdrop game, which means $SITY will be listed
            on exchanges once the game reaches a certain stage in its
            development. Like other Play2Airdrop games, this process depends on
            the progress of the game and the growth of the community. Until
            then, players are encouraged to accumulate as much $SITY as possible
            through in-game activities, ensuring they are well-prepared for when
            $SITY becomes tradable.
          </p>
        </div>

        <div className="faq-item">
          <h2>Do I need to have a computer to play SuiCityP2E?</h2>
          <p>No! You can also play SuiCityP2E on mobile. Here's how:</p>

          <ul>
            <li>Download Sui Wallet Mobile or Ethos Wallet Mobile</li>
            <li>Import or Create a new wallet</li>
            <li>
              Log in to the SuiCity game link using the browser inside the
              wallet application
            </li>
            <li>
              Connect your wallet, and now you're ready to build your City!
            </li>
          </ul>
        </div>
        <div className="faq-item">
          <h2>Do I need to have $SUI in my wallet to play the game? </h2>
          <p>
            Since SuiCityP2E is an onchain game, various functions in the game
            (like upgrades, claims, etc.) require transactions. These
            transactions require gas fees, and considering the low gas fees on
            the Sui network, you will need to have a small amount of $SUI in
            your wallet. Additionally, some building upgrades may require $SUI.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Faq;
