import React from "react";
import "../assets/styles/Footer.css";

const Footer: React.FC = () => {

  return (
    <footer className="footer" id="footer">

      <div>
        <ul className="footer-links">
          <li>
            <a
              href="https://twitter.com/suicityp2e"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter Link for SuiCityP2E"
            >
              Twitter
            </a>
          </li>
          <li>
            <a
              href="https://discord.com/invite/Aeth26cr25"
              target="_blank"
              aria-label="Discord Link for SuiCityP2E"
            >
              Discord
            </a>
          </li>
          <li>
            <a href="mailto:suicity.p2e@gmail.com" aria-label="Mail SuiCityP2E">
              Mail
            </a>
          </li>
          <li>
            <a
              href="https://zealy.io/cw/suicityp2e/questboard"
              target="_blank"
              aria-label="Zealy Link for SuiCityP2E"
            >
              Zealy
            </a>
          </li>
          <li>
            <a
              href="https://linktr.ee/suicityp2e"
              target="_blank"
              aria-label="Linktree Link for SuiCityP2E"
            >
              Linktree
            </a>
          </li>
        </ul>
      </div>

      <div>
        <p className="footer-reserved"> Crafted with ❤️ by <a href="https://x.com/1nternSITY" target="_blank">zeedC</a></p>
      </div>
      <div></div>
    </footer>
  );
};

export default Footer;
