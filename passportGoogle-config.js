const User = require('./models/user.model')
const GoogleStrategy = require('passport-google-oidc').Strategy

function initializePassportGoogle (passport) {

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:3001/users/auth/google/callback'
        },
        async function (issuer, profile, done) {

            const googleUserData = {
                name: profile.displayName,
                email: profile.emails[0].value
            }

            // Check if user is already registered
            const foundUser = await User.findOne({email: googleUserData.email})
            // If already registered, return registered user.
            if (foundUser) return done(null, foundUser)
            // Else, create new user and return its info.
            else {
                const user = new User({
                    name: googleUserData.name,
                    email: googleUserData.email,
                })
              
                user.save().then( done(null, user) )
            }

        }
    ))

}

module.exports = initializePassportGoogle 