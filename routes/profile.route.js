const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')

const User = require('../models/user.model')
const EducationRecord = require('../models/educationRecord.model')
const ExperienceRecord = require('../models/experienceRecord.model')
const JobRecord = require('../models/jobRecord.model')

const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']

/* ------- Routes ------- */
/* Get logged in user info */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({_id: req.user.user.id})
    res.send(user)

  } catch (err) {
    res.status(500).json(err)
  }
})

/* Edit logged in user */
router.put('/', authenticateToken, async (req, res) => {
  try {
    const fieldToEdit = req.body.fieldToEdit
    const fieldData = req.body.fieldData

    switch (fieldToEdit) {
      case 'accountType':
        User.updateOne({_id: req.user.user.id}, {$set: {accountType: fieldData}}).then(res.status(200).json('Successful edition'))
        break;
    
      case 'title':
        User.updateOne({_id: req.user.user.id}, {$set: {title: fieldData}}).then(res.status(200).json('Successful edition'))
        break;

      case 'about':
        User.updateOne({_id: req.user.user.id}, {$set: {about: fieldData}}).then(res.status(200).json('Successful edition'))
        break;

      case 'education':
        if(req.body.queryType === 'add') {
          const educationRecord = new EducationRecord({
            userId: req.user.user.id,
            institution: fieldData.institution,
            title: fieldData.title,
            beginDate: fieldData.beginDate,
            endDate: fieldData.endDate,
            classification: fieldData.classification,
            state: fieldData.state
          })

          educationRecord.save().then(res.status(200).json('Successful edition'))

        } else if (req.body.queryType === 'edit') {

          EducationRecord.updateOne({_id: fieldData.recordId}, {$set: {
            institution: fieldData.institution,
            title: fieldData.title,
            beginDate: fieldData.beginDate,
            endDate: fieldData.endDate,
            classification: fieldData.classification,
            state: fieldData.state
          }}).then(res.status(200).json('Successful edition'))

        } else if (req.body.queryType === 'delete') {
          EducationRecord.deleteOne({_id: fieldData.recordId}).then(res.status(200).json('Successful edition'))
          
        } else {
          res.status(400).json('queryType parameter missing')
        }
        break;

      case 'experience':
        if(req.body.queryType === 'add') {
          const experienceRecord = new ExperienceRecord({
            userId: req.user.user.id,
            position: fieldData.position,
            company: fieldData.company,
            beginDate: fieldData.beginDate,
            endDate: fieldData.endDate,
            description: fieldData.description
          })

          experienceRecord.save().then(res.status(200).json('Successful edition'))

        } else if (req.body.queryType === 'edit') {

          ExperienceRecord.updateOne({_id: fieldData.recordId}, {$set: {
            position: fieldData.position,
            company: fieldData.company,
            beginDate: fieldData.beginDate,
            endDate: fieldData.endDate,
            description: fieldData.description
          }}).then(res.status(200).json('Successful edition'))

        } else if (req.body.queryType === 'delete') {
          ExperienceRecord.deleteOne({_id: fieldData.recordId}).then(res.status(200).json('Successful edition'))
          
        } else {
          res.status(400).json('queryType parameter missing')
        }
        break;
      
      case 'jobs':
        if(req.body.queryType === 'add') {
          const publisher = await User.findOne({_id: req.user.user.id})

          const jobRecord = new JobRecord({
            publisherId: req.user.user.id,
            publisher: publisher,
            publishedDate: fieldData.publishedDate,
            position: fieldData.position,
            hourDedication: fieldData.hourDedication,
            projectDuration: fieldData.projectDuration,
            classification: fieldData.classification,
            detail: fieldData.detail,
            requisites: fieldData.requisites
          })

          jobRecord.save().then(res.status(200).json('Successful edition'))

        } else if (req.body.queryType === 'edit') {

          JobRecord.updateOne({_id: fieldData.recordId}, {$set: {
            publishedDate: fieldData.publishedDate,
            position: fieldData.position,
            hourDedication: fieldData.hourDedication,
            projectDuration: fieldData.projectDuration,
            classification: fieldData.classification,
            detail: fieldData.detail,
            requisites: fieldData.requisites
          }}).then(res.status(200).json('Successful edition'))

        } else if (req.body.queryType === 'delete') {
          JobRecord.deleteOne({_id: fieldData.recordId}).then(res.status(200).json('Successful edition'))
          
        } else {
          res.status(400).json('queryType parameter missing')
        }

        break;

      case 'interests':

        if(req.body.queryType === 'add') {
          User.updateOne({_id: req.user.user.id}, {$push: {interests: fieldData}}).then(res.status(200).json('Successful edition'))

        } else if (req.body.queryType === 'delete') {

          const user = await User.findOne({_id: req.user.user.id})
          const previousInterests = user.interests
          const newInterests = previousInterests.filter(interest => interest !== fieldData)

          User.updateOne({_id: req.user.user.id}, {$set: {interests: newInterests}}).then(res.status(200).json('Successful edition'))
          
        } else {
          res.status(400).json('queryType parameter missing')
        }
        
        break;

      default:
        res.status(400).json('Field not found')
        break;
    }

  } catch (err) {
    res.status(500).json(err)
    console.error(err)
  }
})

/* Edit logged in user profile picture */
router.post('/profilePicture', authenticateToken, async (req, res) => {
  
  const user = await User.findOne({_id: req.user.user.id})

  try {

    if (!req.body.FileEncodeBase64String) return res.status(400).json('profilePictureEncoded not found')
    if (!imageMimeTypes.includes(req.body.fileType)) return res.status(400).json('Not allowed image type')
    if (req.body.fileSize > 2097152) return res.status(400).json('Image size too big')

    user.profilePicture = new Buffer.from(req.body.FileEncodeBase64String, 'base64')
    user.profilePictureType = req.body.fileType
    user.save().then(res.status(200).json('Successful edition'))

  } catch (err) {
    res.status(500).json(err)
    console.error(err)
  }
})

/* Get logged in user profile picture */
router.get('/profilePicture', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({_id: req.user.user.id})
    res.json(user.profilePicturePath)

  } catch (err) {
    res.status(500).json(err)
  }
})

/* Get logged in user education records */
router.get('/educationRecords', authenticateToken, async (req, res) => {
  try {
    const educationRecords = await EducationRecord.find({userId: req.user.user.id})
    res.send(educationRecords)

  } catch (err) {
    res.status(500).json(err)
  }
})

/* Get logged in user experience records */
router.get('/experienceRecords', authenticateToken, async (req, res) => {
  try {
    const experienceRecords = await ExperienceRecord.find({userId: req.user.user.id})
    res.send(experienceRecords)

  } catch (err) {
    res.status(500).json(err)
  }
})

/* Get jobs records published by logged in user*/
router.get('/jobRecords', authenticateToken, async (req, res) => {
  try {
    const jobRecords = await JobRecord.find({publisherId: req.user.user.id})
    res.send(jobRecords)

  } catch (err) {
    res.status(500).json(err)
  }
})

/* Get user info by id */
router.get('/user/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({_id: req.params.id})
    const experienceRecords = await ExperienceRecord.find({userId: req.params.id})
    const educationRecords = await EducationRecord.find({userId: req.params.id})
    const jobRecords = await JobRecord.find({publisherId: req.params.id})

    const fullUserProfile = {
      basic: user,
      experience: experienceRecords,
      education: educationRecords,
      publishedJobs: jobRecords
    }

    res.json(fullUserProfile)

  } catch (err) {
    res.status(500).json(err)
  }
})

/* Get user info by token */
router.get('/userGetByToken', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({_id: req.user.user.id})
    res.json(user)

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