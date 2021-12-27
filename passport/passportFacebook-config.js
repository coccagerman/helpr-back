const User = require('../models/user.model')
const FacebookStrategy = require('passport-facebook').Strategy

function initializePassportFacebook (passport) {

    passport.use(new FacebookStrategy({
            clientID: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            callbackURL: 'http://localhost:3001/users/auth/facebook/callback',
            profileFields: ['email', 'name']
        },
        async function (accessToken, refreshToken, profile, done) {

            const { email, first_name, last_name } = profile._json
            const facebookUserData = {
                name: `${first_name} ${last_name}`,
                email
            }

            // Check if user is already registered
            const foundUser = await User.findOne({email: facebookUserData.email})
            // If already registered, return registered user.
            if (foundUser) return done(null, foundUser)
            // Else, create new user and return its info.
            else {
                const user = new User({
                    name: facebookUserData.name,
                    email: facebookUserData.email,
                })
              
                user.save().then( done(null, user) )
            }

        }
    ))

}

module.exports = initializePassportFacebook 