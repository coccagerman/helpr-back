const User = require('./models/user.model')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initializePassport(passport) {

    const authenticateUser = async done => {

        /* Check if there's a user account created with that email */
        const userFound = await User.findOne({email: req.body.email})
        if (!userFound) return done(null, false, {message: 'Cannot find user with that email'})
        
        /* Validate password */
        try {
            const checkPassword = await bcrypt.compare(req.body.password, userFound.password)

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

    passport.serializeUser(done => { done(null, userFound.id) })
    passport.deserializeUser(done => { done(null, userFound) })
}

module.exports = initializePassport