var TV = (function(){

  function onTvStart(data){
    console.log('Tv start', data);
    //
    try{
      var v = document.getElementById("tvscreen");
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
  }

  function onQuestionEnd(data){
    console.log('Question end', data);
    //{"type":"question:end","time":8,"buttons":[],"passed":true} 
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
