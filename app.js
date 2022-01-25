const express = require('express')
const app = express()
const initQueue = require('./queue/Queue')
app.set('q',initQueue(process.env.QUEUE_SIZE,process.env.QUEUE_INTERVAL,process.env.NODE_ENV === "DEV"))
app.use(require('cors')())

module.exports = app