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
  }
}, {timestamps: true})

module.exports = mongoose.model('Posts', postSchema)