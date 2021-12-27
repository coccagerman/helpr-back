const express = require('express')
const router = express.Router()

const User = require('../models/user.model')
const EducationRecord = require('../models/educationRecord.model')

const authenticateToken = require('../js/authenticateToken')

/* ------- Routes ------- */
/* Get all volunteer users */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const volunteerUsers = await User.find({accountType: 'volunteer'})

    res.status(200).send(volunteerUsers)

  } catch (err) {
    res.status(500).json(err)
  }
})

/* Get all volunteer users filtered by params */
router.put('/searchCandidatesWithParams', authenticateToken, async (req, res) => {
  
  try {
    /* Get all volunteer profiles */
    const volunteerUsers = await User.find({accountType: 'volunteer'})
    /* No params provided */
    if (!req.body.searchParams) res.status(200).send(volunteerUsers)

    /* Filter only by interests */
    else if (req.body.searchParams.interests && !req.body.searchParams.educationClassification && !req.body.searchParams.educationState) {

      const volunteerUsersWithInterests = []

      volunteerUsers.forEach(user => {
        if (user.interests && user.interests.indexOf(req.body.searchParams.interests) !== -1) volunteerUsersWithInterests.push(user)
      })
      res.status(200).send(volunteerUsersWithInterests)
    }

    /* Filter only by education classification */
    else if (!req.body.searchParams.interests && req.body.searchParams.educationClassification && !req.body.searchParams.educationState) {

      const recordsWithEducationClassification = await EducationRecord.find({classification: req.body.searchParams.educationClassification})
      const recordsUserIds = []

      recordsWithEducationClassification.forEach(record => recordsUserIds.push(record.userId))

      const volunteerUsersWithEducationClassification = volunteerUsers.filter(user => recordsUserIds.indexOf(user.id) !== -1)

      res.status(200).send(volunteerUsersWithEducationClassification)
    }
  
    /* Filter only by education state */
    else if (!req.body.searchParams.interests && !req.body.searchParams.educationClassification && req.body.searchParams.educationState) {

      const recordsWithEducationState = await EducationRecord.find({state: req.body.searchParams.educationState})
      const recordsUserIds = []

      recordsWithEducationState.forEach(record => recordsUserIds.push(record.userId))

      const volunteerUsersWithEducationState = volunteerUsers.filter(user => recordsUserIds.indexOf(user.id) !== -1)

      res.status(200).send(volunteerUsersWithEducationState)
    }

    /* Filter by interests and education classification */
    else if (req.body.searchParams.interests && req.body.searchParams.educationClassification && !req.body.searchParams.educationState) {

      /* Filter by interests */
      const volunteerUsersWithInterests = []

      volunteerUsers.forEach(user => {
        if (user.interests && user.interests.indexOf(req.body.searchParams.interests) !== -1) volunteerUsersWithInterests.push(user)
      })

      /* Filter by education */
      const recordsWithEducationClassification = await EducationRecord.find({classification: req.body.searchParams.educationClassification})
      const recordsUserIds = []

      recordsWithEducationClassification.forEach(record => recordsUserIds.push(record.userId))

      const volunteerUsersWithInterestsAndEducationClassification = volunteerUsersWithInterests.filter(user => recordsUserIds.indexOf(user.id) !== -1)

      res.status(200).send(volunteerUsersWithInterestsAndEducationClassification)
    }

    /* Filter by interests and education state */
    else if (req.body.searchParams.interests && !req.body.searchParams.educationClassification && req.body.searchParams.educationState) {

      /* Filter by interests */
      const volunteerUsersWithInterests = []

      volunteerUsers.forEach(user => {
        if (user.interests && user.interests.indexOf(req.body.searchParams.interests) !== -1) volunteerUsersWithInterests.push(user)
      })

      /* Filter by education */
      const recordsWithEducationState = await EducationRecord.find({state: req.body.searchParams.educationState})
      const recordsUserIds = []

      recordsWithEducationState.forEach(record => recordsUserIds.push(record.userId))

      const volunteerUsersWithInterestsAndEducationState = volunteerUsersWithInterests.filter(user => recordsUserIds.indexOf(user.id) !== -1)      

      res.status(200).send(volunteerUsersWithInterestsAndEducationState)
    }

    /* Filter by education state and classification */
    else if (!req.body.searchParams.interests && req.body.searchParams.educationClassification && req.body.searchParams.educationState) {

      const recordsWithEducationClassificationAndState = await EducationRecord.find({classification: req.body.searchParams.educationClassification, state: req.body.searchParams.educationState})
      const recordsUserIds = []

      recordsWithEducationClassificationAndState.forEach(record => recordsUserIds.push(record.userId))

      const volunteerUsersWithEducationClassificationAndState = volunteerUsers.filter(user => recordsUserIds.indexOf(user.id) !== -1)

      res.status(200).send(volunteerUsersWithEducationClassificationAndState)
    }
    /* Filter by interests, education state and classification */
    else {
      /* Filter by interests */
      const volunteerUsersWithInterests = []

      volunteerUsers.forEach(user => {
        if (user.interests && user.interests.indexOf(req.body.searchParams.interests) !== -1) volunteerUsersWithInterests.push(user)
      })

      /* Filter by education */
      const recordsWithEducationStateAndClassification = await EducationRecord.find({classification: req.body.searchParams.educationClassification, state: req.body.searchParams.educationState})
      const recordsUserIds = []

      recordsWithEducationStateAndClassification.forEach(record => recordsUserIds.push(record.userId))

      const volunteerUsersWithInterestsAndEducationClassificationAndState = volunteerUsersWithInterests.filter(user => recordsUserIds.indexOf(user.id) !== -1)      
      
      res.status(200).send(volunteerUsersWithInterestsAndEducationClassificationAndState)
    }
    
  } catch (err) {
    res.status(500).json(err)
  }
})

module.exports = router