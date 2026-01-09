const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  commentContent:{
    type: String,
    required: true
  },
  postId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  commentedDate:{
    type: Date,
    required: true,
    default: Date.now
  }
})

module.exports = mongoose.model('Comments', commentSchema)