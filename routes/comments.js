const express = require('express');
const router = express.Router()
const Comments = require('../models/comments');
router.get('/', async (req, res) => {
  try{
    const comments = await Comments.find()
    res.json(comments)
  }
  catch (err){
    res.status(500).json({message: err.message})
  }
})

router.get('/:id', getComment, (req, res) => {
  res.json(res.comment)
})



router.post('/', async (req, res) => {
  const comment = new Comments({
    userId: req.body.userId,
    commentContent: req.body.commentContent,
    postId: req.body.postId,
    
  })
  
  try{
    const newComment = await comment.save()
    res.status(201).json(newComment)
  }
  catch(err){
    res.status(400).json({message: err.message})
  }
})

router.patch('/:id', getComment, async (req, res) => {
  console.log('BODY IS:', req.body)
  if (req.body.commentContent == null) {
    return res.status(400).json({
      message: "commentContent is required."
    })
  }

  res.comment.commentContent = req.body.commentContent

  try {
    const updatedComment = await res.comment.save()
    res.status(200).json({
      message: "Comment updated.",
      comment: updatedComment
    })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

router.delete('/:id', getComment, async (req, res) => {
  try {
    await res.comment.deleteOne()
    res.status(200).json({"message": "Deleted comment."})
  } catch (err) {
    res.status(500).json({"message": err.message})
    
  }
})

async function getComment(req, res, next){
  let comment;
  try{
    comment = await Comments.findById(req.params.id)
    if(comment === null){
      return res.status(404).json({"message": "Comment not found."})
    }
  }
  catch(error){
    res.status(500).json({"message": "Server error."});
  }
  res.comment = comment
  next()
}
module.exports = router;