var TV = (function(){
  
  var archtype = Raphael("question-timer", 100, 100);
  
  archtype.customAttributes.arc = function (xloc, yloc, value, total, R) {
      var alpha = 360 / total * value,
          a = (90 - alpha) * Math.PI / 180,
          x = xloc + R * Math.cos(a),
          y = yloc - R * Math.sin(a),
          path;
      if (total == value) {
          path = [
              ["M", xloc, yloc - R],
              ["A", R, R, 0, 1, 1, xloc - 0.01, yloc - R]
          ];
      } else {
          path = [
              ["M", xloc, yloc - R],
              ["A", R, R, 0, +(alpha > 180), 1, x, y]
          ];
      }
      return {
          path: path
      };
  };
  
  //make an arc at 50,50 with a radius of 30 that grows from 0 to 40 of 100 with a bounce
  var my_arc = archtype.path().attr({
      "stroke": "#fff",
      "stroke-width": 14,
      arc: [50, 50, 100, 100, 30]
  });

  function onTvStart(data){
    console.log('Tv start', data);
    //
    try{
      var v = document.getElementById("video");
      v.play();
    }catch(err){
      console.log("Damned: " + err);
    }
  }

  function onQuizStart(data){
    console.log('Quiz start', data);
    //
  }

  function onQuizEnd(data){
    console.log('Quiz end', data);
    //
  }

  function onQuestionSoon(data){
    console.log('Question soon', data);
    //{"type":"question:soon","time":4,"buttons":[],"passed":true}
  }

  function onQuestionStart(data){
    console.log('Question start', data);
    //{"type":"question:start","time":6,"buttons":["A","B"],"passed":true,"countdown":2}
    
    $('.question-timer').addClass('show');
    
    var countdownMax = 10,
      dateNow = +new Date(),
      futureDate = dateNow + (countdownMax * 1000);
      
    window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              function( callback ){
                window.setTimeout(callback, 1000 / 60);
              };
    })();
      
    (function animloop(){
        var seconds = 10,
        currentDate = +new Date,
        secondsRemain = Math.round((futureDate - currentDate) / 1000),
        percentage = Math.max(0, (secondsRemain / countdownMax) * 100);
        
        my_arc.animate({
            arc: [50, 50, percentage, 100, 30]
        }, 100, "bounce");
        
        requestAnimFrame(animloop);
    })();
  }

  function onQuestionEnd(data){
    console.log('Question end', data);
    //{"type":"question:end","time":8,"buttons":[],"passed":true}
    $('.question-timer').removeClass('show');
  }

  function onScoreUpdate(data){
    console.log('Score update', data);
    //
  }


  // Initialization happens here!
  var socket = null;
  var baseUrl = null;

  function init(url){
    console.log('Connect to: ' + url);
    baseUrl = url;
    socket = io.connect(baseUrl);

    var registration_options = { 
      username: 'one',
      type: 'tv'
    }

    socket.on('connect', function (data) {
      console.log('connect', data);
      socket.emit('register', registration_options);
    });

    socket.on('point', function(data){
      //console.log('Point received: ' + JSON.stringify(data));

      switch(data.type){
        case "tv:start": onTvStart(data);break;
        case "quiz:start": onQuizStart(data);break;
        case "quiz:end": onQuizEnd(data);break;
        case "question:soon": onQuestionSoon(data);break;
        case "question:start": onQuestionStart(data);break;
        case "question:end": onQuestionEnd(data);break;
        case "score:update": onScoreUpdate(data);break;
      }
    });

    $('form').ajaxForm();
  }

  function start(event){
    event.preventDefault();
    $.post(baseUrl + '/api/start', function(data){
      console.log('Started ' + JSON.stringify(data));
    });
  }

  return {
    init: init,
    start: start
  }
})();
