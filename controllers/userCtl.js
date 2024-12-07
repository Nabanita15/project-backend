const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Validator } = require("node-input-validator"); 
const userdb=require("../models/userschema") 
require("dotenv").config();

const secretKey = process.env.MY_KEY; 

module.exports = {
  signup: async (req, res) => {
    try {
      // Validate input
      const v = new Validator(req.body, {
        firstName: "required|string",
        lastName: "required|string",
        email: "required|email",
        countryCode: "required|string",
        phoneNumber: "required|string",
        password: "required|string|minLength:6",
        confirmpassword: "required|string|minLength:6",
        dateOfBirth: "required|date",
        gender: "required|string",
      });

      const matched = await v.check();
      if (!matched) {
        return res.status(422).json({ errors: v.errors });
      }

      const {
        firstName,
        lastName,
        email,
        countryCode,
        phoneNumber,
        password,
        confirmpassword,
        dateOfBirth,
        gender,
      } = req.body;

      // Check if passwords match
      if (password !== confirmpassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }

      // Check if user already exists
      const existingUser = await userdb.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const newUser = await userdb.create({
        firstName,
        lastName,
        email,
        countryCode,
        phoneNumber,
        password: hashedPassword,
        dateOfBirth,
        gender,
      });

      if (!newUser) {
        return res.status(500).json({ message: "Something went wrong" });
      }

      return res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      console.error("Error during signup:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      // Check if user exists
      const user = await userdb.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check password
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        return res.status(401).json({ message: "Invalid password" });
      }

      // Generate JWT
      const token = jwt.sign({ _id: user._id, email: user.email }, secretKey, {
        expiresIn: "5d",
      });

      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Error during login:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};
