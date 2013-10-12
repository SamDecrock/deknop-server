config = require('./config.js').config
express = require 'express'
fs = require 'fs'
path = require 'path'
eco = require 'eco'
io = require('socket.io').listen config.sockets_port
log4js = require('log4js')
log4js.replaceConsole()

socket = null

io.enable 'browser client minification'         # send minified client
io.enable 'browser client etag'                 # apply etag caching logic based on version number
io.enable 'browser client gzip'                 # gzip the file
io.set 'log level', config.log_level
io.set 'transports', config.transports

server = express()

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


getStatus = (author=null)->
    previousStatus = status

    count = hungryCount()
    status = 'waiting'
    countdown = countdownValue

    if count >= config.leaveat
        status = 'leaving'

        unless countdownStart?
            countdownStart = new Date()
            clearInterval countdownIntervalID

            countdownIntervalID = setInterval onCountdownUpdate, 1000

        if countdown <= 0
            status = 'departed'

            unless previousStatus is 'departed'
                console.log "START RESET TIMER -> call reset in " + config.resetAllDelay + "s"
                clearTimeout resetTimeoutID
                resetTimeoutID = setTimeout reset, config.resetAllDelay*1000

    current =
        status: status
        count: count
        countdown: countdown

    if author
        current.author = author
        current.hungry = isHungry(author)

    # state changes are caught here
    unless previousStatus is status
        console.log "status: ", previousStatus, '->', status

        if status is 'leaving' and previousStatus is 'waiting'
            hipchat.leaving()

        if status is 'departed' and previousStatus is 'leaving'
            hipchat.departed()

    return current

update = ->
    statusObject = getStatus()
    console.log "update", statusObject

    io.sockets.emit 'update', statusObject

reset = ->
    console.log "RESET"
    users = {}
    socket = null
    clearTimeout resetTimeoutID
    clearInterval countdownIntervalID
    countdownStart = null
    countdownIntervalID = null
    countdownValue = config.countdown

    update()

onCountdownUpdate = ->
    diff = +new Date() - countdownStart.getTime()
    countdown = config.countdown - Math.round(diff/1000)

    countdownValue = countdown

    if countdown <= 0
        clearInterval countdownIntervalID
        console.log "finished!"

    update()

console.log "http server running on port " + config.server_port
console.log "sockets server running on port " + config.sockets_port
server.listen config.server_port
