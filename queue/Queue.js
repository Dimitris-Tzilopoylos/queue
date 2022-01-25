const EventEmitter = require('events')
const {Worker,isMainThread} = require('worker_threads')
const {v4} = require('uuid');
const { default: axios } = require('axios');

class Queue extends EventEmitter {

    constructor(queueSize=100,interval=2000,debug=true) {
        super();
        this.directory = require('path').join(__dirname,'Queue.js').split('\\').join('/')     
        this.id = v4()
        this.debug = debug
        this._awaitsForConnection = true
        this.events = {}
        this.processing = false
        this.jobs = []
        this._interval = interval
        this.queueSize = queueSize
        this.registeredJobs = {}
        this.current = null
        this.started = false
        this.on('enqueue',(data) => { 
            const cb = this.registeredJobs[data.type]
            if(!cb) throw {type:'UNKNOWN_EXECUTABLE',error:`No executable found for job type ${data.type}`}
            this.enqueue(v4(),data,cb) 
            this.debug ? console.log(this.length(),'QUEUE ADDED') : null
        })    
        this.currentJob = null
        this.run()
    }

    static ENQUEUED = "ENQUEUED"
    static DEQUEUED = "DEQUEUED"
    static COMPLETED = "COMPLETED"
    static ERROR = "ERROR"
    static SCHEDULED = "SCHEDULED"
    static TIME_EXCEEDED = "TIME_EXCEEDED"
    static PROCESSING = "PROCESSING"

    

    spawn() {     
          
        const worker = new Worker(`
            const {parentPort,workerData } = require('worker_threads')         
            async function exec(data) {
                ${this.debug ? console.log(`[${new Date().toLocaleString()}] EXECUTING JOB {${this.currentJob.job}}`) : null}
                data = JSON.parse(data)
                let executable =  eval(data.executable)  
                return await executable(data.data)
            }
            exec(workerData)
            .then((res) => {
                parentPort.postMessage(res)
            })
            .catch(error => {
                throw new Error(error)
            })
        `,{
            eval:true,
            workerData:JSON.stringify(this.currentJob)
        })
        worker.on('message',(data) => {
            this.processing = false  
        })
        worker.on('error',(err) => {
            this.debug ? console.log(err) : null
            this.processing = false 
        })
        worker.on('exit',(exitCode) => {
            console.log(`Job ${this.currentJob.job} finished with exitCode ${exitCode}`)
            this.processing = false 
            this.currentJob = null
            this.debug ? console.log(this.length(),'REMAINING JOBS') : null
        })
    }

    getCurrentJob() {
        return this.currentJob
    }

    getJob() {
        return this.getCurrentJob() ? {...this.currentJob,executable:null} : null
    }

    getStatus() {
        return this.processing ? 'PROCESSING' : 'READY'
    }

    registerJobExec(type,cb) {
        this.registeredJobs[type] = cb
    }

    newJob(job,data,cb) {
        return {
            job,
            data,
            executable:cb.toString(),
            enqueued:new Date(),
            dequeued:null,
            scheduled:null,
            status:Queue.ENQUEUED
        }
    }

    enqueue(job,data,cb) {
        if(this.queueSize <= this.length())  throw {type:'QUEUE_LIMIT_EXCEEDED',error:'Queue size is full at the moment'}
        this.jobs.push(this.newJob(job,data,cb))
      
    }

    dequeue() {
        if(!this.isEmpty()) {

            return this.jobs.splice(0,1)[0]
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
  
    sleep(ms,status='INACTIVE') {
        return new Promise(resolve => { 
            let x = setTimeout(() => {
                resolve(true)
                if(this._awaitsForConnection && this.debug) {
                    console.log(`[${new Date().toLocaleString()}] Queue Daemon (${this.id}) status: ${status}`)
                    this._awaitsForConnection = false
                }
                
                clearTimeout(x)
            },ms)})
    }

    isEmpty() {
        return this.jobs.length === 0
    }

    async run() { 
            if(this.started && isMainThread) throw {type:'MAIN_THREAD_QUEUE_EXCEPTION',error:'Queue already started'}
            this.started = true
            while(true) {
                if(this.isEmpty()) await this.sleep(this._interval)                            
                else if(this.processing)  await this.sleep(this._interval,'PROCESSING')        
                else {
                    this._awaitsForConnection = true
                    this.processing = true
                    this.currentJob = this.dequeue()
                    this.spawn()
                }
            }
    }


}
 

 
 
module.exports = (queueSize,interval,debug) =>  new Queue(queueSize,interval,debug)