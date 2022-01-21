const EventEmitter = require('events')
const {Worker,isMainThread} = require('worker_threads')
const {v4} = require('uuid')

class Queue extends EventEmitter {

    constructor(queueSize=Infinity,interval=2000) {
        super();
        this.events = {}
        this.jobs = []
        this._interval = interval
        this.queueSize = queueSize
        this.registeredJobs = {}
        this.current = null
        this.started = false
        this.on('enqueue',(data) => { 
            const cb = this.registeredJobs[data.type]
            this.enqueue(v4(),data,cb) 
            // console.log(this.length(),"JOBS")
            // console.log(this.length(),"QUEUE SIZE")
        })  
        
    }

    static ENQUEUED = "ENQUEUED"
    static DEQUEUED = "DEQUEUED"
    static COMPLETED = "COMPLETED"
    static ERROR = "ERROR"
    static SCHEDULED = "SCHEDULED"
    static TIME_EXCEEDED = "TIME_EXCEEDED"
    static PROCESSING = "PROCESSING"



    schedule() {
        this.worker =   new Worker(`
            const q = require('./Queue')
            async function start() {                      
                 await q.run()
            }
            
            start()
            
        `,{
            eval:true
        }) 
    }

    registerJobExec(type,cb) {
        this.registeredJobs[type] = cb
    }

    newJob(job,data,cb) {
        return {
            job,
            data,
            executable:cb,
            enqueued:new Date(),
            dequeued:null,
            scheduled:null,
            status:Queue.ENQUEUED
        }
    }

    enqueue(job,data,cb) {
        if(this.queueSize > this.length()) {
            this.jobs.push(this.newJob(job,data,cb))
        }
    }

    dequeue() {
        if(!this.isEmpty()) {
            return this.jobs.splice(0,1)
        } else {
            return null
        }
    }

    length() {
        return this.jobs.length
    }


    addEvent(eventName,cb) {
        if(eventName === "enqueue") throw {type:'RESERVED_EVENT',error:`Event 'enqueue' is reserved`}
        if(this.events[eventName]) throw {type:'LISTENER_EXISTS',error:`Listener ${eventName} already exists`}
        this.addListener(eventName,cb)
    }
    
    removeEvent(eventName) {
        if(eventName === "enqueue") throw {type:'RESERVED_EVENT',error:`Event 'enqueue' is reserved`}
        if(!this.events[eventName]) throw {type:'LISTENER_NOT_REGISTERED',error:`Listener ${eventName} is not registered`}
        this.removeListener(eventName,this.events[eventName])
    }

    clearEvent(eventName) {
        if(eventName === "enqueue") throw {type:'RESERVED_EVENT',error:`Event 'enqueue' is reserved`}
        this.removeAllListeners(eventName)
    }

    listen(eventName) {
        if(!this.events[eventName]) throw {type:'LISTENER_NOT_REGISTERED',error:`Listener ${eventName} is not registered`}   
        this.on(eventName,this.events[eventName])
    }

    
    sleep(ms) {
        return new Promise(resolve => { 
            let x = setTimeout(() => {
                resolve(true)
                console.log("AWAKE")
                clearTimeout(x)
            },ms)})
    }

    isEmpty() {
        return this.jobs.length === 0
    }

    async run() {
         
        if(isMainThread) throw {type:'MAIN_THREAD_QUEUE_EXCEPTION',error:'Cannot run processing on main thread'}
        else if(!this.started) {
            this.started = true
            while(true) {
                if(this.isEmpty()) {
                    let resolved = await this.sleep(this._interval)  
                            
                }
                else {
                    const dequeued = this.dequeue()
                    console.log(dequeued,DEQUEUED)
                }
            }
        }

    }

 

}
const queue = new Queue()

 
 

module.exports = queue