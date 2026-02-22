const express = require('express');
const router = express.Router()
const Users = require('../models/users');
const { protect } = require('../middleware/users');
const jwt = require('jsonwebtoken');
const { upload, uploadToCloudinary } = require('../middleware/upload');
const Follows = require('../models/follows')

router.get('/info/:username', async (req, res) => {
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
  try{
    res.status(200).json(req.user);
   
  }
  catch (err) {
   
    res.status(500).json({ message: err.message })
  }
})


router.post("/follow/:userId", protect, async (req, res) => {
  try{

    if(req.user._id.equals(req.params.userId)){
      return res.status(400).json({message: "You cannot follow yourself."});
    }

    const followExists = await Follows.findOne({userId: req.user._id, followerId: req.params.userId});

    if(followExists){
      
      return res.status(400).json({message: "User already followed."});
      
    }

    const follow =  new Follows({
      userId: req.params.userId,
      followerId: req.user._id
    });

    const newFollow = await follow.save();
    res.status(201).json(newFollow);
  }
  catch(err){
    res.status(500).json({ message: err.message })
  }
})

router.delete("/follow/:userId", protect, async (req, res) => {
  try{

    if(req.user._id.equals(req.params.userId)){
      return res.status(400).json({message: "You cannot unfollow yourself."});
    }

    const follow = await Follows.findOne({userId: req.params.userId, followerId: req.user._id});

    if(!follow){
      
      return res.status(400).json({message: "User is not followed."});
      
    }

    await follow.deleteOne();
    res.status(200).json({message: "Unfollowed user."});

   
  }
  catch(err){
    res.status(500).json({ message: err.message })
  }
})

router.get("/follower/:userId", protect, async (req, res) => {
  try{
    const followers = await Follows.find({userId: req.params.userId})
    const following = await Follows.find({followerId: req.params.userId})
    const isFollowing = followers.filter(f => f.followerId.equals(req.user._id));

    res.json({followerCount: followers.length, followingCount: following.length, isFollowing: isFollowing.length > 0 ? true : false});
  }
  catch(err){
    res.status(500).json({ message: err.message });
  }
})


router.patch("/edit", protect, upload.fields([{ name: 'pfp', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), async (req, res) => {
  const { displayName, bio } = req.body
  try{
    console.log("1")
    if(req.files){
      if(req.files.pfp?.length > 0){
        const pfpUrl = await uploadToCloudinary(req.files.pfp[0].buffer, true);

        req.user.profilePic = pfpUrl;
      }
      if(req.files.banner?.length > 0){
        const bannerUrl = await uploadToCloudinary(req.files.banner[0].buffer, false);

        req.user.bannerImg = bannerUrl;
      }
    }
    console.log("2")
    if(displayName){
      req.user.displayName = displayName;
    }
    console.log("3")
    if(bio){
      req.user.bio = bio;
    }
    console.log("4")
    const updatedUser = req.user.save();
    console.log("5")
    res.status(201).json(updatedUser);
    console.log("6")
  }
  catch(err){
    res.status(500).json({ message: err.message });
  }
})


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
}
module.exports = router;