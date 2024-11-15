import React, { useEffect, useState } from "react";
import "../assets/styles/Modal.css"; // Import the CSS file for the modal

interface ModalProps {
  show: boolean;
  message: string;
  onClose: () => void;
  bgColor: 0 | 1 | 2; // Accept a new prop to control background color
}

const Modal: React.FC<ModalProps> = ({ show, message, onClose, bgColor }) => {
  const [isVisible, setIsVisible] = useState(show); // Track visibility
  const [isFadingIn, setIsFadingIn] = useState(false); // Track fading state

  useEffect(() => {
    if (show) {
      setIsFadingIn(true); // Set to fading in
      setIsVisible(true); // Show modal
    } else {
      // Delay hiding to allow fade-out animation to complete
      setIsFadingIn(false);
      setTimeout(() => {
        setIsVisible(false); // Hide after animation completes
      }, 1000); // Match the duration of the fade-out animation
    }
  }, [show]);

  if (!isVisible && !show) return null; // Hide modal only after fade-out

  // Function to determine the background class based on bgColor prop
  const getBackgroundClass = () => {
    if (bgColor === 0) return "bg-red";
    if (bgColor === 1) return "bg-green";
    return "bg-black";
  };

  return (
    <div
      className={`modal-backdrop ${getBackgroundClass()} ${isFadingIn ? "fade-in" : "fade-out"
        }`}
    >
      <div className={`modal-content ${isFadingIn ? "fade-in" : "fade-out"}`}>
        <h3>{message}</h3>
        <button className="modal-close-btn" onClick={onClose}>
          &times; {/* The 'X' button */}
        </button>
      </div>
    </div>
  );
};

export default Modal;
