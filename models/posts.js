const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  content:{
    type: String,
    required: true
  },
  parentId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Posts',
  },
  likes:{
    type: Number,
    required: true,
    default: 0
  }
}, {timestamps: true})

module.exports = mongoose.model('Posts', postSchema)