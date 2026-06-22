const express = require("express");
const AdminApplicationRouter = express.Router();
const UserAuth = require("../middlewares/Auth");
const ApplicationModel = require("../models/CreateApplication");
const userDocumentModel = require("../models/UserDocument");
const User = require("../models/user");

// ==========================================
// 1. GET ALL APPLICATIONS (with pagination)
// ==========================================
AdminApplicationRouter.get("/All/Application", UserAuth, async (req, res) => {
  try {
    const logginUser = req.user;
    if (logginUser.role !== "admin") {
      throw new Error("Access denied: Admin only");
    }

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    if (limit > 50) limit = 10;

    const applications = await ApplicationModel.find({})
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // ✅ Newest first

    const total = await ApplicationModel.countDocuments();

    res.json({
      message: "All applications retrieved",
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: applications
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ==========================================
// 2. SEARCH BY PHONE
// ==========================================
AdminApplicationRouter.get("/search/application/phone/:phone", UserAuth, async (req, res) => {
  try {
    const logginUser = req.user;
    if (logginUser.role !== "admin") {
      throw new Error("Access denied: Admin only");
    }

    const { phone } = req.params;
    const searchResult = await ApplicationModel.findOne({ phone })
      .populate("userId", "firstName lastName email")
      .populate("documents");

    if (!searchResult) {
      return res.status(404).json({ message: "No application found with this phone number" });
    }

    res.json({
      message: "Application found",
      data: searchResult
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ==========================================
// 3. SEARCH BY EMAIL
// ==========================================
AdminApplicationRouter.get("/search/application/email/:email", UserAuth, async (req, res) => {
  try {
    const logginUser = req.user;
    if (logginUser.role !== "admin") {
      throw new Error("Access denied: Admin only");
    }

    const { email } = req.params;
    const searchResult = await ApplicationModel.findOne({ email })
      .populate("userId", "firstName lastName email")
      .populate("documents");

    if (!searchResult) {
      return res.status(404).json({ message: "No application found with this email" });
    }

    res.json({
      message: "Application found",
      data: searchResult
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ==========================================
// 4. SEARCH BY PASSPORT NUMBER
// ==========================================
AdminApplicationRouter.get("/search/application/passportNumber/:passportNumber", UserAuth, async (req, res) => {
  try {
    const logginUser = req.user;
    if (logginUser.role !== "admin") {
      throw new Error("Access denied: Admin only");
    }

    const { passportNumber } = req.params;
    const searchResult = await ApplicationModel.findOne({ passportNumber })
      .populate("userId", "firstName lastName email")
      .populate("documents");

    if (!searchResult) {
      return res.status(404).json({ message: "No application found with this passport number" });
    }

    res.json({
      message: "Application found",
      data: searchResult
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ==========================================
// 5. VERIFY DOCUMENT (Approve)
// ==========================================
// AdminApplicationRouter.patch("/Admin/verified/Document/id/:id", UserAuth, async (req, res) => {
//   try {
//     const logginUser = req.user;
//     if (logginUser.role !== "admin") {
//       throw new Error("Access denied: Admin only");
//     }

//     const { id } = req.params;
//     const documentToVerify = await userDocumentModel.findOne({ _id: id });

//     if (!documentToVerify) {
//       throw new Error("Document not found");
//     }

//     // ✅ Update document status to verified
//     const verifiedDocument = await userDocumentModel.updateMany(
//       { ApplicationId: documentToVerify.ApplicationId, status: "pending" },
//       {
//         $set: {
//           status: "verified",
//           verifiedBy: logginUser._id,
//           verifiedAt: new Date()
//         }
//       }
//     );

//     // ✅ Check if all documents are verified
//     const allDocuments = await userDocumentModel.find({
//       ApplicationId: documentToVerify.ApplicationId
//     });

//     const allVerified = allDocuments.every(doc => doc.status === "verified");

//     // ✅ If all verified, update application status and generate letter
//     if (allVerified) {
//       const application = await ApplicationModel.findById(documentToVerify.ApplicationId);

//       if (application) {
//         application.status = "verified";

//         // ✅ Generate approval letter
//         const letter = `
// REPUBLIC OF SOMALILAND
// MINISTRY OF INTERIOR
// DEPARTMENT OF IMMIGRATION

// VISA APPROVAL LETTER

// Name: ${application.fullName}
// Passport: ${application.passportNumber}
// Nationality: ${application.nationality}
// Visa Type: ${application.ApplicationType}

// Status: APPROVED ✅
// Valid: 90 Days from issue date

// This letter certifies that the above-named individual has been approved for entry into the Republic of Somaliland.

// Issued by: ${logginUser.firstName} ${logginUser.lastName}
// Date: ${new Date().toLocaleDateString()}

// --- OFFICIAL STAMP ---
// `;

//         application.approvalLetter = letter;
//         await application.save();
//       }
//     }

//     // ✅ Emit socket event for real-time updates
//     const io = req.app.get("io");
//     if (io) {
//       io.emit("document-verified", {
//         applicationId: documentToVerify.ApplicationId,
//         status: "verified"
//       });
//     }

//     res.json({
//       message: "Document verified successfully",
//       data: verifiedDocument,
//       allVerified: allVerified || false
//     });
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// ==========================================
// ✅ VERIFY DOCUMENT (CORRECT SPELLING)
// ==========================================
AdminApplicationRouter.patch("/Admin/verified/Document/id/:id", UserAuth, async (req, res) => {
  try {
    console.log("🔍 Verifying document (verified):", req.params.id);
    
    const logginUser = req.user;
    if (logginUser.role !== "admin") {
      throw new Error("Access denied: Admin only");
    }

    const { id } = req.params;
    
    // ✅ Find the document
    const documentToVerify = await userDocumentModel.findOne({ _id: id });

    if (!documentToVerify) {
      console.log("❌ Document not found:", id);
      return res.status(404).json({ message: "Document not found" });
    }

    console.log("✅ Document found:", documentToVerify._id);

    // ✅ Update document status to verified
    const verifiedDocument = await userDocumentModel.updateMany(
      { ApplicationId: documentToVerify.ApplicationId, status: "pending" },
      {
        $set: {
          status: "verified",
          verifiedBy: logginUser._id,
          verifiedAt: new Date()
        }
      }
    );

    console.log("📄 Updated documents:", verifiedDocument);

    // ✅ Check if all documents are verified
    const allDocuments = await userDocumentModel.find({
      ApplicationId: documentToVerify.ApplicationId
    });

    const allVerified = allDocuments.every(doc => doc.status === "verified");
    console.log("All documents verified?", allVerified);

    // ✅ If all verified, update application status and generate letter
    if (allVerified) {
      const application = await ApplicationModel.findById(documentToVerify.ApplicationId);

      if (application) {
        console.log("📝 Updating application status to verified");
        application.status = "verified";

        // ✅ Generate approval letter
        const letter = `
REPUBLIC OF SOMALILAND
MINISTRY OF INTERIOR
DEPARTMENT OF IMMIGRATION

VISA APPROVAL LETTER

Name: ${application.fullName}
Passport: ${application.passportNumber}
Nationality: ${application.nationality}
Visa Type: ${application.ApplicationType}

Status: APPROVED ✅
Valid: 90 Days from issue date

This letter certifies that the above-named individual has been approved for entry into the Republic of Somaliland.

Issued by: ${logginUser.firstName} ${logginUser.lastName}
Date: ${new Date().toLocaleDateString()}

--- OFFICIAL STAMP ---
`;

        application.approvalLetter = letter;
        await application.save();
        console.log("✅ Approval letter generated and saved");
      }
    }

    // ✅ Emit socket event for real-time updates
    const io = req.app.get("io");
    if (io) {
      io.emit("document-verified", {
        applicationId: documentToVerify.ApplicationId,
        status: "verified"
      });
    }

    res.json({
      message: "Document verified successfully",
      data: verifiedDocument,
      allVerified: allVerified || false
    });
  } catch (err) {
    console.error("❌ Verify Error:", err);
    res.status(400).json({ message: err.message });
  }
});

// ==========================================
// ✅ VERIFY DOCUMENT (TYPO VERSION - BACKWARD COMPATIBLE)
// ==========================================
AdminApplicationRouter.patch("/Admin/verifeied/Document/id/:id", UserAuth, async (req, res) => {
  console.log("⚠️ Using deprecated endpoint: verifeied (typo)");
  // ✅ Forward to the correct endpoint logic
  const { id } = req.params;
  req.params.id = id;
  
  // ✅ Call the same logic as verified
  try {
    const logginUser = req.user;
    if (logginUser.role !== "admin") {
      throw new Error("Access denied: Admin only");
    }

    const documentToVerify = await userDocumentModel.findOne({ _id: id });

    if (!documentToVerify) {
      return res.status(404).json({ message: "Document not found" });
    }

    const verifiedDocument = await userDocumentModel.updateMany(
      { ApplicationId: documentToVerify.ApplicationId, status: "pending" },
      {
        $set: {
          status: "verified",
          verifiedBy: logginUser._id,
          verifiedAt: new Date()
        }
      }
    );

    const allDocuments = await userDocumentModel.find({
      ApplicationId: documentToVerify.ApplicationId
    });

    const allVerified = allDocuments.every(doc => doc.status === "verified");

    if (allVerified) {
      const application = await ApplicationModel.findById(documentToVerify.ApplicationId);

      if (application) {
        application.status = "verified";

        const letter = `
REPUBLIC OF SOMALILAND
MINISTRY OF INTERIOR
DEPARTMENT OF IMMIGRATION

VISA APPROVAL LETTER

Name: ${application.fullName}
Passport: ${application.passportNumber}
Nationality: ${application.nationality}
Visa Type: ${application.ApplicationType}

Status: APPROVED ✅
Valid: 90 Days from issue date

Issued by: ${logginUser.firstName} ${logginUser.lastName}
Date: ${new Date().toLocaleDateString()}

--- OFFICIAL STAMP ---
`;

        application.approvalLetter = letter;
        await application.save();
      }
    }

    const io = req.app.get("io");
    if (io) {
      io.emit("document-verified", {
        applicationId: documentToVerify.ApplicationId,
        status: "verified"
      });
    }

    res.json({
      message: "Document verified successfully (deprecated endpoint)",
      data: verifiedDocument,
      allVerified: allVerified || false
    });
  } catch (err) {
    console.error("❌ Verify Error (typo endpoint):", err);
    res.status(400).json({ message: err.message });
  }
});

// ==========================================
// ✅ REJECT DOCUMENT
// ==========================================
AdminApplicationRouter.patch("/Admin/rejected/Document/id/:id", UserAuth, async (req, res) => {
  try {
    console.log("🔍 Rejecting document:", req.params.id);
    
    const logginUser = req.user;
    if (logginUser.role !== "admin") {
      throw new Error("Access denied: Admin only");
    }

    const { id } = req.params;
    const { rejectionReason } = req.body;

    const documentToReject = await userDocumentModel.findOne({ _id: id });

    if (!documentToReject) {
      console.log("❌ Document not found:", id);
      return res.status(404).json({ message: "Document not found" });
    }

    console.log("✅ Document found:", documentToReject._id);

    // ✅ Update document status to rejected
    const rejectedDocument = await userDocumentModel.updateMany(
      { ApplicationId: documentToReject.ApplicationId, status: "pending" },
      {
        $set: {
          status: "rejected",
          verifiedBy: logginUser._id,
          verifiedAt: new Date(),
          rejectionReason: rejectionReason || "Document does not meet requirements"
        }
      }
    );

    // ✅ Update application status to rejected
    await ApplicationModel.findByIdAndUpdate(
      documentToReject.ApplicationId,
      { status: "rejected" }
    );

    // ✅ Emit socket event
    const io = req.app.get("io");
    if (io) {
      io.emit("document-rejected", {
        applicationId: documentToReject.ApplicationId,
        status: "rejected"
      });
    }

    res.json({
      message: "Document rejected",
      data: rejectedDocument
    });
  } catch (err) {
    console.error("❌ Reject Error:", err);
    res.status(400).json({ message: err.message });
  }
});

// ==========================================
// 6. REJECT DOCUMENT
// ==========================================
AdminApplicationRouter.patch("/Admin/rejected/Document/id/:id", UserAuth, async (req, res) => {
  try {
    const logginUser = req.user;
    if (logginUser.role !== "admin") {
      throw new Error("Access denied: Admin only");
    }

    const { id } = req.params;
    const { rejectionReason } = req.body;

    const documentToReject = await userDocumentModel.findOne({ _id: id });

    if (!documentToReject) {
      throw new Error("Document not found");
    }

    // ✅ Update document status to rejected
    const rejectedDocument = await userDocumentModel.updateMany(
      { ApplicationId: documentToReject.ApplicationId, status: "pending" },
      {
        $set: {
          status: "rejected",
          verifiedBy: logginUser._id,
          verifiedAt: new Date(),
          rejectionReason: rejectionReason || "Document does not meet requirements"
        }
      }
    );

    // ✅ Update application status to rejected
    await ApplicationModel.findByIdAndUpdate(
      documentToReject.ApplicationId,
      { status: "rejected" }
    );

    // ✅ Emit socket event
    const io = req.app.get("io");
    if (io) {
      io.emit("document-rejected", {
        applicationId: documentToReject.ApplicationId,
        status: "rejected"
      });
    }

    res.json({
      message: "Document rejected",
      data: rejectedDocument
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ==========================================
// 7. BLOCK/UNBLOCK USER
// ==========================================
AdminApplicationRouter.post("/user/block/email/:email", UserAuth, async (req, res) => {
  try {
    const logginUser = req.user;
    if (logginUser.role !== "admin") {
      throw new Error("Access denied: Admin only");
    }

    const { email } = req.params;
    const currentUser = await User.findOne({ email });

    if (!currentUser) {
      throw new Error("User not found");
    }

    // ✅ Toggle status
    const newStatus = currentUser.status === "block" ? "active" : "block";
    
    const updatedUser = await User.updateOne(
      { email },
      { status: newStatus }
    );

    res.json({
      message: `User ${newStatus === "block" ? "blocked" : "unblocked"} successfully`,
      data: { email, status: newStatus }
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ==========================================
// 8. DELETE APPLICATION
// ==========================================
AdminApplicationRouter.delete("/admin/application/id/:id", UserAuth, async (req, res) => {
  try {
    const logginUser = req.user;
    if (logginUser.role !== "admin") {
      throw new Error("Access denied: Admin only");
    }

    const { id } = req.params;
    const deletedApplication = await ApplicationModel.findByIdAndDelete(id);

    if (!deletedApplication) {
      throw new Error("Application not found");
    }

    // ✅ Also delete associated documents
    await userDocumentModel.deleteMany({ ApplicationId: id });

    res.json({
      message: "Application and associated documents deleted successfully",
      data: deletedApplication
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ==========================================
// 9. DASHBOARD STATS (Quick Overview)
// ==========================================
AdminApplicationRouter.get("/admin/report/dashboard", UserAuth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const [
      totalUsers,
      totalApplications,
      totalDocuments,
      pendingApplications,
      verifiedApplications,
      rejectedApplications,
      verifiedDocuments,
      pendingDocuments,
      rejectedDocuments
    ] = await Promise.all([
      User.countDocuments(),
      ApplicationModel.countDocuments(),
      userDocumentModel.countDocuments(),
      ApplicationModel.countDocuments({ status: "pending" }),
      ApplicationModel.countDocuments({ status: "verified" }),
      ApplicationModel.countDocuments({ status: "rejected" }),
      userDocumentModel.countDocuments({ status: "verified" }),
      userDocumentModel.countDocuments({ status: "pending" }),
      userDocumentModel.countDocuments({ status: "rejected" })
    ]);

    res.json({
      totalUsers,
      totalApplications,
      totalDocuments,
      applications: {
        pending: pendingApplications,
        verified: verifiedApplications,
        rejected: rejectedApplications
      },
      documents: {
        verified: verifiedDocuments,
        pending: pendingDocuments,
        rejected: rejectedDocuments
      }
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ==========================================
// 10. FULL REPORT (Detailed Analytics)
// ==========================================
AdminApplicationRouter.get("/admin/report/full", UserAuth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const type = req.query.type || "summary";

    // === USERS ===
    if (type === "users") {
      const users = await User.find().select("firstName lastName email role status createdAt");
      return res.json({ type: "users", data: users });
    }

    // === APPLICATIONS ===
    if (type === "applications") {
      const applications = await ApplicationModel.find()
        .populate("userId", "firstName lastName email")
        .select("fullName ApplicationType status email phone nationality passportNumber createdAt");
      return res.json({ type: "applications", data: applications });
    }

    // === DOCUMENTS ===
    if (type === "documents") {
      const documents = await userDocumentModel.find()
        .populate("userId", "firstName lastName")
        .populate("verifiedBy", "firstName lastName")
        .select("DocumentType status rejectionReason createdAt filePath");
      return res.json({ type: "documents", data: documents });
    }

    // === SUMMARY DASHBOARD ===
    const [
      totalUsers,
      totalApplications,
      totalDocuments,
      applications,
      documents,
      users
    ] = await Promise.all([
      User.countDocuments(),
      ApplicationModel.countDocuments(),
      userDocumentModel.countDocuments(),
      ApplicationModel.find(),
      userDocumentModel.find(),
      User.find()
    ]);

    // ✅ Application status breakdown
    const applicationStatus = {};
    applications.forEach((a) => {
      const key = a.status || "pending";
      applicationStatus[key] = (applicationStatus[key] || 0) + 1;
    });

    // ✅ Document status breakdown
    const documentStatus = {};
    documents.forEach((d) => {
      const key = d.status || "pending";
      documentStatus[key] = (documentStatus[key] || 0) + 1;
    });

    // ✅ Visa type breakdown
    const visaType = {};
    applications.forEach((a) => {
      const key = a.ApplicationType || "unknown";
      visaType[key] = (visaType[key] || 0) + 1;
    });

    // ✅ Country breakdown
    const countryStats = {};
    applications.forEach((a) => {
      const key = a.nationality || "unknown";
      countryStats[key] = (countryStats[key] || 0) + 1;
    });

    // ✅ Monthly trend (last 6 months)
    const monthlyTrend = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = month.toLocaleString('default', { month: 'short' });
      const count = applications.filter(a => {
        const d = new Date(a.createdAt);
        return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
      }).length;
      monthlyTrend.push({ label: monthName, count });
    }

    // ✅ Approval rate
    const approved = applicationStatus["verified"] || 0;
    const approvalRate = totalApplications === 0 ? 0 : ((approved / totalApplications) * 100).toFixed(1);

    // ✅ User status breakdown
    const userStatus = {};
    users.forEach((u) => {
      const key = u.status || "active";
      userStatus[key] = (userStatus[key] || 0) + 1;
    });

    return res.json({
      summary: {
        totalUsers,
        totalApplications,
        totalDocuments,
        approvalRate: approvalRate + "%",
        userStatus
      },
      charts: {
        applicationStatus,
        documentStatus,
        visaType,
        countryStats,
        monthlyTrend
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 11. GET USER BY ID (Admin View)
// ==========================================
AdminApplicationRouter.get("/admin/user/:id", UserAuth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const applications = await ApplicationModel.find({ userId: id });
    const documents = await userDocumentModel.find({ userId: id });

    res.json({
      user,
      applications,
      documents
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ==========================================
// 12. GET PENDING DOCUMENTS (For Admin)
// ==========================================
AdminApplicationRouter.get("/admin/pending/documents", UserAuth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const pendingDocs = await userDocumentModel.find({ status: "pending" })
      .populate("userId", "firstName lastName email")
      .populate("ApplicationId")
      .sort({ createdAt: 1 });

    res.json({
      count: pendingDocs.length,
      data: pendingDocs
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});



module.exports = AdminApplicationRouter;