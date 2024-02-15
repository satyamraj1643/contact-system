const express = require("express");
const argon2 = require("argon2");
const { pool } = require("../dbconfig");
const {getKey} = require('../helper/api-key-generation')
const userRouter = express.Router();
const jwt = require("jsonwebtoken");


userRouter.post("/signup", async (req, res) => {
  const { FirstName, LastName, Website, email, password } = req.body;
  const uuid = getKey(64); // unique uuid for each user who registers
  const ipAddress = req.ip;
  const userAgent = req.get('User-Agent');

  try {
    const userAlreadyWithSameMail = await pool.query(
      "SELECT * FROM USERS WHERE email=$1",
      [email]
    ); // to prevent sql injection.

    if (userAlreadyWithSameMail.rowCount > 0) {
      return res.status(409).json({
        status: "CONFLICT",
        message: "User with the same email already exists",
      });
    }

    let hashedPassword;
    try {
      hashedPassword = await argon2.hash(password);
    } catch (error) {
      return res.status(500).json({
        status: "SERVER_ERROR",
        message: "Hash generation failed during signup.",
      });
    }

    await pool.query(
      "INSERT INTO USERS(fn,ln,website,hashval,email,password)VALUES($1, $2, $3, $4, $5, $6)",
      [FirstName, LastName, Website, uuid, email, hashedPassword]
    );

    const payload = {
        uuid: uuid,
        exp: Math.floor(Date.now() / 1000) + (60 * 60), // Expiry time in seconds of 1 hr
        ipAddress: ipAddress,
        userAgent:userAgent
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET);

    res.status(200).json({
      status: "SUCCESS",
      message: "User registered successfully",
      token, //jwt for maintaining session
      uuid, //unique id for each website
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({
      status: "SERVER_ERROR",
      message: "Internal server error",
    });
  }
});

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  //console.log(typeof password);
  const ipAddress = req.ip;
  const userAgent = req.get('User-Agent');

  try {
    const user = await pool.query("SELECT * FROM USERS WHERE email=$1", [
      email,
    ]);

    if (user.rowCount == 0) {
      return res.status(200).json({
        status: "NOT_FOUND",
        message: "User not in the database",
      });
    }

    const hashedPassword = user.rows[0].password.trim();

    /// Note trimming is important here because argon2 WILL consider spaces and then you will
    ///be stuck what is the error!!.. I searched entire web, GPT,  only to find no help,then i read what
    /// gpt said about trailing space..

    const uuid = user.rows[0].hashval.trim(); // trim this also else JWT will have a lot of 
    ///repeating charsets for spaces in uuid during token signature.
    const payload = {
        uuid: uuid,
        exp: Math.floor(Date.now() / 1000) + (60 * 60), // Expiry time in seconds of 1 hr
        ipAddress: ipAddress,
        userAgent:userAgent
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET);

    //console.log(typeof hashedPassword);
    let passwordMatch;

    try {
      try {
        //console.log("hello");
        passwordMatch = await argon2.verify(hashedPassword, password);
        //console.log(passwordMatch);
      } catch (error) {
        console.error("Error during password verification:", error);
      }

      if (passwordMatch) {
        res.status(200).json({
          status: "SUCCESS",
          message: "Logged in successfully",
          token,
          uuid,
        });
      } else {
        res.status(401).json({
          status: "INVALID_CREDENTIALS",
          message: "Invalid Password",
        });
      }
    } catch (error) {
      res.status(500).json({
        status: "SERVER_ERROR",
        message: "Internal server error during password match",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "SERVER_ERROR",
      message: "Internal server error",
    });
  }
});

module.exports = {
  userRouter,
};
