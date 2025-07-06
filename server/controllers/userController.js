import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.js";
import bcrypt from "bcryptjs"


// Signup new user
export const signup= async(req,res)=>{
    const {fullName, email, password, bio} = req.body;
    try {
        if(!fullName || !email || !password || !bio){
            return  res.json({success: false, message:"Missing Details"})
        }
        const user= await User.findOne({email});

        if (user) {
            return  res.json({success: false, message:"Account already exists"})
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser= await User.create({
            fullName, email, password: hashedPassword, bio
        });

        const token = generateToken(newUser._id)

        res.json({success:true, userData: newUser,token, message:"Account created successfully"})

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Controller for login

export const login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Basic validation
      if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" });
      }
  
      const userData = await User.findOne({ email });
  
      // Check if user exists
      if (!userData) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      // Check password
      const isPasswordCorrect = await bcrypt.compare(password, userData.password);
      if (!isPasswordCorrect) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }
  
      // Generate token and respond
      const token = generateToken(userData._id);
      res.json({
        success: true,
        userData,
        token,
        message: "Login successful"
      });
  
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
  

// Controller to check user is authenticated

export const checkAuth = (req,res)=>{
    res.json ({success: true, user: req.user});
}

//Controller to update user profile details
export const updateProfile = async (req,res) =>{
    try {
        const { profilePic, bio, fullName}= req.body;

        const userId =req.user._id;
        let updatedUser;

        if (!profilePic) {
           updatedUser= await User.findByIdAndUpdate(userId,{bio,fullName},{new:true});
        }
        else{
            const upload = await cloudinary.uploader.upload(profilePic);

            updatedUser = await User.findByIdAndUpdate(userId,{profilePic:upload.secure_url, bio,fullName},{new:true});
        }
        res.json({success:true,user : updatedUser})
    } catch (error) {
        res.json({success:false,message:error.message});
        console.log(error.message);
    }
}

