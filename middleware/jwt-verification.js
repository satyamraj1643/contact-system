const express = require('express');
const validityRouter = express.Router();
const jwt = require('jsonwebtoken')


// for protected routes

const authenticationFunction = (req,res,next)=>{

    const token = req.header('Authorization');
    const token2 = token.slice(7);
    //console.log(token2);

    jwt.verify(token2, process.env.JWT_SECRET, (err, decoded)=>{
        if(err){
            res.status(401).json({
                status: "INVALID",
                message: "Unauthorized user 1."
            })
        }
        else{
            if(decoded.ipAddress === req.ip && decoded.userAgent === req.get('User-Agent')){
                next();
            }
            else{
                return res.status(401).json({
                    status: "INVALID",
                    message: "Unauthorized user 2."
                })

            } 
        }
    })

}

module.exports={
    authenticationFunction
}