var TV = (function(){

  var animationFrame,
  timeout;

  var current_question_id = null;

  // Create an Arc
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

  // Setup request aninmations frame
  window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            function( callback ){
              window.setTimeout(callback, 1000 / 60);
            };
  })();

  // Make an arc
  var my_arc = archtype.path().attr({
      "stroke": "#fff",
      "stroke-width": 14,
      arc: [50, 50, 100, 100, 30]
  });

  // Start of all events
  function onTvStart(data){
    console.log('Tv start', data);
    current_question_id = null;
    //
    try{
      var v = document.getElementById("video");
      v.currentTime = 0;
      v.play();
      $("html, body").animate({ scrollTop: $('#video').height() }, 500);
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
    $('#quiz-score').removeClass('show');
  }

  function onQuestionSoon(data){
    console.log('Question soon', data);
    current_question_id = data.id;
    //{"type":"question:soon","time":4,"buttons":[],"passed":true}
  }

  function onQuestionStart(data){
    console.log('Question start', data);
    current_question_id = data.id;
    //{"type":"question:start","time":6,"buttons":["A","B"],"passed":true,"countdown":2}

    // Remove score
    $('#quiz-score').removeClass('show');

    // Show Timer
    $('#question-timer').addClass('show');

    var countdownMax = data.countdown,
      dateNow = +new Date(),
      futureDate = dateNow + (countdownMax * 1000);

    // Let the loop run
    (function animloop(){
        var currentDate = +new Date,
        secondsRemain = Math.round((futureDate - currentDate) / 1000),
        percentage = Math.max(0, (secondsRemain / countdownMax) * 100);

        my_arc.animate({
            arc: [50, 50, percentage, 100, 30]
        }, 100, "bounce");

        animationFrame = requestAnimFrame(animloop);
    })();
  }

  function onQuestionEnd(data){
    console.log('Question end', data);
    //{"type":"question:end","time":8,"buttons":[],"passed":true}

    // remove timer
    $('#question-timer').removeClass('show');

    // kill the loop
    cancelAnimationFrame(animationFrame);

    //reset timer
    setTimeout(function(){
      my_arc = archtype.path().attr({
          "stroke": "#fff",
          "stroke-width": 14,
          arc: [50, 50, 100, 100, 30]
      });
    }, 500);
  }

  function onScoreUpdate(data){
    console.log('Score update', data);
    //

    var questionResult = false;

    if(data.correct){
      questionResult = "correct";
    }else{
      questionResult = "incorrect";
    }

    $('#quiz-score').removeClass("correct").removeClass("incorrect");

    // Update score
    $('#score').html(data.score);

    // Add class or incorrect correct
    $('#question-'+questionResult).addClass('show');

    clearTimeout(timeout);

    timeout = setTimeout(function(){
      $('#question-'+questionResult).removeClass('show');
      $('#quiz-score').addClass('show').addClass(questionResult);
    }, 3000);

    timeout = setTimeout(function(){
      $('#quiz-score').removeClass('show');
    }, 9000);
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

    // makey makey
    document.onkeydown = function(event) {
      switch (event.keyCode) {
        case 37: // left
          console.log('left');
          $.post('/api/answer', {answer: 'A', username: registration_options.username, id: current_question_id});
          break;
        case 38: // up
          console.log('up');
          break;
        case 39: // right
          console.log('right');
          $.post('/api/answer', {answer: 'C', username: registration_options.username, id: current_question_id});
          break;
        case 40: // down
          console.log('down');
          $.post('/api/answer', {answer: 'B', username: registration_options.username, id: current_question_id});
          break;
     }
    };
  }

  function start(event){
    event.preventDefault();
    $.post('/api/start', function(data){
      console.log('Started ' + JSON.stringify(data));
    });
  }




  return {
    init: init,
    start: start
  }
})();
