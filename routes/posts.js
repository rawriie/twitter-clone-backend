const express = require('express');
const router = express.Router()
const Posts = require('../models/posts');
const Likes = require('../models/likes')
const { protect } = require('../middleware/users');
const Users = require('../models/users');
const likes = require('../models/likes');


//Get all posts
router.get('/', protect, async (req, res) => {
  try {
    const posts = await Posts.find().populate('userId', 'username displayName profilePic').populate('likesCount').populate('replyCount').sort({ createdAt: -1 }).lean()

    const postIds = posts.map(p => p._id);
    const likedPosts = await Likes.find({
      userId: req.user._id,
      postId: { $in: postIds }
    }).select('postId');

    const likedPostIds = likedPosts.map(l => l.postId.toString());

    for (let i = 0; i < posts.length; i++) {
      posts[i].isLikedByMe = likedPostIds.includes(posts[i]._id.toString());
    }

    res.json(posts)
  }
  catch (err) {
    res.status(500).json({ message: err.message })
  }
})

//Get posts by id
router.get('/:id', protect, getPost, (req, res) => {
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
      await Posts.deleteOne({ _id: req.params.id })
      return res.status(200).json({ "message": "Deleted post." })
    }
    else {
      return res.status(401).json({ "message": `User not authorized.` })
    }
  } catch (err) {
    res.status(500).json({ "message": err.message })

  }
})

//Add Like to a post
router.post('/like/:postId', protect, async (req, res) => {
  try{
    const likeExists = await Likes.findOne({userId: req.user._id, postId: req.params.postId});

    if(likeExists){
      
      return res.status(400).json({message: "Post already liked."});
      
    }
    const like = new Likes({
      userId: req.user._id,
      postId: req.params.postId
    });

    const newLike = await like.save();
    res.status(201).json(newLike);
  }
  catch(err){
    res.status(500).json({ "message": err.message })
  }
})

//Remove Like from a post
router.delete('/like/:postId', protect, async (req, res) => {
  try{
  
    const like = await Likes.findOne({userId: req.user._id, postId: req.params.postId});

    if(!like){
      return res.status(404).json({message: "Like not found."});
    }

    await like.deleteOne();
    res.status(200).json({message: "Removed like."});
  }
  catch(err){
    res.status(500).json({ "message": err.message })
  }
})

//Get posts by userId
router.get('/user/posts/:userId', protect, async (req, res) => {
  try {
    const user = await Users.findById(req.params.userId).select('-password -email');

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const posts = await Posts.find({ userId: req.params.userId }).populate('userId', 'username displayName profilePic').populate('likesCount').populate('replyCount').sort({ createdAt: -1 }).lean()
   
    const postIds = posts.map(p => p._id);
    const likedPosts = await Likes.find({
      userId: req.user._id,
      postId: { $in: postIds }
    }).select('postId');

    const likedPostIds = likedPosts.map(l => l.postId.toString());

    for (let i = 0; i < posts.length; i++) {
      posts[i].isLikedByMe = likedPostIds.includes(posts[i]._id.toString());
    }

    res.json(posts)
  }
  catch (err) {
    res.status(500).json({ "message": err.message })
  }
})

//Get post replies
router.get('/user/:id', protect, async (req, res) => {
  try {
    const replies = await Posts.find({ parentId: req.params.id }).populate('userId', 'username displayName profilePic').populate('likesCount').populate('replyCount').sort({ createdAt: -1 }).lean();
    
    const replyIds = replies.map(p => p._id);
    const likedPosts = await Likes.find({
      userId: req.user._id,
      postId: { $in: replyIds }
    }).select('postId');

    const likedPostIds = likedPosts.map(l => l.postId.toString());

    for (let i = 0; i < replies.length; i++) {
      replies[i].isLikedByMe = likedPostIds.includes(replies[i]._id.toString());
    }
    res.json(replies);
    

  }
  catch (err) {
    res.status(500).json({ "message": err.message })
  }
})

//Get all replies by user
router.get('/user/replies/:userId',protect , async (req, res) => {
  try {
    const user = await Users.findById(req.params.userId).select('-password -email');

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const replies = await Posts.find({ parentId: { $ne: null, $exists: true }, userId: req.params.userId }).populate('userId', 'username displayName profilePic').populate('likesCount').populate('replyCount').sort({ createdAt: -1 }).lean();

    const replyIds = replies.map(p => p._id);
    const likedPosts = await Likes.find({
      userId: req.user._id,
      postId: { $in: replyIds }
    }).select('postId');

    const likedPostIds = likedPosts.map(l => l.postId.toString());

    for (let i = 0; i < replies.length; i++) {
      replies[i].isLikedByMe = likedPostIds.includes(replies[i]._id.toString());
    }
    res.json(replies)
  }
  catch (err) {
    res.status(500).json({ "message": err.message })
  }
})

async function getPost(req, res, next) {
  let post;
  try {
    post = await Posts.findById(req.params.id).populate('userId', 'username displayName profilePic').populate('likesCount').lean()
    
   
    
    if (post === null) {
      return res.status(404).json({ "message": "Post not found." })
    }

   
    const likedPost = await Likes.find({
      userId: req.user._id,
      postId: post._id
    }).select('postId');

   
    if(likedPost){
      post.isLikedByMe = true
    }
    

  }
  catch (error) {
    return res.status(500).json({ "message": "Server error." });
  }
  res.post = post
  next()
}
module.exports = router;