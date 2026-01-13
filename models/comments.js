const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  commentContent:{
    type: String,
    required: true
  },
  postId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Posts',
    required: true
  },
  commentedDate:{
    type: Date,
    required: true,
    default: Date.now
  }
})

module.exports = mongoose.model('Comments', commentSchema)