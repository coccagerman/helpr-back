const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const passport = require('passport')

const User = require('../models/user.model')
const initializePassport = require('../passport-config')
initializePassport(
  passport,
  email => User.findOne({email: email}),
  id => User.findOne({id: id})
  )

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

    user.save().then(res.send('Success - User created'))

  } catch (err) {
    res.status(500).send(err)
  }

})

/* Login user */
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

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

module.exports = router