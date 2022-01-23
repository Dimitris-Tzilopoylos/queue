const Queue = require('./Queue')


const initiQueue = (options={interval:2000,queueSize:100}) => {
    return new Queue(options.queueSize,options.interval)
     
}

const startQueue = (queue) => {
    queue.schedule(queue)
}





module.exports = {
    initiQueue,
    startQueue
} 