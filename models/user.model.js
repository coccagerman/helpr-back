const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: false
    },
    about: {
        type: String,
        required: false
    }
})

module.exports = mongoose.model('User', userSchema)