const axios = require('axios')
const run = async () => {
    for(let i=0;i<10000;i++)
    await axios.post('http://localhost:8000/',{
         type:'test'
    })
}
run()