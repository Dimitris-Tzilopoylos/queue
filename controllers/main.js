const app = require('../app')
const queue = app.get('q')


exports.testQueue = async (req,res,next) => {
    let status = 200
    try {
        queue.emit('enqueue',{...req.body})
    } catch (error) {
        status = 422
    }  finally {
        return res.status(status).json({status})
    }
    
  
}

exports.dequeued = async (req,res,next) => {
    const dequeued = req.body 
    console.log(dequeued)
    return res.status(200).json({status:200})
}

exports.getInfo = async (req,res,next) => { 
    const size = queue.length()
    const status = queue.getStatus() 
    const job = queue.getJob()
    return res.status(200).json({size,status,job})
}