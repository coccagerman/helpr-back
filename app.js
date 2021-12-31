/* Load environment variables on dev environment */
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

/* Import and initialize express */
const express = require('express')
const app = express()

/* DB connection */
const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to mongoose.'))

/* CORS config */
const whitelist = ['http://localhost:3000', 'https://helpr-front.vercel.app']
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) callback(null, true)
    else callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}
/* Import modules */
const cors = require('cors')
const session = require('express-session')
const passport = require('passport')
const MongoDbStore = require('connect-mongo')

/* Global middlewares */
app.use(cors(corsOptions))
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

/* Initialize server */
const server = app.listen(process.env.PORT || 3001, () => console.log('Server is listening.') )
server.on('error', error => console.error(error) )