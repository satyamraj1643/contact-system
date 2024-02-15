const express = require('express');
const fetchRouter = express.Router();
const {authenticationFunction} = require('../middleware/jwt-verification');
const {apiKeyValidation} = require('../middleware/api-keyvalidation');
const {pool} = require('../dbconfig')

const argon2 = require('argon2')

fetchRouter.get('/fetch/:apiKey', authenticationFunction,apiKeyValidation, async (req,res)=>{
     
    const apiKey = req.params.apiKey;
    const password = req.body.password;


    try {

        const queryForHash = await pool.query("SELECT * FROM users WHERE hashval=$1", [apiKey]);

        if(queryForHash.rowCount>0){

            const hashedPassword = queryForHash.rows[0].password.trim();

            try {
      
                const passwordmatch = await argon2.verify(hashedPassword, password);

                if(passwordmatch){
                    try {

                        const allContacts = await pool.query("SELECT * FROM contact WHERE hashval=$1", [apiKey]);

                        console.log(allContacts.rows);
                        return res.status(200).json({
                            status: "SUCCESS",
                            message: "Data fetched successfully.",
                            alldata: (allContacts.rows),
                        });
                        
                    } catch (error) {

                        res.status(503).json({
                            status: "UNABLE_TO_FETCH",
                            message: "Unable to access database."
                        })
                        
                    }
                }

                else{
                    res.status(401).json({
                        status: "INVALID_CREDENTIALS",
                        message: "Invalid password entered."
                    })
                }
        
                
            } catch (error) {
                res.status(503).json({
                    status: "LIBRARY_ERROR",
                    message: "Unable to validate password."
                })


                
            }
        }

        else{

            res.status(502).json({
                status: "INVALID_APIKEY",
                message: "Invalid API key entered."
            })

        }
        
    } catch (error) {

        res.status(503).json({
            status: "UNABLE_TO_FETCH",
            message: "Unable to access database."
        })

        
    }

    


})



module.exports = {
    fetchRouter,
}

