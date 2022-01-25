const app = require('../app')
const q = app.get('q')
exports.runForLoop = async ({data}) => {
    const axios = require('axios')
    for(let i=0;i<38921839120;i++) {

    }
    await axios.post(`http://localhost:8000/api/dequeue`,data)
    return data
}
q.registerJobExec('TEST',this.runForLoop)
