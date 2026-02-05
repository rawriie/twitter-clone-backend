const express = require('express');
const router = express.Router()
const Posts = require('../models/posts');
const { protect } = require('../middleware/users');
const Users = require('../models/users');


//Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Posts.find().populate('userId', 'username displayName profilePic').sort({ createdAt: -1 })

    res.json(posts)
  }
  catch (err) {
    res.status(500).json({ message: err.message })
  }
})

//Get posts by id
router.get('/:id', getPost, (req, res) => {
  res.json(res.post)
})

//Create new post
router.post('/', protect, async (req, res) => {
  try {
    if (req.body.parentId) {
      const post = new Posts({
        userId: req.user._id,
        content: req.body.content,
        parentId: req.body.parentId

      })

      const newPost = await post.save()
      res.status(201).json(newPost)
    }
    else{
      const post = new Posts({
        userId: req.user._id,
        content: req.body.content,

      })

      const newPost = await post.save()
      res.status(201).json(newPost)
    }

    
  }
  catch (err) {
    res.status(400).json({ message: err.message })
  }
})


//Edit post
router.patch('/:id', protect, getPost, async (req, res) => {
  console.log('BODY IS:', req.body)
  if (req.body.content == null) {
    return res.status(400).json({
      message: "content is required."
    })
  }

  res.post.content = req.body.content

  try {
    if (req.user._id.equals(res.post.userId._id)) {
      const updatedPost = await res.post.save()
      res.status(200).json({
        message: "Post updated.",
        post: updatedPost
      })
    }
    else {
      return res.status(401).json({ "message": `User not authorized.` })
    }
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})


//Delete post
router.delete('/:id', protect, getPost, async (req, res) => {
  try {
    if (req.user._id.equals(res.post.userId._id)) {
      await res.post.deleteOne()
      return res.status(200).json({ "message": "Deleted post." })
    }
    else {
      return res.status(401).json({ "message": `User not authorized.` })
    }
  } catch (err) {
    res.status(500).json({ "message": err.message })

  }
})

//Get posts by userId
router.get('/user/posts/:userId', async (req, res) => {
  try {
    const user = await Users.findById(req.params.userId).select('-password -email');

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const posts = await Posts.find({ userId: req.params.userId }).populate('userId', 'username displayName profilePic').sort({ createdAt: -1 })
    res.json(posts)
  }
  catch (err) {
    res.status(500).json({ "message": err.message })
  }
})

//Get post replies
router.get('/replies/:id', async (req, res) => {
  try {
    const replies = await Posts.find({ parentId: req.params.id }).populate('userId', 'username displayName profilePic').sort({ createdAt: -1 });

    res.json(replies);
  }
  catch (err) {
    res.status(500).json({ "message": err.message })
  }
})

//Get all replies by user
router.get('/user/replies/:userId', async (req, res) => {
  try {
    const user = await Users.findById(req.params.userId).select('-password -email');

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const replies = await Posts.find({ parentId: { $ne: null, $exists: true }, userId: req.params.userId }).populate('userId', 'username displayName profilePic').sort({ createdAt: -1 })
    res.json(replies)
  }
  catch (err) {
    res.status(500).json({ "message": err.message })
  }
})

async function getPost(req, res, next) {
  let post;
  try {
    post = await Posts.findById(req.params.id).populate('userId', 'username displayName profilePic')
    if (post === null) {
      return res.status(404).json({ "message": "Post not found." })
    }
  }
  catch (error) {
    return res.status(500).json({ "message": "Server error." });
  }
  res.post = post
  next()
}
module.exports = router;