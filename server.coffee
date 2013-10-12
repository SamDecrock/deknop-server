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
clockTimerID = null
startTime = null

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


server.post '/api/start', (req, res) ->
    startTimeline()


startTimeline = ->
    clearInterval(clockTimerID)
    clockTimerID = setInterval clockTick, 40 # 25 frames/s

    startTime = +new Date()
    clockTick()


clockTick = ->
    time = (new Date() - startTime) / 1000
    #console.log "tick #{time}s"

    # check queue points in timeline
    for point in timeline
        if not point.passed and point.time < time
            onPoint(point)

onPoint = (point) ->
    switch point.type
        when "quiz:end"
            clearInterval(clockTimerID)
            console.log "The end"
        when "score:update"
            point.score = 0

    console.log "point " + point.time, point

    point.passed = true
    io.sockets.emit "point", point


createTimeline = ->
    program_info = JSON.parse fs.readFileSync path.join(__dirname + "/static/program_info.json"), "utf-8"
    timeline = []

    console.log "createTimeline"

    timeline.push {
        type: "tv:start"
        time: 0
        buttons: []
    }

    timeline.push {
        type: "quiz:start"
        time: program_info.start
        buttons: []
    }

    timeline.push {
        type: "quiz:end"
        time: program_info.end
        buttons: []
    }

    for question in program_info.questions
        timeline.push {
            type: "question:soon"
            time: Math.max 0, question.start - 2
            buttons: []
        }

        timeline.push {
            type: "question:start"
            time: question.start
            buttons: question.buttons
            countdown: question.end - question.start
        }

        timeline.push {
            type: "question:end"
            time: question.end
            buttons: []
        }

        timeline.push {
            type: "score:update"
            time: question.result
        }

    console.log timeline

createTimeline()
startTimeline()


io.sockets.on 'connection', (socket) =>
    console.log 'hallo'
    


console.log "http server running on port " + config.server_port
http_server.listen config.server_port
