// Import required packages
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

// Initialize the Express app
const app = express();
const port = 3000;

// --- ⚙️ CONFIGURATION ---
const mongoUri = "mongodb+srv://rithesh:1234@cluster0.gzip7uc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "form-submissions";
const collectionName = "logs";
// -------------------------

// Create a new MongoDB client
const client = new MongoClient(mongoUri);

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Database Connection ---
// This function will connect to the database and start the server
async function startServer() {
  try {
    // Connect the client to the server
    await client.connect();
    console.log("🚀 Successfully connected to MongoDB Atlas!");

    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    // --- API Routes ---
    // We define the routes AFTER we have a stable database connection
    
    // POST route to submit a new log
    app.post('/submit', async (req, res) => {
      try {
        const { gmail, title, timestamp } = req.body;

        if (!gmail || !title || !timestamp) {
          return res.status(400).send({ message: 'Missing required fields.' });
        }

        const submissionDocument = {
          gmail,
          title,
          timestamp: new Date(timestamp),
        };

        const result = await collection.insertOne(submissionDocument);
        console.log(`✅ A document was inserted with the _id: ${result.insertedId}`);
        res.status(201).send({ message: 'Data saved successfully!', documentId: result.insertedId });

      } catch (err) {
        console.error("❌ An error occurred while saving to the database:", err);
        res.status(500).send({ message: 'Failed to save data.' });
      }
    });

    // --- ✨ NEW GET ROUTE STARTS HERE ✨ ---
    // GET route to retrieve all logs
    app.get('/logs', async (req, res) => {
        try {
            // Find all documents in the collection and convert them to an array
            const logs = await collection.find({}).toArray();
            console.log(`📡 Found ${logs.length} documents.`);
            res.status(200).send(logs);

        } catch (err) {
            console.error("❌ An error occurred while fetching logs:", err);
            res.status(500).send({ message: 'Failed to fetch data.' });
        }
    });
    // --- ✨ NEW GET ROUTE ENDS HERE ✨ ---


    // --- Start Server ---
    app.listen(port, () => {
      console.log(`📡 Server is running and listening on http://localhost:${port}`);
    });

  } catch (err) {
    console.error("❌ Failed to connect to the database.", err);
    process.exit(1); // Exit the process if we can't connect to the DB
  }
}

// Run the function to start everything
startServer();