const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  postId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Posts',
    required: true
  }
}, {timestamps: true})

likeSchema.index({ userId: 1, postId: 1 }, { unique: true });

module.exports = mongoose.model('Likes', likeSchema)