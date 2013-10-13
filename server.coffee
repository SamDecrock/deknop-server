###
Maarten: hey bert, wazzup?
Bert: dek nop
###
config = require('./config.js').config
express = require 'express'
http = require 'http'
fs = require 'fs'
path = require 'path'
eco = require 'eco'
_ = require 'underscore'
log4js = require('log4js')
log4js.replaceConsole()

program_info = JSON.parse fs.readFileSync path.join(__dirname + "/static/program_info.json"), "utf-8"
timeline = null
clockTimerID = null
startTime = null
users = {}

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
    console.log 'Starting the TV show'
    for username, user of users
        user.score = 0
        user.answered = {}
    console.log "reset scores", users
    
    createTimeline()
    startTimeline()
    res.send {'status': 'started'}


server.post '/api/answer', (req, res) ->
    username = req.body.username
    id = parseInt(req.body.id)
    answer = req.body.answer

    questions = program_info.questions
    question = _.find questions, (q) -> q.id is id
    user = users[username]

    unless user
        return res.send {'error': 'cannot find user #{username}'}

    unless question
        return res.send {'error': 'cannot find question #{id}'}

    unless _.isUndefined user.answered[id] 
        return res.send {'error': '#{username} already answered question #{id}'}

    correct = question.right_answer is answer
    user.answered[id] = correct

    console.log "#{username} answered #{answer} for question id:#{id}"

    res.send {
        'status': 'answered'
    }
    


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

    console.log "point " + point.time, point
    point.passed = true

    if point.type is "score:update"
        for username, user of users
            user = users[username]

            point.correct = user.answered[point.id] ? false

            if point.correct then user.score += 1
            point.score = user.score
            
            for type, socket_id of user.clients
                io.sockets.sockets[socket_id].emit "point", point
    else
        io.sockets.emit "point", point




createTimeline = ->
    timeline = []

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
            id: question.id
            countdown: 2
            buttons: []
        }

        timeline.push {
            type: "question:start"
            time: question.start
            id: question.id
            buttons: question.buttons
            countdown: question.end - question.start
        }

        timeline.push {
            type: "question:end"
            time: question.end
            id: question.id
            buttons: []
        }

        timeline.push {
            type: "score:update"
            time: question.result
            id: question.id
        }

io.sockets.on 'connection', (socket) =>
    socket.on 'register', (data) =>
        console.log 'register', data
        
        if not users[data.username]
            users[data.username] = {
                clients:{}
                score: 0
                answered: {}
            }

        users[data.username].clients[data.type] = socket.id
        
        console.log "users: %j", users


console.log "http server running on port " + config.server_port
http_server.listen config.server_port
