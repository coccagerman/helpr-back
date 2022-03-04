## HELPR
Helpr is a portal that connects NGOs with volunteers interested in colaborating with their causes. Full stack project built with react, node and express.

Helpr is my first full stack project. After spending weeks learning about node, express and mongoDb, I wanted to build something that grouped pretty much everything I've learned so far about web development, and I came up with this idea.

Helpr is a website that aims to connect NGOs with volunteers interested in colaborating with their causes. Think of it as a job portal but for volunteers. The idea ocurred to me because as a learning developer I would have loved to work as a volunteer for any company, just to get in touch with professionals and learn from them. But to my surprise, there are not many places where you can find this kind of opportunities. And It's the same for NGOs that look for volunteers. So why not build a portal where both parts can meet each other?

I built this as an educational project and the site isn't live now, but I'd like to ship it to production some time in the future.

Characteristics:
- Front end developed with React.
- State management with hooks and context API.
- Navigation with React router.
- Back end developed with Node and Express.
- Persistance using Mongo DB (Mongo atlas) and Mongoose.
- User authentication with Passport.js.
- User authorization with JWT.
- Chat implementation using websockets (Socket.io).

Main features:
- The user can register and login using email and password, or social networks accounts (Google, Facebook or Twitter).
- At registration the user has to select its account type: Volunteer or Organization.
- The user has a profile section where they can load their personal data and a profile picture.
- Volunteers can search for job opportunities based on different parameters such as type of project, publication date, hour dedication, project duration and the interests declared by the publisher.
- NGOs can search for volunteers based on different parameters such as the user's education classification and state, and the interests declared by them.
- Free text search is also enabled in both cases.
- Results are paginated according to the parameters selected by the user.
- Volunteers can apply to job publications.
- NGOs have a dashboard for each job publication they make, where they can see the candidates that have applied and reject the application or contact the candidate if they'd like.
- When NGOs decide to contact a candidate, a chatroom is enabled between both users.
