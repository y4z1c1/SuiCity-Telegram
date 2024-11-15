import React, { useEffect, useState } from "react";
import "../assets/styles/Header.css";
import { Link, useLocation } from "react-router-dom";

const Header: React.FC = () => {
  const [isSafari, setIsSafari] = useState(false);
  const [, setScrollPosition] = useState(0);
  const [navBackColor, setNavBackColor] = useState("rgba(0, 0, 0, 0.4)");

  const location = useLocation();

  // Check if the current path is '/faq' to hide the logo
  // const isFaqPage = location.pathname === "/faq";

  // Function to scroll to the footer
  const scrollToFooter = () => {
    const footerElement = document.getElementById("footer");
    if (footerElement) {
      footerElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Function to scroll to the top of the page
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    // Detect if the browser is Safari
    const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(
      navigator.userAgent
    );
    setIsSafari(isSafariBrowser);

    // Function to handle scroll
    const handleScroll = () => {
      const position = window.scrollY;
      setScrollPosition(position);

      // Change navbar text color based on scroll position
      if (position > 500) {
        // You can adjust this threshold
        setNavBackColor("rgba(0, 0, 0, 0.6)"); // Darker color for better contrast
      } else {
        setNavBackColor("rgba(0, 0, 0, 0.4)"); // Lighter color on top of the page
      }
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className="header">
      <div className="navbar" style={{ backgroundColor: navBackColor }}>
        <div className="logo-title-container">
          {/* Conditionally render the logo only if it's not the FAQ page */}
          {isSafari ? (
            <img src="/title.png" alt="SuiCity Logo" className="title" />
          ) : (
            <h1 className="suicity-title">SuiCity</h1>
          )}
        </div>

        <ul className="nav-links">
          <li>
            {/* If already on the main page, scroll up, else use Link */}
            {location.pathname === "/" ? (
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToTop();
                }}
              >
                Home
              </a>
            ) : (
              <Link to="/">Home</Link>
            )}
          </li>

          <li>
            <a href="https://suicityp2e.com/contentcreators" target="_blank">
              {" "}
              Content Creators
            </a>
          </li>
          <li>
            <a href="https://docs.suicityp2e.com" target="_blank">
              {" "}
              Guide
            </a>
          </li>
          <li>
            <a href="https://suicityp2e.com/faq" target="_blank">
              {" "}
              FAQ
            </a>
          </li>
          <li>
            {/* Scroll to footer when Contact Us is clicked */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                scrollToFooter();
              }}
            >
              Contact
            </a>
          </li>


        </ul>


      </div>
    </header>
  );
};

export default Header;
