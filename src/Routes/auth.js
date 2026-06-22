
const express = require("express");
const AuthRouter = express.Router();
const bcrypt = require("bcrypt")
const {ValidateSignUp,validateLogin,ValidateUpdate} = require("../utils/CheckValidate")
const User =require("../models/user");
const UserAuth = require("../middlewares/Auth");
 



AuthRouter.post("/signup",async(req,res)=>{
   console.log(req.body)

    try{
          ValidateSignUp(req)
        const {firstName,lastName,email,password,role} = req.body;

        const passwordHash = await  bcrypt.hash(password,10);

        const user = await new User({
            firstName,
            lastName,
            email,
            password:passwordHash,
            role
        })

        const data = await user.save();

        res.status(201).json({
           message:"succesfully register",
            data:data
        })


    }catch(err){
         res.status(400).json({
        message: err.message
    })
    }



})


AuthRouter.post("/login",async(req,res)=>{
    try{
        validateLogin(req)

        const {email,password} = req.body;

        const user = await User.findOne({
            email:email
        })
        if(user?.status==="block"){
            throw new Error("system blocked please contact Admin")
        }
        if(user?.role ==="suspended"){
            throw new Error("your account was suspended please contact ADMIN")
        }
 
        
        if(!user){
            throw new Error("invalid credential")
        }

        const isValidPassword = await user.ValidatePassword(password);
        if(!isValidPassword){
            throw new Error("invalid credentail")
        }


        const token  = await user.getJWT();
        // res.cookie("token",token,{expires:new Date(Date.now() + 8 *360000)});
      res.cookie("token", token, {
  secure: false, // true in production (HTTPS)
  sameSite: "lax", // or "none" if frontend/backend different domains
  maxAge: 24 * 60 * 60 * 1000 // 1 day
});
        res.json({
            message:"successfully login",
            data:user
        })
                


    }catch(err){
        res.status(400).json({
            message:err.message
        })
    }
})


AuthRouter.post("/logout",UserAuth,async(req,res)=>{

    try{
        res.cookie("token",null,
            {expires:new Date(Date.now())}
        );
        res.json({
            message:"successfuly logout"
        })

    }catch(err){
        res.status(400).json({
            message:err.message
        })
    }
})


AuthRouter.post("/updatePassword",UserAuth,async(req,res)=>{
try{
    ValidateUpdate(req)

    const loginUser=req.user
    const { newPassword } =req.body

    if(!newPassword){
        throw new Error("new password is required");
    }

    const user = await User.findById(loginUser._id);
    if(!user){
        throw new Error("user not found");
    }



    const oldPassword = await bcrypt.compare(newPassword,user.password)
    if(oldPassword){
        throw new Error("old password please create new password")
    }
    
    const HashPassword = await bcrypt.hash(newPassword,10);

    user.password = HashPassword

    const data = await user.save();
    res.json({
        message:"successfully update",
        data:data
    })

}catch(err){
    res.status(400).json({
        message:err.message
    })
}




})

module.exports=AuthRouter