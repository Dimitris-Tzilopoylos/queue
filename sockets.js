const { Server } = require("socket.io");

const IO = (app) => {
    const io = new Server(app)
    io.on('connection',(socket) => {
        socket.on('disconnect',(reason) => {
            console.log(reason)
        })
    })

    return io
}

module.exports = IO