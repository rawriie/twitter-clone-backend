const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({
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

userSchema.pre('save', async (next) => {
  if(!this.isModified('password')){
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
  
})
userSchema.methods.matchPwd = async function (enteredPwd){
    return await bcrypt.compare(enteredPwd, this.password);
}

module.exports = mongoose.model('Users', userSchema);