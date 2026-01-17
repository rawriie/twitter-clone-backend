const express = require('express');
const router = express.Router()
const Posts = require('../models/posts');
const { protect } = require('../middleware/users');

router.get('/', async (req, res) => {
  try {
    const posts = await Posts.find().populate('userId', 'username').sort({ createdAt: -1 })

    res.json(posts)
  }
  catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/:id', getPost, (req, res) => {
  res.json(res.post)
})

router.post('/',protect, async (req, res) => {
  const post = new Posts({
    userId: req.user._id,
    postContent: req.body.postContent,

  })

  try {
    const newPost = await post.save()
    res.status(201).json(newPost)
  }
  catch (err) {
    res.status(400).json({ message: err.message })
  }
})

router.patch('/:id', protect, getPost, async (req, res) => {
  console.log('BODY IS:', req.body)
  if (req.body.postContent == null) {
    return res.status(400).json({
      message: "postContent is required."
    })
  }

  res.post.postContent = req.body.postContent

  try {
    if (req.user._id.equals(res.post.userId._id)) {
      const updatedPost = await res.post.save()
      res.status(200).json({
        message: "Post updated.",
        post: updatedPost
      })
    }
    else{
      return res.status(401).json({ "message": `User not authorized.` })
    }
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})



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

async function getPost(req, res, next) {
  let post;
  try {
    post = await Posts.findById(req.params.id).populate('userId', 'username')
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