/* Load environment variables on dev environment */
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').parse()
}

/* Import and initialize express */
const express = require('express')
const app = express()

/* Express configs */
app.use(express.json())
app.use(express.urlencoded({extended: true}))

/* DB connection */
const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to mongoose.'))

/* Initialize server */
const server = app.listen(process.env.PORT || 3000, () => console.log('Server is listening.') )
server.on('error', error => console.log(error) )

/* Routes */
const users = require('./routes/users.route')
app.use('/users', users)