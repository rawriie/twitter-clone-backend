const express = require('express');
const router = express.Router()
const Posts = require('../models/posts');
const Comments = require('../models/comments');
router.get('/', async (req, res) => {
  try{
    const posts = await Posts.find()
    res.json(posts)
  }
  catch (err){
    res.status(500).json({message: err.message})
  }
})
router.get('/comments/:id', async (req, res) => {
  try{
    const comments = await Comments.find({postId: req.params.id})
    res.json(comments)
  }
  catch(error){
    res.status(500).json({message: err.message})
    
  }
})
router.get('/:id', getPost, (req, res) => {
  res.json(res.post)
})

router.post('/', async (req, res) => {
  const post = new Posts({
    userId: req.body.userId,
    postContent: req.body.postContent,
    
  })
  
  try{
    const newPost = await post.save()
    res.status(201).json(newPost)
  }
  catch(err){
    res.status(400).json({message: error.message})
  }
})

router.patch('/:id', getPost, async (req, res) => {
  console.log('BODY IS:', req.body)
  if (req.body.postContent == null) {
    return res.status(400).json({
      message: "postContent is required."
    })
  }

  res.post.postContent = req.body.postContent

  try {
    const updatedPost = await res.post.save()
    res.status(200).json({
      message: "Post updated.",
      post: updatedPost
    })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})



router.delete('/:id', getPost, async (req, res) => {
  try {
    await res.post.deleteOne()
    res.status(200).json({"message": "Deleted post."})
  } catch (err) {
    res.status(500).json({"message": err.message})
    
  }
})

async function getPost(req, res, next){
  let post;
  try{
    post = await Posts.findById(req.params.id)
    if(post === null){
      return res.status(404).json({"message": "Post not found."})
    }
  }
  catch(error){
    res.status(500).json({"message": "Server error."});
  }
  res.post = post
  next()
}
module.exports = router;