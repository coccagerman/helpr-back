const mongoose = require('mongoose')
const path = require('path')

const profilePictureBasePath = 'uploads/profilePictures'

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
        required: false
    },
    accountType: {
        type: String,
        required: false
    },
    title: {
        type: String,
        required: false
    },
    profilePicture: {
        type: Buffer,
        required: false
    },
    profilePictureType: {
        type: String,
        required: false
    },
    about: {
        type: String,
        required: false
    },
    interests: {
        type: Array,
        default: [],
        required: false
    }
})

userSchema.virtual('profilePicturePath').get(function() {
    if (this.profilePicture && this.profilePictureType){
        return `data:${this.profilePictureType};charset=utf-8;base64,${this.profilePicture.toString('base64')}`
    }
})

module.exports = mongoose.model('User', userSchema)
module.exports.profilePictureBasePath = profilePictureBasePath