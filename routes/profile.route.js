const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')

const User = require('../models/user.model')

/* ------- Routes ------- */
/* Get all users */
router.get('/', authenticateToken, async (req, res) => {

  let userInfo = User.findOne({_id: req.user.user.id})
  res.send(userInfo)
})

/* Ejemplo petición get con parámetros de búsqueda con identificador */
router.get('/:id', (req, res) => {
  res.json({msg: 'Acá te envío el usuario con id === ' + req.params.id})
})

/* Ejemplo petición put */
router.put('/:id', (req, res) => {
  res.json({
      msg: 'Se ha modificado el usuario.',
      id: req.params.id,
      userData: req.body
  })
})

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