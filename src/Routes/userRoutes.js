
const express = require("express");
const UserAuth = require("../middlewares/Auth");
const User = require("../models/user")

const userRouter = express.Router();


userRouter.get("/Admin/users",UserAuth,async(req,res)=>{
    try{
      const logginUser= req.user
        const data = await User.find({role:"user"})
        res.json({
            data:data
        })

    }catch(err){
        res.status(400).json({
            message:err.message
        })
    }
})


userRouter.delete("/Admin/user/delete/id/:id",UserAuth,async(req,res)=>{

    try{
        const logginUser = req.user
        if(logginUser.role !=="admin"){
            throw new Error ("access denied only can Access Admin ")
        }
        const {id} = req.params
        const deletedUser = await  User.findByIdAndDelete(id)

        if(!deletedUser){
            throw new Error("user not found to delete")
        }

        res.json({
            message:"successfuly deleted User",
            data:User
        })

    }catch(err){
        res.status(400).json({
            message:err.message
        })
    }

})




module.exports=userRouter;

