const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const passport = require('passport')
const jwt = require('jsonwebtoken')

const User = require('../models/user.model')

const initializePassportLocal = require('../passportLocal-config')
initializePassportLocal(
  passport,
  email => User.findOne({email: email}),
  id => User.findOne({id: id})
)

const initializePassportFacebook = require('../passportFacebook-config')
initializePassportFacebook(passport)

const initializePassportTwitter = require('../passportTwitter-config')
initializePassportTwitter(passport)

const initializePassportGoogle = require('../passportGoogle-config')
initializePassportGoogle(passport)

/* ------- Routes ------- */
/* Get all users */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const users = await User.find({})
    res.json({ users: users })

  } catch (err) {
    res.status(500).send(err)
  }
})

/* Check if access token is valid */
router.get('/validateToken', (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token === null) return res.status(401).json('No access token provided')

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json('Wrong token provided')
    return res.status(200).json('Valid token')
  })
})

/* Create new user */
router.post('/register', async (req, res) => {

  // Check if the email isn't already taken
  const emailIsTaken = await User.findOne({email: req.body.email})
  if (emailIsTaken) return res.status(500).json('Email already used')

  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)

    const user = new User({
      name: req.body.name,
      password: hashedPassword,
      email: req.body.email,
      accountType: req.body.accountType
    })

    user.save().then(
      res.status(200).json('Success - User created')
    )

  } catch (err) {
    res.status(500).send(err)
  }

})

/* Login user */
router.post('/login',
  passport.authenticate('local'),
  async (req, res) => {

    const user = await User.findOne({email: req.body.email})
    const userToSign = {
      id: user._id,
      name: user.name,
      email: user.email
    }

    const token = jwt.sign({user: userToSign}, process.env.TOKEN_SECRET, {expiresIn: '24h'})
    res.status(200).json({accessToken: token})
  }
)

/* Facebook login */
router.get('/facebookAuth', passport.authenticate('facebook', { scope : ['email'] }))

/* Facebook login callback */
// User is redirected to this URL after approval and finishes the auth process by obtaining access token.
router.get('/auth/facebook/callback',
  passport.authenticate('facebook'),
  (req, res) => {

    const userToSign = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    }

    const token = jwt.sign({user: userToSign}, process.env.TOKEN_SECRET, {expiresIn: '24h'})
    res.status(200).redirect(`http://localhost:3000/?jwt=${token}`)
  }
)

/* Twitter login */
router.get('/twitterAuth', passport.authenticate('twitter'))

/* Twitter login callback */
// User is redirected to this URL after approval and finishes the auth process by obtaining access token.
router.get('/auth/twitter/callback',
  passport.authenticate('twitter'),
  (req, res) => {

    const userToSign = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    }

    const token = jwt.sign({user: userToSign}, process.env.TOKEN_SECRET, {expiresIn: '24h'})
    res.status(200).redirect(`http://localhost:3000/?jwt=${token}`)
  }
)

/* Google login */
router.get('/googleAuth', passport.authenticate('google', { scope: ['profile', 'email'] } ))

/* Google login callback */
// User is redirected to this URL after approval and finishes the auth process by obtaining access token.
router.get('/auth/google/callback',
  passport.authenticate('google'),
  (req, res) => {

    const userToSign = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    }

    const token = jwt.sign({user: userToSign}, process.env.TOKEN_SECRET, {expiresIn: '24h'})
    res.status(200).redirect(`http://localhost:3000/?jwt=${token}`)
  }
)

/* Token validation middleware */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token === null) return res.status(401).json('No access token provided')

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json('Wrong token provided')
    req.user = user
    next()
  })
}

module.exports = router