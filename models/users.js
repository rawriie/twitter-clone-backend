const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({
  profilePic:{
    type: String,
    required: true,
  },
  displayName:{
    type: String,
    required: true,
    default: function () {
      return this.username;
  }},
  username:{
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true
  },
  password:{
    type: String,
    required: true
  }
}, {timestamps: true})

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPwd = async function (enteredPwd){
    return await bcrypt.compare(enteredPwd, this.password);
}

module.exports = mongoose.model('Users', userSchema);