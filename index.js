const Queue = require('./Queue')
const express = require('express')
const app = express()



Queue.schedule() 
app.use(require('body-parser').json({limit:'10mb'}))
app.post('/',async (req,res,next) => {    
    const {type}  = req.body
    Queue.emit('enqueue',{type})
    return res.status(201).json({message:'Job enqueued',status:201})
})


app.listen(8000,() => console.log('8000'))