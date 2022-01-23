const queue = require('../queue/Queue')



exports.testQueue = async (req,res,next) => {
    const {type}  = req.body
    queue.emit('enqueue',{type})
    return res.status(200).json({status:200})
}

exports.dequeued = async (req,res,next) => {
    const dequeued = req.body 
    console.log(dequeued)
    return res.status(200).json({status:200})
}