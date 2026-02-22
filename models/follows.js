const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  followerId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  }
}, {timestamps: true})

followSchema.index({ userId: 1, postId: 1 }, { unique: true });

module.exports = mongoose.model('Follows', followSchema)