const mongoose = require("mongoose");

const uri = process.env.DB;

if (!uri) {
    console.error("MongoDB URI is not defined in the environment variables.");
    process.exit(1);
  }

  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });

module.exports = mongoose;
