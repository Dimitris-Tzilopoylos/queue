const router = require('express').Router()
const main = require('../controllers/main')

router.post('/',main.testQueue)
router.post('/dequeued',main.dequeued)
module.exports = router 