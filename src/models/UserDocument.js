const mongoose = require("mongoose");

const DocumentSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  ApplicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ApplicationUser",
    required: true,
    index: true,
  },
  DocumentType: {
    type: String,
    enum: [
      "passport",
      "profile_photo",
      "birth_certificate",
      "national_id",
      "employment_letter",
      "bank_statement",
      "educational_certificate",
      "police_clearance",
      "medical_report",
      "sponsorship_letter",
      "travel_itinerary",
      "other"
    ],
    lowercase: true,
    trim: true,
    required: true
  },
  orginalName: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  filePath: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    enum: ["image/jpeg", "image/png", "application/pdf"],
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending"
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  verifiedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    default: ""
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Fixed: Correct index creation
DocumentSchema.index({ ApplicationId: 1, DocumentType: 1 }, { unique: true });

const Document = mongoose.model("Document", DocumentSchema);
module.exports = Document;