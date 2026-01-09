const Users = require('../models/users');
const jwt = require('jsonwebtoken');

async function protect(req, res, next){
  let token;
  if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
    token = req.headers.authorization.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    req.user = await Users.findById(decoded.id).select("-password")
  }
  
}