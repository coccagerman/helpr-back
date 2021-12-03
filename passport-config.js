const User = require('./models/user.model')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserById) {

    const authenticateUser = async (email, password, done) => {

        const userFound = await getUserByEmail(email)

        /* Check if there's a user account created with that email */
        if (!userFound) return done(null, false, {message: 'Cannot find user with that email'})
        
        /* Validate password */
        try {
            const checkPassword = await bcrypt.compare(password, userFound.password)

            if (checkPassword) {
                return done(null, userFound)

            } else {
                return done(null, false, {message: 'Incorrect password'})
            }
            
        } catch (err) {
            return done(err)
        }
    }

    passport.use(new LocalStrategy( { usernameField: 'email' }, authenticateUser) )

    passport.serializeUser((user, done) => { done(null, user.id) })
    passport.deserializeUser((id, done) => { done(null, getUserById(id)) })
}

module.exports = initialize