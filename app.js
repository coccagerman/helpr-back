const express = require('express')
const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

const server = app.listen(3000, () => console.log('Server is listening.') )
server.on('error', error => console.log(error) )

const users = require('./routes/users.route')
app.use('/users', users)