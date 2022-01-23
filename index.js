const express = require('express')
const app = express()
const initRoutes = require('./routes')
const queue = require('./queue/Queue')
app.use(require('body-parser').json({limit:'10mb'}))
initRoutes(app)

app.listen(8000,() => console.log('8000'))
 