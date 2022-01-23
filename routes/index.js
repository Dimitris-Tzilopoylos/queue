const mainRoute = require('./main')
const {main} = require('../config/routes')




const initRoutes = (app) => {
    app.use(main,mainRoute)
}

module.exports = initRoutes