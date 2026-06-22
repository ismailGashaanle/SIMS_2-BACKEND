// const express = require ("express");

// const ApplicationRouter= express.Router();
// const userAuth = require("../middlewares/Auth");
// const applicationModel= require ("../models/CreateApplication");
// const User = require("../models/user")
 

// // ApplicationRouter.post("/application",userAuth,async(req,res)=>{

// //    const {ApplicationValidate} = require("../utils/CheckValidate")

// //     try{
        
// //     if(!ApplicationValidate(req)){
// //         throw new Error("invalid new application");
// //     }
// // const logginUser=req.user
// //     //   const userRole= await User.find(logginUser._id)
   
// //       if(logginUser.role==="admin"){
// //         throw new Error("you are admin role not able to document upload or create new application")
// //       };
// //          if(logginUser.status ==="block"){
// //         throw new Error("you can't access to submit application contact Admin ")
// //       }
       
   
// //         const { userId, fullName,
// //            ApplicationType,
// //            email,
// //            phone,
// //            dateOfBirth,
// //            nationality,
// //            passportNumber,
// //            passportDateIssue,
// //            passportExpireDate,
// //            purposeOfTravel,
// //            intendedDepartureDate,
// //            addressInDestination}=req.body;
        

      

// //         const application=await applicationModel({
// //           userId:logginUser,
// //            fullName,
// //            ApplicationType,
// //            email,
// //            phone,
// //            dateOfBirth,
// //            nationality,
// //            passportNumber,
// //            passportDateIssue,
// //            passportExpireDate,
// //            purposeOfTravel,
// //            intendedDepartureDate,
// //            addressInDestination


// //         })

// //   const findPreviousApplication = await applicationModel.findOne({
// //   userId: logginUser._id
// // })

// // if (findPreviousApplication) {
// //   throw new Error("already you applied")
// // }


// //         await application.save()

// //         res.json({
// //             message:"successfuly created new application",
// //             data:application
            
// //         })
        

// //     }catch(err){
// //         res.status(400).json({
// //             message:err.message
// //         })
// //     }

// // })

// ApplicationRouter.post("/application", userAuth, async (req, res) => {
//   try {
//     const { ApplicationValidate } = require("../utils/CheckValidate");

//     if (!ApplicationValidate(req)) {
//       throw new Error("invalid new application");
//     }

//     const logginUser = req.user;

//     if (logginUser.role === "admin") {
//       throw new Error("you are admin role not able to document upload or create new application");
//     }
//     if (logginUser.status === "block") {
//       throw new Error("you can't access to submit application contact Admin");
//     }

//     const {
//       userId, fullName, ApplicationType, email, phone, dateOfBirth,
//       nationality, passportNumber, passportDateIssue, passportExpireDate,
//       purposeOfTravel, intendedDepartureDate, addressInDestination
//     } = req.body;

//     // Fixed: Check if user already has an application
//     const findPreviousApplication = await applicationModel.findOne({
//       userId: logginUser._id
//     });

//     if (findPreviousApplication) {
//       throw new Error("You have already applied");
//     }

//     const application = await applicationModel({
//       userId: logginUser._id, // Fixed: was logginUser (object)
//       fullName,
//       ApplicationType,
//       email,
//       phone,
//       dateOfBirth,
//       nationality,
//       passportNumber,
//       passportDateIssue,
//       passportExpireDate,
//       purposeOfTravel,
//       intendedDepartureDate,
//       addressInDestination
//     });

//     await application.save();

//     res.json({
//       message: "Successfully created new application",
//       data: application
//     });
//   } catch (err) {
//     res.status(400).json({
//       message: err.message
//     });
//   }
// });

// ApplicationRouter.get("/getMyApplication",userAuth,async(req,res)=>{

//     try{

//         const logginUser=req.user
//         if(logginUser.role ==="admin"){
//             throw new Error("not authroized Admin to create Application")
//         }
//  const userId = req.user._id
//         const application= await applicationModel.find({userId:userId})
       
//         if(!application){
//             throw new Error("application not found ")
//         }
//         res.json({
//             message:"succesfuly get your application",
//             data:application
//         })

//     }catch(err){
//         res.status(400).json({
//             message:err.message
//         })
//     }

// })

// ApplicationRouter.delete("/cancel/application/:applicationid",userAuth,async(req,res)=>{

//     try{

//         const {applicationid}=req.params
//         if(!applicationid){
//             throw new Error("not found application ID")
//         }
//         const cancelApplicatipon= await applicationModel.findByIdAndDelete(applicationid)

//  if(!cancelApplicatipon){
//     throw new Error("not found application to delete")
//  }
     
// //  await applicationModel.save();

//         res.json({
//            message:"delete successfuly",
//         //    data:cancelApplicatipon
//         })


//     }catch(err){
//         res.json({
//             message:err.message
//         })
//     }

// })


// module.exports= ApplicationRouter;


const express = require("express");
const ApplicationRouter = express.Router();
const userAuth = require("../middlewares/Auth");
const applicationModel = require("../models/CreateApplication");
const User = require("../models/user");

ApplicationRouter.post("/application", userAuth, async (req, res) => {
  const { ApplicationValidate } = require("../utils/CheckValidate");

  try {
    if (!ApplicationValidate(req)) {
      throw new Error("invalid new application");
    }

    const logginUser = req.user;

    if (logginUser.role === "admin") {
      throw new Error("you are admin role not able to document upload or create new application");
    }

    if (logginUser.status === "block") {
      throw new Error("you can't access to submit application contact Admin");
    }

    const {
      userId, fullName, ApplicationType, email, phone, dateOfBirth,
      nationality, passportNumber, passportDateIssue, passportExpireDate,
      purposeOfTravel, intendedDepartureDate, addressInDestination
    } = req.body;

    const findPreviousApplication = await applicationModel.findOne({
      userId: logginUser._id
    });

    if (findPreviousApplication) {
      throw new Error("already you applied");
    }

    const application = await applicationModel({
      userId: logginUser._id,
      fullName,
      ApplicationType,
      email,
      phone,
      dateOfBirth,
      nationality,
      passportNumber,
      passportDateIssue,
      passportExpireDate,
      purposeOfTravel,
      intendedDepartureDate,
      addressInDestination,
      status: "pending" // ✅ Default status
    });

    await application.save();

    res.json({
      message: "successfully created new application",
      data: application
    });
  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
});

ApplicationRouter.get("/getMyApplication", userAuth, async (req, res) => {
  try {
    const logginUser = req.user;

    if (logginUser.role === "admin") {
      throw new Error("not authorized Admin to view applications here");
    }

    const userId = req.user._id;
    const application = await applicationModel.find({ userId: userId });

    if (!application || application.length === 0) {
      return res.json({
        message: "No application found",
        data: []
      });
    }

    res.json({
      message: "successfully get your application",
      data: application
    });
  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
});

ApplicationRouter.delete("/cancel/application/:applicationid", userAuth, async (req, res) => {
  try {
    const { applicationid } = req.params;
    if (!applicationid) {
      throw new Error("not found application ID");
    }

    const cancelApplicatipon = await applicationModel.findByIdAndDelete(applicationid);

    if (!cancelApplicatipon) {
      throw new Error("not found application to delete");
    }

    res.json({
      message: "delete successfuly"
    });
  } catch (err) {
    res.json({
      message: err.message
    });
  }
});

module.exports = ApplicationRouter;