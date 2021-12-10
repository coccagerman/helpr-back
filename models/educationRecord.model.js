const mongoose = require('mongoose')

const educationRecordSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    institution: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    beginDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    clasification: {
        type: String,
        required: false
    },
    state: {
        type: String,
        required: false
    }
})

module.exports = mongoose.model('EducationRecord', educationRecordSchema)