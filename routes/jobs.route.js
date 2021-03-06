const express = require('express')
const router = express.Router()

const authenticateToken = require('../js/authenticateToken')

const JobRecord = require('../models/jobRecord.model')
const User = require('../models/user.model')

/* ------- Nodemailer ------- */
const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
      user: 'allie.christiansen91@ethereal.email',
      pass: '2RNQkQc8Ba2Dm7Tsxe'
  }
})


/* ------- Routes ------- */

/* Get active jobs filtered by params */
router.put('/searchJobsWithParams', authenticateToken, getVolunteerUsersFilteredByParams, async (req, res) => {

  try {
    /* Results pagination */
    const page = parseInt(req.body.page)
    const recordsPerPage = parseInt(req.body.recordsPerPage)

    const startIndex = (page-1)*recordsPerPage
    const endIndex = page*recordsPerPage

    const results = {}

    results.results = req.searchResults.slice(startIndex, endIndex)
    results.totalPages = Math.ceil(req.searchResults.length/recordsPerPage)
    results.totalResults = req.searchResults.length
    /* if (endIndex < req.searchResults.length) results.next = { page: page+1, recordsPerPage: recordsPerPage }
    if (startIndex > 0) results.previous = { page: page-1, recordsPerPage: recordsPerPage } */
    
    res.status(200).json(results)
  } catch (err) {
    res.status(500).json(err)
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
      state: 'Pendiente de revisi??n',
      applicationDate: new Date(),
      name: user.name,
      title: user.title
    }

    let previousApplicationsCheck = 0

    job.candidates.forEach(candidate => {
      if (candidate.id === newCandidate.id) {
        previousApplicationsCheck++
        return
      }
    })

    if (previousApplicationsCheck > 0) res.status(300).json('Candidate already applied')
    else if (!job.isJobActive) res.status(300).json('Inactive job')

    else {
      job.candidates.push(newCandidate)
      user.appliedJobs.push(job._id)

      const succesfulApplicationEmail = {
        from: 'Helpr',
        to: user.email,
        subject: 'Helpr - Te postulaste exitosamente a una oportunidad de voluntariado',
        html: '<p>Felictaciones, te postulaste exitosamente a una oportunidad de voluntariado. En caso de que la organizaci??n decida avanzar con tu postulaci??n, se contactar??n con vos directamente.<br>Helpr</p>'
      }
      
      const sendEmail = new Promise((resolve, reject) => {
        transporter.sendMail(succesfulApplicationEmail, (err, info) => {
          if (err) reject (err)
          resolve (info)
        })
      })

      job.save().then(
        user.save().then(
          sendEmail.then(
            res.status(200).json('Application successful')
          )
        )
      )
    }

  } catch (err) {
    res.status(500).json(err)
    console.error(err)
  }
})

/* Reject or reconsider candidate */
router.put('/rejectOrReconsiderCandidate', authenticateToken, async (req, res) => {
  try {

    if(!req.body.jobRecordId || !req.body.candidateId || !req.body.queryType) res.status(400).json('Argument missing')
    
    const jobRecord = await JobRecord.findOne({_id: req.body.jobRecordId})

    if (jobRecord.publisherId === req.user.user.id) {
      jobRecord.candidates.forEach(candidate => {
        if (candidate.id === req.body.candidateId) {
          if (req.body.queryType === 'reconsider') candidate.state = 'Pendiente de revisi??n'
          else if (req.body.queryType === 'reject') candidate.state = 'Rechazado'
          else res.status(400).json('Wrong query type')
          return
        }
      })

      JobRecord.findOneAndUpdate({_id: req.body.jobRecordId}, {$set: {candidates: jobRecord.candidates}}).then(res.status(200).json('Successful edition'))
    } else {
      res.status(403).json('Not allowed')
    }
  } catch (err) {
    res.status(500).json(err)
  }
})

/* Get active jobs filtered by params middleware */
async function getVolunteerUsersFilteredByParams (req, res, next) {

  try {
    /* Filter by general params and searchText */
    let publishedJobs
    const publishedFilteredJobs = []

    publishedJobs = await JobRecord.find(req.body.searchParams)

    if (req.body.searchPublisherInterestsParam && !req.body.searchPublishedDateParam) {
      /* Filter by publisher interests */
      publishedJobs.forEach(job => {
        if (job.publisher.interests && job.publisher.interests.indexOf(req.body.searchPublisherInterestsParam) !== -1) publishedFilteredJobs.push(job)
      })

      req.searchResults = publishedFilteredJobs.filter(job => job.isJobActive)
      next()
    }

    else if (!req.body.searchPublisherInterestsParam && req.body.searchPublishedDateParam) {
      /* Filter by published date */
      const limitDate = new Date()
      limitDate.setDate( limitDate.getDate() - parseInt(req.body.searchPublishedDateParam) );
      
      publishedJobs.forEach(job => { if (job.publishedDate > limitDate) publishedFilteredJobs.push(job) })
    
      req.searchResults = publishedFilteredJobs.filter(job => job.isJobActive)
      next()
    }
  
    else if (req.body.searchPublisherInterestsParam && req.body.searchPublishedDateParam) {
      /* Filter by publisher interests */
      publishedJobs.forEach(job => {
        if (job.publisher.interests && job.publisher.interests.indexOf(req.body.searchPublisherInterestsParam) !== -1) publishedFilteredJobs.push(job)
      })

      /* Filter by published date */
      const publishedDoublyFilteredJobs = []

      const limitDate = new Date()
      limitDate.setDate( limitDate.getDate() - parseInt(req.body.searchPublishedDateParam) );
      
      publishedFilteredJobs.forEach(job => { if (job.publishedDate > limitDate) publishedDoublyFilteredJobs.push(job) })

      req.searchResults = publishedDoublyFilteredJobs.filter(job => job.isJobActive)
      next()
    }
    else {
      req.searchResults = publishedJobs.filter(job => job.isJobActive)
      next()
    }
  } catch (err) {
    res.status(500).json(err)
  }
}

module.exports = router