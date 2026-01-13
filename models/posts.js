const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  postContent:{
    type: String,
    required: true
  },
  postDate:{
    type: Date,
    required: true,
    default: Date.now
  }
})

module.exports = mongoose.model('Posts', postSchema)