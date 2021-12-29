const mongoose = require('mongoose')

const chatroomSchema = new mongoose.Schema({
    participants: {
        type: Array,
        required: true
    },
    messages : [{
        content : String,
        sentBy : String,
        date: Date
    }]
})

module.exports = mongoose.model('Chatroom', chatroomSchema)