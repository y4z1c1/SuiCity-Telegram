const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
let client = null;

if (!client) {
  client = new MongoClient(uri, {
    connectTimeoutMS: 30000, // Set the connection timeout to 30 seconds
    socketTimeoutMS: 30000, // Set the socket timeout to 30 seconds
  });
}

exports.handler = async (event, context) => {
  const walletAddress = event.queryStringParameters.walletAddress; // For GET requests

  if (!walletAddress) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing wallet address" }),
    };
  }

  try {
    await client.connect();
    const database = client.db("twitter_bindings");
    const bindingsCollection = database.collection("bindings");

    // Ensure an index on the 'population' field for efficient sorting
    await bindingsCollection.createIndex({ population: -1 });

    // Fetch top 50 users from the bindings collection sorted by population
    const topUsers = await bindingsCollection
      .find()
      .sort({ population: -1 })
      .limit(50)
      .toArray();

    // Find the current user by walletAddress
    const currentUser = await bindingsCollection.findOne({ walletAddress });

    if (!currentUser) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "User not found" }),
      };
    }

    // Find the rank of the current user if not in the top 50
    const rank = await bindingsCollection.countDocuments({
      population: { $gt: currentUser.population },
    });

    // Return the top 50 users along with the current user's rank (rank + 1 due to 0-indexing)
    return {
      statusCode: 200,
      body: JSON.stringify({
        topUsers,
        currentUser: { ...currentUser, rank: rank + 1 },
      }),
    };
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch leaderboard" }),
    };
  }
};
