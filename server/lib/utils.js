import jwt from 'jsonwebtoken'

// Fxn to create token

export const generateToken = (userId) =>{
    const token = jwt.sign({userId}, process.env.JWT_SECRET);
    return token;
}