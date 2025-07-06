import User from "../models/user.js";
import jwt from 'jsonwebtoken'


//Middleware to protect route
export const protectRoute = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
  
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Unauthorized: No token" });
      }
  
      const token = authHeader.split(" ")[1]; // Get the actual token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      const user = await User.findById(decoded.userId).select("-password");
  
      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" });
      }
  
      req.user = user;
      next();
    } catch (error) {
      console.log("Auth Error:", error.message);
      res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
  };
  