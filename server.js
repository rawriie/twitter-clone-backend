require('dotenv').config()

const express = require('express');
const app = express();
const cors = require('cors')
const mongoose = require('mongoose')
const PORT = 3000
mongoose.connect(process.env.DATABASE_URL)

const db = mongoose.connection;
db.on('error', (error) => {console.log(error)})
db.once('open', () => {console.log("Connected to database.")})


app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}))
app.use(express.json())
const commentRouter = require('./routes/comments')
const postRouter = require('./routes/posts')
const userRouter = require('./routes/users')
app.use('/users', userRouter)
app.use('/comments', commentRouter)
app.use('/posts', postRouter)

app.listen(PORT, () => {console.log("Server Started on \nhttp://localhost:" + PORT )})