const express = require("express");
const userDocumentRouter = express.Router();
const userAuth = require("../middlewares/Auth");
const Application = require("../models/CreateApplication");
const userDocumentModel = require("../models/UserDocument");
const upload = require("../middlewares/upload");
const path = require("path");

// ✅ POST /uploadDocument - Handle file upload
userDocumentRouter.post(
  "/uploadDocument",
  userAuth,
  upload.single("file"),
  async (req, res) => {
    try {
      const { DocumentType, fullName } = req.body;
      const logginUser = req.user;

      // ✅ Check if user has an application
      const application = await Application.findOne({
        userId: logginUser._id,
      });

      if (!application) {
        throw new Error("No application found. Please create an application first.");
      }

      if (!req.file) {
        throw new Error("File is required");
      }

      // ✅ Check for duplicate document
      const existing = await userDocumentModel.findOne({
        ApplicationId: application._id,
        DocumentType,
        userId: logginUser._id,
      });

      if (existing) {
        throw new Error("Document already uploaded");
      }

      // ✅ Save file path correctly (use forward slashes for URLs)
      const filePath = `/uploads/${req.file.filename}`;

      const newDocument = new userDocumentModel({
        userId: logginUser._id,
        ApplicationId: application._id,
        DocumentType,
        orginalName: req.file.originalname,
        fullName: fullName || logginUser.firstName + ' ' + logginUser.lastName,
        filePath: filePath,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        status: "pending"
      });

      await newDocument.save();

      res.json({
        message: "Document uploaded successfully",
        data: newDocument,
      });
    } catch (err) {
      console.error("Upload Error:", err);
      res.status(400).json({
        message: err.message,
      });
    }
  }
);

// ✅ GET /view/Document - View user documents
userDocumentRouter.get("/view/Document", userAuth, async (req, res) => {
  try {
    const logginUser = req.user;
    const ViewDocument = await userDocumentModel.find({ userId: logginUser._id });

    if (!ViewDocument || ViewDocument.length === 0) {
      return res.json({
        message: "No documents found",
        data: []
      });
    }

    res.json({
      message: "Documents retrieved successfully",
      data: ViewDocument
    });
  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
});

// ✅ GET /track/status - Track application status
userDocumentRouter.get("/track/status", userAuth, async (req, res) => {
  try {
    const logginUser = req.user;

    const application = await Application.findOne({
      userId: logginUser._id
    });

    if (!application) {
      return res.json({
        message: "No application found",
        status: "no_application",
        data: null
      });
    }

    res.json({
      message: "Application status retrieved",
      status: application.status || "pending",
      data: {
        status: application.status || "pending",
        applicationId: application._id,
        ApplicationType: application.ApplicationType,
        fullName: application.fullName
      }
    });
  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
});

// ✅ GET /fix-paths - Fix existing file paths (utility route)
userDocumentRouter.get("/fix-paths", async (req, res) => {
  try {
    const docs = await userDocumentModel.find();
    let fixedCount = 0;

    for (let doc of docs) {
      if (doc.filePath.includes("\\")) {
        const filename = doc.filePath.split("\\").pop();
        doc.filePath = `/uploads/${filename}`;
        await doc.save();
        fixedCount++;
      }
    }

    res.json({
      message: `✅ Fixed ${fixedCount} document paths`,
      fixedCount
    });
  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
});

module.exports = userDocumentRouter;