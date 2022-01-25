const mainRoute = require('./main')
const authRoute = require('./auth')
const {main,auth} = require('../config/routes')




const initRoutes = (app) => {
    app.use(main,mainRoute)
    app.use(auth,authRoute)
}

module.exports = initRoutes