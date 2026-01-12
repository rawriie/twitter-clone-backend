const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  username:{
    type: String,
    required: true
  },
  userId:{
    type: String,
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