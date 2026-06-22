const mongoose = require("mongoose");

const applicationSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  fullName: {
    type: String,
    required: [true, "please fill firstName"],
    trim: true,
    lowercase: true
  },
  ApplicationType: {
    type: String,
    enum: ["tourist_visa", "business_visa", "student_visa", "work_permit", "residence_permit"],
    required: true,
    trim: true,
    lowercase: true,
  },
  status: {
    type: String,
    enum: ["pending", "verified", "cancel", "rejected"],
    default: "pending"
  },
  email: {
    type: String,
    required: [true, "please fill email"],
    trim: true,
    lowercase: true,
    unique: true,
  },
  approvalLetter: {
    type: String
  },
  phone: {
    type: String,
    required: [true, "please fill phone number"],
    unique: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  nationality: {
    type: String,
    required: [true, "please fill your nationality"],
    trim: true
  },
  passportNumber: {
    type: String,
    uppercase: true,
    required: [true, "please fill your passport Number"],
    unique: true,
  },
  passportDateIssue: {
    type: Date,
    required: [true, "please fill your issue data of your passport"],
    trim: true,
  },
  passportExpireDate: {
    type: Date,
    required: [true, "please fill expire data of your passport"],
    trim: true
  },
  purposeOfTravel: {
    type: String,
    required: [true, "please tell the purpose of your travel?"],
    trim: true,
    lowercase: true
  },
  intendedDepartureDate: {
    type: Date,
    required: true
  },
  addressInDestination: {
    type: String,
    required: [true, "please tell address in your destination?"],
    lowercase: true,
    trim: true
  }
}, { timestamps: true }); // Added timestamps

applicationSchema.virtual("documents", {
  ref: "Document",
  localField: "_id",
  foreignField: "ApplicationId"
});

applicationSchema.set("toObject", { virtuals: true });
applicationSchema.set("toJSON", { virtuals: true });

const ApplicationModel = mongoose.model("ApplicationUser", applicationSchema);
module.exports = ApplicationModel; // Fixed: removed "and"