var http = require('http');
const { hostname } = require('os');
var app = require('./app')

const hotname ='127.0.0.1'
const port = process.env.PORT || 3000;
app.set('port', port)

const server = http.createServer(app)

server.listen(port, hostname, () => {
    console.log(`Server is running on port ${port}`)
})
