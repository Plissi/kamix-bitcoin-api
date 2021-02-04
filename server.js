var http = require('http');
var app = require('./app')

const hostname ='127.0.0.1'
const port = 3000;
app.set('port', port)

const server = http.createServer(app)

server.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
