const express = require('express');
const router = express.Router()
const Comments = require('../models/comments');
const { protect } = require('../middleware/users');

router.get('/', async (req, res) => {
  try {
    const comments = await Comments.find().populate('userId', 'username').sort({ createdAt: -1 })
    res.json(comments)
  }
  catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/:postid', async (req, res) => {
  try {
    const comments = await Comments.find({ postId: req.params.postid }).populate('userId', 'username').sort({ createdAt: -1 })
    res.json(comments)
  }
  catch (error) {
    res.status(500).json({ message: error.message })

  }
})


router.post('/:postId', protect, async (req, res) => {
  const comment = new Comments({
    userId: req.user._id,
    commentContent: req.body.commentContent,
    postId: req.params.postId

  })

  try {
    const newComment = await comment.save()
    res.status(201).json(newComment)
  }
  catch (err) {
    res.status(400).json({ message: err.message })
  }
})

router.patch('/:id', protect, getComment, async (req, res) => {
  console.log('BODY IS:', req.body)
  if (req.body.commentContent == null) {
    return res.status(400).json({
      message: "commentContent is required."
    })
  }

  res.comment.commentContent = req.body.commentContent

  try {
    if (req.user._id.equals(res.comment.userId._id)) {

      const updatedComment = await res.comment.save()
      return res.status(200).json({
        message: "Comment updated.",
        comment: updatedComment
      })
    }
    else {
      return res.status(401).json({ "message": "User not authorized." })
    }
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

router.delete('/:id', protect, getComment, async (req, res) => {
  try {
    if (req.user._id.equals(res.comment.userId._id)) {
      await res.comment.deleteOne()
      return res.status(200).json({ "message": "Deleted comment." })
    }
    else {
      return res.status(401).json({ "message": "User not authorized." })
    }
  } catch (err) {
    res.status(500).json({ "message": err.message })

  }
})

async function getComment(req, res, next) {
  let comment;
  try {
    comment = await Comments.findById(req.params.id).populate('userId', 'username')
    if (comment === null) {
      return res.status(404).json({ "message": "Comment not found." })
    }
  }
  catch (error) {
    res.status(500).json({ "message": "Server error." });
  }
  res.comment = comment
  next()
}
module.exports = router;