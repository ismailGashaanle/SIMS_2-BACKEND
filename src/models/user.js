const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    maxLength: 40,
    minLength: 2,
    trim: true,
    required: [true, "please fill firstName"]
  },
  lastName: {
    type: String,
    maxLength: 40,
    minLength: 2,
    trim: true,
    required: [true, "please fill lastName"]
  },
  email: {
    type: String,
    maxLength: 50,
    minLength: 5,
    lowercase: true,
    unique: true,
    required: [true, "please fill email"],
    trim: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("invalid email");
      }
    }
  },
  password: {
    type: String,
    required: [true, "password is required"],
    trim: true,
    validate(value) {
      if (!validator.isStrongPassword(value)) {
        throw new Error("invalid password");
      }
    }
  },
  phone: {
    type: String,
    maxLength: 13,
    minLength: 9,
    validate(value) {
      if (!validator.isMobilePhone(value)) {
        throw new Error("invalid phone number");
      }
    }
  },
  dateOfBirth: {
    type: Date,
    required: false
  },
  gender: {
    type: String,
    enum: ["male", "female"]
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    required: [true, "please role?"],
    default: "user"
  },
  status: {
    type: String,
    enum: ["pending", "block", "active", "suspended"],
    default: "active"
  },
  photoImage: {
    type: String,
    trim: true,
    default: "https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png"
  }
}, { timestamps: true });

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, process.env.SIMS_Secret, { expiresIn: "1d" });
  return token;
};

userSchema.methods.ValidatePassword = async function (InputPassword) {
  const user = this;
  const HashPassword = user.password;
  const isValidPassword = await bcrypt.compare(InputPassword, HashPassword);
  return isValidPassword;
};
// In models/user.js - increase token expiry
userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign(
    { _id: user._id }, 
    process.env.SIMS_Secret, 
    { expiresIn: "7d" } // Increased to 7 days
  );
  return token;
};

const userModel = mongoose.model("User", userSchema);
module.exports = userModel;