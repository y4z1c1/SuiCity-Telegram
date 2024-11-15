import React from "react";
import "../assets/styles/SuccessPage.css"; // Optional styling

const SuccessPage: React.FC = () => {
  return (
    <div className="success-container">
      <h1>Thank You!</h1>
      <p>Your feedback has been submitted successfully.</p>
      <p>
        We appreciate your input and will consider it in our development
        process.
      </p>
      <a href="/" className="back-home">
        Back to Home
      </a>
    </div>
  );
};

export default SuccessPage;
