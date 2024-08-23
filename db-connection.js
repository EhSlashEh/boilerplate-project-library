const mongoose = require("mongoose");

const uri = process.env.DB;

mongoose.connect(uri)
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });

module.exports = mongoose;
