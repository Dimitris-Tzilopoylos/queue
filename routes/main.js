const router = require('express').Router()
const main = require('../controllers/main')
router.post('/',main.testQueue)
router.post('/info',main.getInfo)
router.post('/dequeue',main.dequeued)
module.exports = router 