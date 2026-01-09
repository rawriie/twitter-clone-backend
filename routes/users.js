const express = require('express');
const router = express.Router()
const Users = require('../models/users');

router.post('/register', async (req, res) => {
  const {username, email, password} = req.body
  try{
    if(!username || !email || !password){
      res.status(400).json(message: "Missing field.")
    }
    const userExists = await Users.findOne({$or: [
      { username: username },
      { email: email }
      ]});
      
    if(userExists.username === username){
      res.status(400).json(message: "Username taken.")
    }
    if(userExists.email === email){
      res.status(400).json(message: "Email already registered.")
    }
  
    const user = await Users.create(username, email, password)
    res.status(201).json(user)
  }
  catch (err){
    res.status(500).json({message: err.message})
  }
})

router.post('/login', async (req, res) => {
  const {email, password} = req.body
  try{
    if(!email || !password){
      res.status(400).json(message: "Missing field.")
    }
    
    const user = await Users.findOne({email})
    
    if(!user || !(await user.matchPwd(password))){
      res.status(401).json(message: "Invalid credentials.")
    }
    
    res.status(200).json(user)
  }
  catch(error){
    res.status(500).json({message: err.message})
  }
})