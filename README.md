De Knop (With fruit!)
======
This version of 'De Knop' uses a Makey Makey instead of the Raspberry Pi buttons so one can use fruit instead of buttons :-)

Original text
============
'De Knop' is a project made in one weekend for the [VRT Make-A-Thon](http://innovation.vrt.be/agenda/make-thon).

The goal for our installation was to bring a television show into your home. 
Forget boring second screen informational displays, we want to feel how it is in the studio!

As a use case we have taken a quiz with multiple choice questions, the '[Canvascrack](http://www.canvas.be/extra/programmas/canvascrack/index.html)'. 
The quiz plays with one quizmaster that asks questions to one player.
After all the quistions are answered, the quizmaster gives the answers.
We at home do exactly the same as the player in the studio.
He has a certain time to answer the question, so do we.
He gets the results after all the questions are answered, so do we.
He then gets a big score on the screen, so do we.
He has nice studio lighting that responds on his results, so do we!

[Video demo](http://www.youtube.com/watch?v=qT32nDD1qU8)

The installtion has a nice big console with 3 big buttons to smash on when you think you know the answer.
Inside there is a Raspberry Pi running Node.js for interaction and controlling the set of [Philips Hue](https://www.meethue.com/) lights.


Installation
============

You will need a Node.js installation (v >0.8)

Install dependencies:

    npm install

Compile coffeescripts: (with -b option!)

    node_modules/.bin/coffee -bc *.coffee

Run server:

    node server.js

Node, socket.io and http:

	https://github.com/visionmedia/express/wiki/Migrating-from-2.x-to-3.x
