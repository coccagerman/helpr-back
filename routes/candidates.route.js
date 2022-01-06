const express = require('express')
const router = express.Router()

const authenticateToken = require('../js/authenticateToken')

const User = require('../models/user.model')
const EducationRecord = require('../models/educationRecord.model')

const { MeiliSearch } = require('meilisearch')
const MeiliSearchClient = new MeiliSearch({ host: 'http://127.0.0.1:7700' })
const candidatesIndex = MeiliSearchClient.index('candidates')

/* ------- Set search engine index ------- */
const setMeiliSearchIndex = async () => {
  const volunteerUsers = await User.find({accountType: 'volunteer'})
  const volunteerDocuments = []

  volunteerUsers.forEach(volunteer => {
    const {id, name, title, about, interests} = volunteer
    volunteerDocuments.push({id, name, title, about, interests})
  })

  candidatesIndex.addDocuments(volunteerDocuments)
}
setMeiliSearchIndex()

/* ------- Routes ------- */

/* Get all volunteer users filtered by params */
router.put('/searchCandidatesWithParams', authenticateToken, getVolunteerUsersFilteredByParams, async (req, res) => {

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

/* Get volunteer users filtered by params  middleware */
async function getVolunteerUsersFilteredByParams (req, res, next) {
  try {
    /* Filter by searchText */
    let volunteerUsers

    if (req.body.searchTextSearchParam) {
      const textSearchResults = await MeiliSearchClient.index('candidates').search(req.body.searchTextSearchParam)
      volunteerUsers = textSearchResults.hits
    } else {
      volunteerUsers = await User.find({accountType: 'volunteer'})
    }

    /* No params provided */
    if (!req.body.searchParams) {
      req.searchResults = volunteerUsers
      next()
    }

    /* Filter only by interests */
    else if (req.body.searchParams.interests && !req.body.searchParams.educationClassification && !req.body.searchParams.educationState) {

      const volunteerUsersWithInterests = []

      volunteerUsers.forEach(user => {
        if (user.interests && user.interests.indexOf(req.body.searchParams.interests) !== -1) volunteerUsersWithInterests.push(user)
      })

      req.searchResults = volunteerUsersWithInterests
      next()
    }

    /* Filter only by education classification */
    else if (!req.body.searchParams.interests && req.body.searchParams.educationClassification && !req.body.searchParams.educationState) {

      const recordsWithEducationClassification = await EducationRecord.find({classification: req.body.searchParams.educationClassification})
      const recordsUserIds = []

      recordsWithEducationClassification.forEach(record => recordsUserIds.push(record.userId))

      const volunteerUsersWithEducationClassification = volunteerUsers.filter(user => recordsUserIds.indexOf(user.id) !== -1)

      req.searchResults = volunteerUsersWithEducationClassification
      next()
    }
  
    /* Filter only by education state */
    else if (!req.body.searchParams.interests && !req.body.searchParams.educationClassification && req.body.searchParams.educationState) {

      const recordsWithEducationState = await EducationRecord.find({state: req.body.searchParams.educationState})
      const recordsUserIds = []

      recordsWithEducationState.forEach(record => recordsUserIds.push(record.userId))

      const volunteerUsersWithEducationState = volunteerUsers.filter(user => recordsUserIds.indexOf(user.id) !== -1)

      req.searchResults = volunteerUsersWithEducationState
      next()
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

      req.searchResults = volunteerUsersWithInterestsAndEducationClassification
      next()
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

      req.searchResults = volunteerUsersWithInterestsAndEducationState
      next()
    }

    /* Filter by education state and classification */
    else if (!req.body.searchParams.interests && req.body.searchParams.educationClassification && req.body.searchParams.educationState) {

      const recordsWithEducationClassificationAndState = await EducationRecord.find({classification: req.body.searchParams.educationClassification, state: req.body.searchParams.educationState})
      const recordsUserIds = []

      recordsWithEducationClassificationAndState.forEach(record => recordsUserIds.push(record.userId))

      const volunteerUsersWithEducationClassificationAndState = volunteerUsers.filter(user => recordsUserIds.indexOf(user.id) !== -1)

      req.searchResults = volunteerUsersWithEducationClassificationAndState
      next()
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
      
      req.searchResults = volunteerUsersWithInterestsAndEducationClassificationAndState
      next()
    }
    
  } catch (err) {
    res.status(500).json(err)
  }
}

module.exports = router