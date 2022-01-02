const express = require('express')
const router = express.Router()

const authenticateToken = require('../js/authenticateToken')

const Chatroom = require('../models/chatroom.model')

/* ------- Routes ------- */

/* Create new chat room */
router.post('/createChatroom', authenticateToken, async (req, res) => {
  try {
    /* Check if chatroom btw the two users already exist */
    const allChatRooms = await Chatroom.find({})

    let participantsCheck = 0
    let previousChatroom

    for (const chatRoom of allChatRooms) {
      if (chatRoom.participants.indexOf(req.body.participants[0]) !== -1) participantsCheck++
      if (chatRoom.participants.indexOf(req.body.participants[1]) !== -1) participantsCheck++
      
      if (participantsCheck === 2) {
        previousChatroom = chatRoom
        break
      } else participantsCheck = 0      
    }

    if (participantsCheck === 2) res.status(200).json({
        response: 'Chatroom already exists',
        chatroomId: previousChatroom.id
      })

    /* Create new chatroom */
    else {
      const chatroom = new Chatroom({ participants: req.body.participants })

      chatroom.save().then(res.status(200).json({
        response: 'Success - Chatroom created',
        chatroomId: chatroom.id
      }))
    }
  } catch (err) {
    res.status(500).send(err)
  }
})

/* Get all chat rooms in which a user participates */
router.get('/getAllChatroomsFromUser/:userId', authenticateToken, async (req, res) => {
  try {
    const userChatrooms = await Chatroom.find({ participants: req.params.userId })
    res.status(200).json(userChatrooms)

  } catch (err) {
    res.status(500).send(err)
  }
})

/* Get all messages from a chat room */
router.get('/getAllmessagesFromChatroom/:chatroomId', authenticateToken, async (req, res) => {

  try {
    const chatroom = await Chatroom.findOne({ _id: req.params.chatroomId })

    const { id, participants } = chatroom

    res.status(200).json({
      chatroomData: { id, participants },
      chatroomMessages: chatroom.messages
    })

  } catch (err) {
    res.status(500).send(err)
  }
})

/* Send new message to a chat room */
router.post('/sendNewMessage/:chatroomId', authenticateToken, async (req, res) => {
  try {
    const chatroom = await Chatroom.findOne({ _id: req.params.chatroomId })

    chatroom.messages.push(req.body.newMessage)
    
    chatroom.save().then(res.status(200).json('Success - Message sent'))

  } catch (err) {
    console.error(err)
    res.status(500).send(err)
  }
})

/* Get all chat rooms */
router.get('/getAllChatrooms', authenticateToken, async (req, res) => {
  try {
    const chatrooms = await Chatroom.find({})
    res.status(200).json(chatrooms)

  } catch (err) {
    res.status(500).send(err)
  }
})


module.exports = router