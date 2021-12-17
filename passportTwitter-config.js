const User = require('./models/user.model')
const TwitterStrategy = require('passport-twitter').Strategy

function initializePassportTwitter (passport) {

    passport.use(new TwitterStrategy({
            consumerKey: 'Ul4j7coQ2YO3ZFRk8Jb3fGzTa',
            consumerSecret: 'Ig4kEJodZOGittQ1upbppI4oKXIa0ccDTc42xOsXI1j4aMjQ9F',
            callbackURL: 'http://localhost:3001/users/auth/twitter/callback',
            includeEmail: true
        },
        async function (accessToken, refreshToken, profile, done) {

            const twitterUserData = {
                name: profile._json.name,
                email: profile.emails[0].value
            }

            // Check if user is already registered
            const foundUser = await User.findOne({email: twitterUserData.email})
            // If already registered, return registered user.
            if (foundUser) return done(null, foundUser)
            // Else, create new user and return its info.
            else {
                const user = new User({
                    name: twitterUserData.name,
                    email: twitterUserData.email,
                })
              
                user.save().then( done(null, user) )
            }

        }
    ))

}

module.exports = initializePassportTwitter 