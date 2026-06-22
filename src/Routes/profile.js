
const express = require("express");

const profileRouter = express.Router();
const UserAuth = require("../middlewares/Auth")
const User = require("../models/user")
const {ValidateProfileUpdate}= require("../utils/CheckValidate")

const SavedUserData=["firstName","lastName","gender","status","age","role","phone","photoImage","email"]

profileRouter.get("/profile/view",UserAuth,async(req,res)=>{

    try{

     const logginUser=req.user;
    //  const user = await User.find(logginUser._id,SavedUserData)
    const user = await User.findById(logginUser._id).select(SavedUserData.join(" "));
     
     res.json({
        data:user
     })

    }catch(err){
        res.status(400).json({
            message:err.message
        })
    }

})


profileRouter.patch("/profile/edit",UserAuth,async(req,res)=>{
    try{
   const isValid = ValidateProfileUpdate(req);
if (!isValid) {
  throw new Error("not allowed to update fields");
}
        // if(!ValidateProfileUpdate(req)){
        //     throw new Error("not allowed to update fields")
        // }
        // const data=req.body;
        const data = req.body || {};
        if(!data){
            throw new Error("please fill updated fields")
        }
        const logginUser=req.user
        if(!logginUser){
            throw new Error("please login")
        }
        // const user = await User.findById(logginUser._id).select(SavedUserData.join(''));
        const user = await User.findById(logginUser._id).select(SavedUserData.join(" "));
        if(!user){
            throw new Error("user not found")
        }
        // if(user.phone===req.body.phone){
        //     throw new Error("old phone number")
        // }

     Object.keys(data).forEach((key)=>user[key]=data[key]);
        await user.save();
        res.json({
            message:"successfuly updated profile",
            data:user
        })
    }catch(err){
        res.status(400).json({ message: err.message })
    }
})

module.exports=profileRouter