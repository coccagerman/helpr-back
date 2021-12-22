const mongoose = require('mongoose')

const jobRecordSchema = new mongoose.Schema({
    publisherId: {
        type: String,
        required: true
    },
    publisher: {
        type: Object,
        required: true
    },
    publishedDate: {
        type: Date,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    classification: {
        type: String,
        required: true
    },
    hourDedication: {
        type: String,
        required: true
    },
    projectDuration: {
        type: String,
        required: true
    },
    detail: {
        type: String,
        required: true
    },
    requisites: {
        type: String,
        required: true
    },
    candidates: {
        type: Array,
        required: true,
        default: []
    }
})

module.exports = mongoose.model('JobRecord', jobRecordSchema)