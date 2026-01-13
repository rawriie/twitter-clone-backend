const express = require('express');
const router = express.Router()
const Users = require('../models/users');
const { protect } = require('../middleware/users');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
  const {username, email, password} = req.body
  try{
    if(!username || !email || !password){
      return res.status(400).json({message: "Missing field."})
    }
    const userExists = await Users.findOne({$or: [
      { username: username },
      { email: email }
      ]});
    if (userExists) {
      if(userExists.username === username){
        return res.status(400).json({message: "Username taken."})
      }
      if(userExists.email === email){
        return res.status(400).json({message: "Email already registered."})
      }
    }
  
    const user = await Users.create({username, email, password})
    const token = generateToken(user._id);
    res.status(201).json({
      id: user._id,
      username: user.username,
      email: user.email,
      token,
    })
  }
  catch (err){
    res.status(500).json({message: err.message})
  }
})

router.post('/login', async (req, res) => {
  const {username, email, password} = req.body
  try{
    if(!username && !email || !password){
      return res.status(400).json({message: "Missing field."})
    }
    
    const user = await Users.findOne({email})
    
    if(!user || !(await user.matchPwd(password))){
      return res.status(401).json({message: "Invalid credentials."})
    }
    
    const token = generateToken(user._id);
    res.status(201).json({
      id: user._id,
      username: user.username,
      email: user.email,
      token,
    })
  }
  catch(error){
    res.status(500).json({message: err.message})
  }
})

router.get("/me", protect, async (req, res) => {
  res.status(200).json(req.user);
})

const generateToken = (id) => {
  return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "30d"})
}
module.exports = router;