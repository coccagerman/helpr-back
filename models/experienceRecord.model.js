const mongoose = require('mongoose')

const experiencenRecordSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    company: {
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
    description: {
        type: String,
        required: false
    }
})

module.exports = mongoose.model('ExperiencenRecord', experiencenRecordSchema)