import "../assets/styles/Section.css";

const Section: React.FC = () => {
  return (
    <div className="sec-container">
      <picture>
        <source srcSet="/cloud.webp" type="image/webp" />
        <img src="/cloud.png" alt="cloud" id="cloud" />
      </picture>

      {/* First Block: Text on the left, Image on the right */}
      <div className="text-image-block">
        <div className="text-left">
          <h2>
            Freemint your SuiCity NFT
            <br />
            and start earning $SITY🪙
          </h2>
          <p>
            Start the game with four key structures— the Office, Factory, House,
            and Entertainment Complex— as part of your SuiCity NFT, and take
            full advantage of dynamic NFT (dNFT) technology. Each building plays
            a unique role in shaping your city's growth and strategy, and as you
            progress, these structures will evolve both in appearance and
            functionality. With dNFT technology, every upgrade will be reflected
            in real-time, enhancing not only your city’s aesthetics but also its
            performance and value within the game.
          </p>
        </div>
        <div className="image-right">
          <picture>
            {/* WebP version for modern browsers */}
            <source srcSet="/city.webp" type="image/webp" />
            <img src="/city.png" alt="City Image" />
          </picture>
        </div>
      </div>
      {/* Second Block: Text on the right, Image on the left */}
      <div className="text-image-block">
        <div className="image-left">
          <picture>
            {/* WebP version for modern browsers */}
            <source srcSet="/build2.webp" type="image/webp" />
            <img src="/build2.png" alt="Construction Image" />
          </picture>
        </div>
        <div className="text-right">
          <h2>
            Upgrade Buildings on your NFT <br className="specBr" /> & Increase
            $SITY Revenue Potential📶
          </h2>
          <p>
            Maximize your city's productivity and significantly boost your $SITY
            earnings by strategically upgrading key structures. Every upgrade
            enhances your city's overall capabilities, unlocking new features
            and efficiencies that allow you to generate more passive income and
            accelerate your growth within SuiCityP2E.The path to success in
            SuiCityP2E lies in optimizing your city’s infrastructure and taking
            full advantage of every opportunity to enhance your earnings and
            growth potential.
          </p>
        </div>
      </div>

      <div className="text-image-block">
        <div className="text-left">
          <h2>
            Join Forces and Thrive:
            <br /> Build with the SuiCity Community💡
          </h2>
          <p>
            SuiCityP2E isn’t just a game—it’s a community-driven project where
            your voice matters. By joining, you become part of a vibrant network
            of players who collaborate, share strategies, and contribute to the
            game’s ongoing development. Whether through feedback, participation
            in events, or working together to unlock new milestones, the
            community plays a key role in shaping the future of SuiCity. Every
            decision you make doesn’t just impact your city but also the entire
            SuiCity universe. Together, we build, grow, and succeed!
          </p>
        </div>
        <div className="image-right">
          <picture>
            {/* WebP version for modern browsers */}
            <source srcSet="/comm.webp" type="image/webp" />
            <img src="/comm.png" alt="Community Image" />
          </picture>
        </div>
      </div>

      <div>
        <a href="https://docs.suicityp2e.com" target="_blank">
          read more on docs
        </a>
      </div>
    </div>
  );
};

export default Section;
