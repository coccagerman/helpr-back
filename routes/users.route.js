const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const User = require('../models/user.model')
const initializePassport = require('../passport-config')
initializePassport(passport)

const app = express()

app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

/* Middleware function to check if user is authenticated */
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

/* ------- Routes ------- */
/* Get all users */
router.get('/', async (req, res) => {

  try {
    const users = await User.find({})
    
    res.json({
      users: users
    })
  } catch (err) {
    res.status(500).send(err)
  }

})

/* Ejemplo petición get con parámetros de búsqueda con identificador */
router.get('/:id', (req, res) => {
  res.json({msg: 'Acá te envío el usuario con id === ' + req.params.id})
})

/* Create new user */
router.post('/register', checkNotAuthenticated, async (req, res) => {

  /* Check if the email isn't already taken */
  const emailIsTaken = await User.findOne({email: req.body.email})
  if (emailIsTaken) return res.status(500).send('Email already used')

  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)

    const user = new User({
      name: req.body.name,
      password: hashedPassword,
      email: req.body.email,
      title: req.body.title,
      about: req.body.about
    })

    user.save()

    res.send('Success - User created')

  } catch (err) {
    res.status(500).send(err)
  }

})

/* Login user */
/* router.post('/login', async (req, res) => {

  const userEmailExists = await User.findOne({email: req.body.email})
  if (!userEmailExists) return res.status(400).send('Cannot find user')

  const userFound = await User.findOne({email: req.body.email})

  try {
    const checkPassword = await bcrypt.compare(req.body.password, userFound.password)
    checkPassword ? res.send('Success - User loged in') : res.send('Incorrect password')

  } catch (err) {
    res.status(500).send(err)
  }

}) */
router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

/* Logout */
router.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})

/* Ejemplo petición put */
router.put('/:id', (req, res) => {
  res.json({
      msg: 'Se ha modificado el usuario.',
      id: req.params.id,
      userData: req.body
  })
})

module.exports = router