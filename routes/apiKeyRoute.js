const express = require('express');
const {apiKeyValidation} = require('../middleware/api-keyvalidation')
const contactRouter = express.Router();
const {pool} = require('../dbconfig')


contactRouter.post('/post/:apiKey', apiKeyValidation, async (req,res)=>{
    const apiKey = req.params.apiKey
    const {firstname, lastName, email, message} = req.body;
    //console.log(firstname, lastName, email, message,apiKey);

    try {
        
        const query = await pool.query(
            "INSERT INTO contact(fn, ln, email, hashval, message) VALUES($1, $2, $3, $4, $5)",
            [firstname, lastName, email, apiKey,message]
          );
          
       
        if(query.rowCount>0){
            return res.status(200).json({
                status: "SUCCESS",
                message: "Successfully addded to the databse"
            })
        }
        else{
            return res.status(503).json({
                status: "FAILURE",
                message: "Unable to add value to the database"
            })

        }
        
    } catch (error) {
        return res.status(500).json({
            status: "SERVER_ERROR",
            message: "Internal server error occurred aanh"
        })
        
    } 
 
})

module.exports={
    contactRouter
}

