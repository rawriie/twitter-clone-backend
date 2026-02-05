const express = require('express');
const router = express.Router()
const Users = require('../models/users');
const { protect } = require('../middleware/users');
const jwt = require('jsonwebtoken');
const { upload, uploadToCloudinary } = require('../middleware/upload');
const users = require('../models/users');

router.get('/:username', async (req, res) => {
  try{
    const username = req.params.username;
    const user = await Users.findOne({username: username}).select('-password -email');

    if(user){
      res.status(200).json(user);
    }
    else{
      res.status(404).json({message: "User not found."});
    }

    res.status(200)
  }
  catch(err){
    res.status(500).json({ message: err.message })
  }

})

router.post('/register', upload.single('uploadedFile'), async (req, res) => {
  const { username, email, password, displayName } = req.body
  try {
    if (!username || !email || !password || !displayName || !req.file) {
      return res.status(400).json({ message: "Missing field." })
    }
    const userExists = await Users.findOne({
      $or: [
        { username: username },
        { email: email }
      ]
    });
    if (userExists) {
      if (userExists.username === username) {
        return res.status(400).json({ message: "Username taken." })
      }
      if (userExists.email === email) {
        return res.status(400).json({ message: "Email already registered." })
      }
    }

    const emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const usernameRegex = /^(?![._])(?!.*[._]$)(?!.*__)(?!.*\.\.)(?!.*\._)(?!.*_\.)(?=.{8,20}$)[a-zA-Z0-9._-]+$/;

    if(!email.match(emailRegex) || !username.match(usernameRegex || password.length < 8 || password.length > 30)){
      return res.status(400).json({ message: "Invalid user info." });
    }

    const img = await uploadToCloudinary(req.file.buffer, true);

    console.log(img, "ajaajjajajajaj");
    const user = await Users.create({
      username: username,
      email: email,
      password: password,
      displayName: displayName,
      profilePic: img
    })
    
    const token = generateToken(user._id);
   
    res.status(201).json({
      id: user._id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      profilePic: user.profilePic,
      token
    })
    
  }
  catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/login', async (req, res) => {
  const { username, email, password } = req.body
  try {
    if (!username && !email || !password) {
      return res.status(400).json({ message: "Missing field." })
    }

    const user = await Users.findOne({ email })

    if (!user || !(await user.matchPwd(password))) {
      return res.status(401).json({ message: "Invalid credentials." })
    }

    const token = generateToken(user._id);
    res.status(201).json({
      id: user._id,
      username: user.username,
      email: user.email,
      token,
    })
  }
  catch (error) {
    res.status(500).json({ message: err.message })
  }
})
router.get("/check-availability", async (req, res) => {
  try {
    console.log(req.query)
    if (!req.query.username && !req.query.email) {
      res.status(400).json({ message: "No username or email in body." })
    }


    if (req.query.username) {
      const username = req.query.username
      const user = await Users.findOne({ username })

      if (!user) {
        res.json({ message: "Username is available." })
      }
      else {
        res.status(400).json({ message: "Username taken." })
      }
    }
    if (req.query.email) {
      const email = req.query.email
      const user = await Users.findOne({ email })

      if (!user) {
        res.json({ message: "Email is available." })
      }
      else {
        res.status(400).json({ message: "Email taken." })
      }
    }
  }
  catch (err) {
    res.status(500).json({ message: err.message })
  }
})
router.get("/", protect, async (req, res) => {
  res.status(200).json(req.user);
})

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" })
}
module.exports = router;