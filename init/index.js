// index.js
if(process.env.NODE_ENV != 'production'){
  require('dotenv').config()
}

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderLust";

const MONGO_ATLAS_URL = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("Connected to the database successfully.");
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });

async function main() {
  try {
    await mongoose.connect(MONGO_ATLAS_URL);
    console.log("Connected to MongoDB.");
    await initDB();
  } catch (error) {
    console.error("Error in main:", error);
    throw error; // Rethrow the error to be caught by the calling code
  }
}

async function initDB() {
  try {
    await Listing.deleteMany({});
    await Review.deleteMany({});
    initData.data = initData.data.map(item => ({ ...item, owner: "66079d0b2a5c4a4be16970b3" }));
    await Listing.insertMany(initData.data);
    console.log("Data was initialized.");
  } catch (error) {
    console.error("Error initializing data:", error);
    throw error; // Rethrow the error to be caught by the calling code
  }
}
