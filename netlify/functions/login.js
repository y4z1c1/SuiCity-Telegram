import crypto from "crypto";

// Helper function to generate code_verifier and code_challenge
function generateCodeVerifier() {
  const codeVerifier = crypto.randomBytes(32).toString("hex");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, ""); // Twitter expects base64url encoding without padding
  return { codeVerifier, codeChallenge };
}

export const handler = async function (event, context) {
  const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID;
  const REDIRECT_URI = process.env.REDIRECT_URI;

  // Generate code_verifier and code_challenge
  const { codeVerifier, codeChallenge } = generateCodeVerifier();

  // Set cookie with code_verifier (secure and HttpOnly)
  const cookie = `code_verifier=${codeVerifier}; Path=/; HttpOnly; Secure; SameSite=Lax`;

  // Include users.read, like.read, and other necessary scopes
  const twitterAuthURL = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${TWITTER_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=tweet.read%20users.read%20follows.write%20like.read%20offline.access&state=state&code_challenge=${codeChallenge}&code_challenge_method=S256`;

  return {
    statusCode: 302,
    headers: {
      Location: twitterAuthURL,
      "Set-Cookie": cookie, // Store code_verifier in a cookie
    },
    body: "",
  };
};
