const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const passport = require('passport')
const jwt = require('jsonwebtoken')

const User = require('../models/user.model')
const initializePassport = require('../passport-config')
initializePassport(
  passport,
  email => User.findOne({email: email}),
  id => User.findOne({id: id})
  )

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

/* Get logged in user */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({_id: req.user.user.id})
    res.send(user)

  } catch (err) {
    res.status(500).send(err)
  }
})

/* Edit logged in user */
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const fieldToEdit = req.body.fieldToEdit
    const fieldData = req.body.fieldData

    switch (fieldToEdit) {
      case 'title':
        User.updateOne({_id: req.user.user.id}, {$set: {title: fieldData}}).then(res.json('Successful edition'))
        break;

      case 'about':
        User.updateOne({_id: req.user.user.id}, {$set: {about: fieldData}}).then(res.json('Successful edition'))
        break;

      default:
        res.json('Field not found')
        break;
    }

  } catch (err) {
    res.status(500).send(err)
  }
})

/* Get user by id */
router.get('user/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.find({_id: req.params.id})
    res.json(user)

  } catch (err) {
    res.status(500).send(err)
  }
})

/* Check if access token is valid */
router.get('/validateToken', (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token === null) return res.status(401).send(JSON.stringify('No access token provided'))

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).send(JSON.stringify('Wrong token provided'))
    return res.status(200).send(JSON.stringify('Valid token'))
  })
})

/* Create new user */
router.post('/register', async (req, res) => {

  // Check if the email isn't already taken
  const emailIsTaken = await User.findOne({email: req.body.email})
  if (emailIsTaken) return res.status(500).send(JSON.stringify('Email already used'))

  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)

    const user = new User({
      name: req.body.name,
      password: hashedPassword,
      email: req.body.email,
      accountType: req.body.accountType
    })

    user.save().then(
      res.status(200).send(JSON.stringify('Success - User created'))
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

/* Token validation middleware */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token === null) return res.status(401).send(JSON.stringify('No access token provided'))

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).send(JSON.stringify('Wrong token provided'))
    req.user = user
    next()
  })
}

module.exports = router