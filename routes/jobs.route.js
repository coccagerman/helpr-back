const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')

const JobRecord = require('../models/jobRecord.model')
const User = require('../models/user.model')

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

/* Get jobs filtered by params */
router.put('/searchJobsWithParams', authenticateToken, async (req, res) => {
  
  try {
    if (req.body.searchPublisherInterestsParam && !req.body.searchPublishedDateParam) {
      /* Filter by general params */
      const publishedJobs = await JobRecord.find(req.body.searchParams)
      /* Filter by publisher interests */
      const publishedFilteredJobs = []

      publishedJobs.forEach(job => {
        if (job.publisher.interests && job.publisher.interests.indexOf(req.body.searchPublisherInterestsParam) !== -1) publishedFilteredJobs.push(job)
      })
      res.send(publishedFilteredJobs)
    }
    else if (!req.body.searchPublisherInterestsParam && req.body.searchPublishedDateParam) {

      /* Filter by general params */
      const publishedJobs = await JobRecord.find(req.body.searchParams)
      /* Filter by published date */
      const publishedFilteredJobs = []

      const limitDate = new Date()
      limitDate.setDate( limitDate.getDate() - parseInt(req.body.searchPublishedDateParam) );
      
      publishedJobs.forEach(job => { if (job.publishedDate > limitDate) publishedFilteredJobs.push(job) })
    
      res.send(publishedFilteredJobs)
    }
    else if (req.body.searchPublisherInterestsParam && req.body.searchPublishedDateParam) {
      /* Filter by general params */
      const publishedJobs = await JobRecord.find(req.body.searchParams)
      /* Filter by publisher interests */
      const publishedFilteredJobs = []

      publishedJobs.forEach(job => {
        if (job.publisher.interests && job.publisher.interests.indexOf(req.body.searchPublisherInterestsParam) !== -1) publishedFilteredJobs.push(job)
      })

      /* Filter by published date */
      const publishedDoublyFilteredJobs = []

      const limitDate = new Date()
      limitDate.setDate( limitDate.getDate() - parseInt(req.body.searchPublishedDateParam) );
      
      publishedFilteredJobs.forEach(job => { if (job.publishedDate > limitDate) publishedDoublyFilteredJobs.push(job) })

      res.send(publishedDoublyFilteredJobs)
    }
    else {
      const publishedJobs = await JobRecord.find(req.body.searchParams)
      res.send(publishedJobs)
    }
  } catch (err) {
    res.status(500).json(err)
    console.log(err)
  }
})

/* Get job by id */
router.get('/:jobRecordId', authenticateToken, async (req, res) => {
  try {
    const job = await JobRecord.findOne({_id: req.params.jobRecordId})
    res.status(200).send(job)

  } catch (err) {
    res.status(500).json(err)
  }
})

/* Job application */
router.post('/jobApplication/:jobRecordId', authenticateToken, async (req, res) => {
  try {
    const job = await JobRecord.findOne({_id: req.params.jobRecordId})
    const user = await User.findOne({_id: req.user.user.id})
    
    const newCandidate = {
      id: req.user.user.id,
      state: 'Pendiente de revisión',
      applicationDate: new Date(),
      name: user.name,
      title: user.title
    }

    let previousApplicationsCheck = 0

    job.candidates.forEach(candidate => {
      if (candidate._id === newCandidate.id) {
        previousApplicationsCheck++
        return
      }
    })

    if (previousApplicationsCheck > 0) res.status(300).json('Candidate already applied')
    else {
      job.candidates.push(newCandidate)
      user.appliedJobs.push(job._id)

      job.save().then(
        user.save().then(
          res.status(200).json('Application successful')
        )
      )
    }

  } catch (err) {
    res.status(500).json(err)
    console.log(err)
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