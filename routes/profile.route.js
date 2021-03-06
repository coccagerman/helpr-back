const express = require('express')
const router = express.Router()

const authenticateToken = require('../js/authenticateToken')

const User = require('../models/user.model')
const EducationRecord = require('../models/educationRecord.model')
const ExperienceRecord = require('../models/experienceRecord.model')
const JobRecord = require('../models/jobRecord.model')

const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']

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
        if (req.body.queryType === 'add') {
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

          const recordToEdit = await EducationRecord.findOne({_id: fieldData.recordId})
          
          if (recordToEdit.userId === req.user.user.id) {
            EducationRecord.updateOne({_id: fieldData.recordId}, {$set: {
              institution: fieldData.institution,
              title: fieldData.title,
              beginDate: fieldData.beginDate,
              endDate: fieldData.endDate,
              classification: fieldData.classification,
              state: fieldData.state
            }}).then(res.status(200).json('Successful edition'))
          } else {
            res.status(403).json('Not allowed')
          }

        } else if (req.body.queryType === 'delete') {

          const recordToDelete = await EducationRecord.findOne({_id: fieldData.recordId})
          
          if (recordToDelete.userId === req.user.user.id) {
            EducationRecord.deleteOne({_id: fieldData.recordId}).then(res.status(200).json('Successful edition'))
          } else {
            res.status(403).json('Not allowed')
          }

        } else {
          res.status(400).json('queryType parameter missing')
        }
        break;

      case 'experience':
        if (req.body.queryType === 'add') {
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

          const recordToEdit = await ExperienceRecord.findOne({_id: fieldData.recordId})
          
          if (recordToEdit.userId === req.user.user.id) {
            ExperienceRecord.updateOne({_id: fieldData.recordId}, {$set: {
              position: fieldData.position,
              company: fieldData.company,
              beginDate: fieldData.beginDate,
              endDate: fieldData.endDate,
              description: fieldData.description
            }}).then(res.status(200).json('Successful edition'))
          } else {
            res.status(403).json('Not allowed')
          }

        } else if (req.body.queryType === 'delete') {
          const recordToDelete = await ExperienceRecord.findOne({_id: fieldData.recordId})
          
          if (recordToDelete.userId === req.user.user.id) {
            ExperienceRecord.deleteOne({_id: fieldData.recordId}).then(res.status(200).json('Successful edition'))
          } else {
            res.status(403).json('Not allowed')
          }
        } else {
          res.status(400).json('queryType parameter missing')
        }
        break;
      
      case 'jobs':
        if (req.body.queryType === 'add') {
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
            requisites: fieldData.requisites,
            isJobActive: true
          })

          const succesfulJobCreationEmail = {
            from: 'Helpr',
            to: publisher.email,
            subject: 'Helpr - Publicaste exitosamente a una oportunidad de voluntariado',
            html: '<p>Felictaciones, publicaste exitosamente a una oportunidad de voluntariado. Los candidatos interesados se postular??n directamente a tu vacante, reciuerda revisar las postulaciones peri??dicamente.<br>Helpr</p>'
          }
          
          const sendEmail = new Promise((resolve, reject) => {
            transporter.sendMail(succesfulJobCreationEmail, (err, info) => {
              if (err) reject (err)
              resolve (info)
            })
          })

          jobRecord.save().then(sendEmail.then(res.status(200).json('Successful edition')))

        } else if (req.body.queryType === 'edit') {
          
          const recordToEdit = await JobRecord.findOne({_id: fieldData.recordId})
          
          if (recordToEdit.publisherId === req.user.user.id) {
            JobRecord.updateOne({_id: fieldData.recordId}, {$set: {
              publishedDate: fieldData.publishedDate,
              position: fieldData.position,
              hourDedication: fieldData.hourDedication,
              projectDuration: fieldData.projectDuration,
              classification: fieldData.classification,
              detail: fieldData.detail,
              requisites: fieldData.requisites,
              isJobActive: fieldData.isJobActive
            }}).then(res.status(200).json('Successful edition'))
          } else {
            res.status(403).json('Not allowed')
          }

        } else if (req.body.queryType === 'delete') {

          const recordToDelete = await JobRecord.findOne({_id: fieldData.recordId})
          
          if (recordToDelete.publisherId === req.user.user.id) {
            JobRecord.deleteOne({_id: fieldData.recordId}).then(res.status(200).json('Successful edition'))
          } else {
            res.status(403).json('Not allowed')
          }
          
        } else {
          res.status(400).json('queryType parameter missing')
        }

        break;

      case 'interests':

        if (req.body.queryType === 'add') {
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
      profilePicturePath: user.profilePicturePath,
      experience: experienceRecords,
      education: educationRecords,
      publishedJobs: jobRecords
    }

    res.json(fullUserProfile)

  } catch (err) {
    res.status(500).json(err)
  }
})

/* Get user profile picture by id */
router.get('/profilePicture/user/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({_id: req.params.id})
    res.json(user.profilePicturePath)

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

module.exports = router