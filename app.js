/* Load environment variables on dev environment */
if (process.env.NODE_ENV !== 'production') require('dotenv').config()

/* Import and initialize express */
const express = require('express')
const app = express()
const server = require('http').Server(app)

/* Websocket config */
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT']
  }
})

/* DB connection */
const mongoose = require('mongoose')

try {
  mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  const db = mongoose.connection
  db.on('error', error => console.error(error))
  db.once('open', () => console.log('Connected to mongoose.'))
  
} catch (err) {
  console.error(err)
}

/* Import modules */
const cors = require('cors')
const compression = require('compression')
const session = require('express-session')
const passport = require('passport')
const MongoDbStore = require('connect-mongo')

/* Global middlewares */
app.use(cors())
app.use(compression())
app.use(express.json({limit: '50mb'}))
app.use(express.urlencoded({extended: false}))
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoDbStore.create({
    mongoUrl: process.env.DATABASE_URL,
    collection: 'sessions'
  }),
  cookie: {
    maxAge: 1000*60*60*24
  }
}))

require('./passport/passportLocal-config')
app.use(passport.initialize())
app.use(passport.session())

/* Routes */
const users = require('./routes/users.route')
app.use('/users', users)

const profile = require('./routes/profile.route')
app.use('/profile', profile)

const jobs = require('./routes/jobs.route')
app.use('/jobs', jobs)

const candidates = require('./routes/candidates.route')
app.use('/candidates', candidates)

const chat = require('./routes/chat.route')
app.use('/chat', chat)

/* Models */
const Chatroom = require('./models/chatroom.model')

/* Chat websocket */
io.on('connection', socket => {

  socket.on('new-message', async data => {
    try {
      const chatroom = await Chatroom.findOne({ _id: data.chatroomId })

      const {content, sentBy, date, chatroomId} = data

      chatroom.messages.push({content, sentBy, date})
      
      chatroom.save().then(io.sockets.emit('messages', {chatroomId, messages: chatroom.messages}))

    } catch (err) {
      console.error(err)
      io.sockets.emit('error', err)
    }    
  })

})

/* Initialize server */
server.listen(process.env.PORT || 3001, () => console.log('Server is listening.') )
server.on('error', error => console.error(error) )