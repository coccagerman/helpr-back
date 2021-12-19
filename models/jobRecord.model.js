const mongoose = require('mongoose')

const jobRecordSchema = new mongoose.Schema({
    position: {
        type: String,
        required: true
    },
    publisherId: {
        type: String,
        required: true
    },
    publisher: {
        type: Object,
        required: true
    },
    classification: {
        type: String,
        required: true
    },
    beginDate: {
        type: Date,
        required: true
    },
    endDate: {
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
    }
})

module.exports = mongoose.model('JobRecord', jobRecordSchema)