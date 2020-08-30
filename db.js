const mongoose = require("mongoose");

const coonectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    console.log("connected to db");
  } catch (err) {
    console.log(err);
  }
};

module.exports = coonectDB;
