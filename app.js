/**
 * Created by Administrator on 2017/4/19.
 */
const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const multer = require('multer')

const index = require('./routes/index')
const config = require('./config/db')
const commodity = require('./models/commodity')

mongoose.connect(config.mongodb)
mongoose.Promise = global.Promise

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())
app.use(session({
  secret: 'graduation',
  name: 'user',
  cookie: {maxAge: 600000}
}))
app.use('/api', index)

app.listen(3000, () => {
  console.log('listening on port 3000')
})

module.exports = app
