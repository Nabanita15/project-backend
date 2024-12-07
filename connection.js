const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = async () => {
  try {
    await mongoose
      .connect(
        `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASSWORD}@mernproject.a3jtb.mongodb.net/project?retryWrites=true&w=majority&appName=mernProject`
      )
      .then((res) => console.log("MongoDb is connected"))
      .catch((err) => console.log("mongoDb is not connected", err));
  } catch (error) {
    console.log("mongo db is not connected", error);
  }
};

module.exports = connectDB;
