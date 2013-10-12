###
Maarten: hey bert, wazzup?
Bert: ...
###
config = require('./config.js').config
express = require 'express'
http = require 'http'
fs = require 'fs'
path = require 'path'
eco = require 'eco'
log4js = require('log4js')
log4js.replaceConsole()

socket = null
timeline = null

server = express()
http_server = http.createServer server
io = require('socket.io').listen http_server

io.enable 'browser client minification'         # send minified client
io.enable 'browser client etag'                 # apply etag caching logic based on version number
io.enable 'browser client gzip'                 # gzip the file
io.set 'log level', config.log_level
io.set 'transports', config.transports

server.configure ->
    server.use '/static', express.static path.join(__dirname, '/static')
    server.use express.bodyParser()
    server.use (req, res, next) ->
        res.header 'Access-Control-Allow-Origin', config.allowedDomains
        res.header 'Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE'
        res.header 'Access-Control-Allow-Headers', 'Content-Type'
        next()

server.get '/', (req, res) ->
    template = fs.readFileSync path.join(__dirname + "/index.eco.html"), "utf-8"
    context = {}
    res.send eco.render template, context

server.get '/demo', (req, res) ->
    template = fs.readFileSync path.join(__dirname + "/demo.eco.html"), "utf-8"
    context = {}
    res.send eco.render template, context


createTimeline = ->
    program_info = JSON.parse fs.readFileSync path.join(__dirname + "/static/program_info.json"), "utf-8"
    timeline = []

    console.log "createTimeline"

    for question in program_info.questions
        soon_point = {
            type: "question:soon"
            time: Math.max 0, question.start - 2
            buttons: []
            passed:false
        }

        start_point = {
            type: "question:start"
            time: question.start
            buttons: question.buttons
            passed: false
            countdown: question.end - question.start
        }

        end_point = {
            type: "question:end"
            time: question.end
            buttons: []
            passed:false
        }

        timeline.push soon_point
        timeline.push start_point
        timeline.push end_point

    console.log timeline

createTimeline()


io.sockets.on 'connection', (socket) =>
    console.log 'hallo'

###
io.sockets.on('connection', function(socket) {

    function log(eventStr) {
        console.log("Event: " + eventStr + " from " + users[socket.id] + " (" + socket.id + ")")
    }
    log("connection");
###


console.log "http server running on port " + config.server_port
http_server.listen config.server_port
