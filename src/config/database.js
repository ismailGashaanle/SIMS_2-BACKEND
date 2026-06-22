

// const express = require("express")

// const mongoose = require("mongoose");
//   require("dotenv").config();

// const connectDB = async()=>{
//     await mongoose.connect(process.env.DATABASE_URL);
// }


// module.exports =connectDB
require('dotenv').config();

const express = require("express");

const mongoose = require('mongoose')
 const connectDB = async () => {
  try {
    console.log("Connecting to DB...");
    console.log(process.env.DATABASE_URL);
   
    
await mongoose.connect(process.env.DATABASE_URL, {
  serverSelectionTimeoutMS: 20000,
  family: 4
});




    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error(error.message);
    process.exit(1); // stop app if DB fails
  }
};

module.exports =connectDB



// const mongoose = require("mongoose");

// const express = require('express')
//  require("dotenv").config();



// const connectDB = async()=>{
//     await mongoose.connect(process.env.DATABASE_URL)
// }


// module.exports=connectDB;