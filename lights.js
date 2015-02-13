var lamps = (function(){
    var request = require('request');
    console.log('Lempkes');

    var url = 'http://192.168.2.16/api/robbywauters/lights/';

    var bri_max = 255;
    var hue_max = 65535;// Both 0 and 65535 are red, 25500 is green and 46920 is blue.
    var sat_max = 255;

    var lamps = 3;


    function random_bri(){
        return Math.floor((Math.random()*hue_bri));
    }

    function random_hue(){
        return Math.floor((Math.random()*hue_max));
    }

    function random_sat(){
        return Math.floor((Math.random()*hue_sat));
    }


    function lamp(settings){

        x = []

        if(settings.on != undefined) x.push('"on": ' + settings.on);
        if(settings.bri != undefined) x.push('"bri": ' + settings.bri);
        if(settings.hue != undefined) x.push('"hue": ' + settings.hue);
        if(settings.sat != undefined) x.push('"sat": ' + settings.sat);
        if(settings.transitiontime != undefined) x.push('"transitiontime": ' + settings.transitiontime);
        if(settings.alert != undefined) x.push('"alert": "' + settings.alert + '"');

        console.log("X " + x);

        request.put({url:url+settings.id+'/state', body: "{" + x.join(',') + "}"}, function(error, response, body) {console.log(body)});
    }

    // EFFECTS

    function off_all(){
        for (var i=1;i<=lamps;i++) {
            lamp({id: i, on: false});
        }
    }

    function on_all(){
        // Groene appel
        lamp({id: 1, on: true, hue: 25525, bri: 67, sat: sat_max});

        // Gele appel
        lamp({id: 2, on: true, hue: 12778, bri: 66, sat: sat_max});

        // Rode appel
        lamp({id: 3, on: true, hue: 246, bri: 146, sat: sat_max});
        //lamp({id: 3, on: true, hue: 46920, bri: 100, sat: sat_max})
    }


    function flash(id){
        lamp({id: id, on: true, sat: sat_max, bri: sat_max, hue: random_hue()});
        setTimeout(function() { lamp({id: id, alert: 'select'}) }, 100);
        setTimeout(function() { lamp({id: id, on: false}) }, 200);
    }

    function flash2(id){
        lamp({id: id, sat: sat_max, bri: sat_max, hue: random_hue()});
        setTimeout(function() { lamp({id: id, alert: 'select'}) }, 100);
        setTimeout(function() { lamp({id: id, on: false}) }, 200);
    }


    function quiz_start(){
        for (var id=1;id<=lamps;id++) {
            lamp({id: id, on: true, bri: 50, sat: 0, hue: 0});
            //setTimeout(function() { lamp({id: id, alert: 'select'}) }, 500);
            //setTimeout(function() { lamp({id: id, alert: 'select'}) }, 1000);
            //setTimeout(function() { lamp({id: id, alert: 'select'}) }, 1500);
        }
    }

    function quiz_end(){
        for (var id=1;id<=lamps;id++) {
            lamp({id: id, alert: 'select'});
            setTimeout(function() { lamp({id: id, on: false, sat: 0, bri: 0, hue: 10000, transitiontime: 30}) }, 500);
        }
    }

    function question_soon(){
        for (var id=1;id<=lamps;id++) {
            lamp({id: id, sat: sat_max, bri: 100, hue: 10000});
            setTimeout(function() { lamp({id: id, alert: 'select'}) }, 500);
            setTimeout(function() { lamp({id: id, alert: 'select'}) }, 1000);
        }
    }

    function question_start(){
        for (var id=1;id<=lamps;id++) {
            lamp({id: id, sat: sat_max, bri: bri_max, hue: 10000});
        }
    }

    function question_end(){
        for (var id=1;id<=lamps;id++) {
            lamp({id: id, sat: sat_max, bri: 0, hue: 10000, transitiontime: 15});
        }
    }

    function answer(id){
        for(var i=1;i<=lamps;i++){
            if(id!==i){
                lamp({id: i, on:false});
            }
        }
    }

    function disco(){
        var hues = [0, 60000, 0, 25000, 60000, 0, 35000, 0, 60000, 25000, 10000, 0, 60000, 0, 25000, 60000, 0, 35000, 0, 60000, 25000, 10000];

        function buts(hue){
            lamp({id: 1, on:true, sat: 255, bri: 100, hue: hue});
            lamp({id: 2, on:true, sat: 255, bri: 100, hue: hue});
            lamp({id: 3, on:true, sat: 255, bri: 100, hue: hue});
        }

        function timeout(index){
            setTimeout(function(){
                if(index<hues.length){
                    buts(hues[index]);
                    timeout(index+1);
                }else{
                    off_all();
                }
            }, 500);
        }

        timeout(0);
    }

    function onSuccess(){
        for(var i=1;i<=lamps;i++){
            lamp({id: i, on:true, sat: 255, bri: 200, hue: 25000});
        }
        setTimeout(function(){off_all()}, 9000);
    }

    function onErrorr(){
        for(var i=1;i<=lamps;i++){
            lamp({id: i, on:true, sat: 255, bri: 200, hue: 0});
        }
        setTimeout(function(){off_all()}, 9000);
    }

    return {
        on_all: on_all,
        off_all: off_all,
        lamp: lamp,
        question_soon: question_soon,
        question_start: question_start,
        question_end: question_end,
        quiz_start: quiz_start,
        answer: answer,
        disco: disco,
        onSuccess: onSuccess,
        onErrorr: onErrorr
    }
})();


////// LOGICA ///////
var current_question_id = null;

var answer2light = {
    A: 1,
    B: 2,
    C: 3
}


function pointEvent(data){
  console.log("Points: " + JSON.stringify(data) + ", current qid: " + current_question_id);

  switch(data.type){
    case "tv:start": events.onTvStart(data);break;
    case "quiz:start": events.onQuizStart(data);break;
    case "quiz:end": events.onQuizEnd(data);break;
    case "question:soon": events.onQuestionSoon(data);break;
    case "question:start": events.onQuestionStart(data);break;
    case "question:end": events.onQuestionEnd(data);break;
    case "score:update": events.onScoreUpdate(data);break;
  }
}

function answer(answer){
    var lightid = answer2light[answer];
    lamps.answer(lightid);
}

var events = {
    onTvStart: function(data){
        current_question_id = null;
        console.log("On TV start: " + current_question_id);
        //lamps.quiz_start();
        lamps.off_all();
    },

    onQuizStart: function(data){
        console.log('Quiz start');
        lamps.disco();
    },

    onQuizEnd: function(data){
        console.log('Quiz end');
        //
        lamps.off_all();
    },

    onQuestionSoon: function(data){
        console.log('Question soon' + JSON.stringify(data));
        //{"type":"question:soon","time":1.5,"id":0,"countdown":2,"buttons":[],"passed":true}
        //{"type":"question:soon","time":4,"buttons":[],"passed":true}
        //lamps.question_soon();
        current_question_id = data.id;
    },

    onQuestionStart: function(data){
        console.log('Question start');
        //{"type":"question:start","time":6,"buttons":["A","B"],"passed":true,"countdown":2}
        current_question_id = data.id;
        lamps.on_all();

    },

    onQuestionEnd: function(data){
        console.log('Question end');
        //{"type":"question:end","time":8,"buttons":[],"passed":true}
        //lamps.question_end();
        lamps.off_all();
    },

    onScoreUpdate: function(data){
        console.log('Score update: ' + JSON.stringify(data));
        //
        if(data.correct){
            lamps.onSuccess();
        } else {
            lamps.onErrorr();
        }
    }
};

exports.pointEvent = pointEvent;
exports.answer = answer;


