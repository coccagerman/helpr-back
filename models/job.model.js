const mongoose = require('mongoose')

const jobSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    publisher: {
        type: String,
        required: true
    },
    classification: {
        type: String,
        required: true
    },
    publishedDate: {
        type: Date,
        required: true
    },
    estimatedTime: {
        type: String,
        required: true
    },
    neededDedication: {
        type: String,
        required: true
    },
    requisites: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    candidates: {
        type: Array,
        required: false
    }
})

module.exports = mongoose.model('Job', jobSchema)