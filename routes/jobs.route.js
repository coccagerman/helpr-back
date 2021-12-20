const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')

const JobRecord = require('../models/jobRecord.model')

/* ------- Routes ------- */
/* Get all published jobs */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const publishedJobs = await JobRecord.find()
    res.send(publishedJobs)

  } catch (err) {
    res.status(500).json(err)
  }
})

/* Get job by id */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const job = await JobRecord.findOne({id: req.params.id})
    res.send(job)

  } catch (err) {
    res.status(500).json(err)
  }
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