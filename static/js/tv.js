var TV = (function(){

  function onTvStart(data){
    console.log('Tv start');
    //

  }

  function onQuizStart(data){
    console.log('Quiz start');
    //
  }

  function onQuizEnd(data){
    console.log('Quiz end');
    //
  }

  function onQuestionSoon(data){
    console.log('Question soon');
    //{"type":"question:soon","time":4,"buttons":[],"passed":true}
  }

  function onQuestionStart(data){
    console.log('Question start');
    //{"type":"question:start","time":6,"buttons":["A","B"],"passed":true,"countdown":2}
  }

  function onQuestionEnd(data){
    console.log('Question end');
    //{"type":"question:end","time":8,"buttons":[],"passed":true} 
  }

  function onScoreUpdate(data){
    console.log('Score update');
    //
  }


  // Initialization happens here!
  var socket = null;
  var baseUrl = null;

  function init(url){
    console.log('Connect to: ' + url);
    baseUrl = url;
    socket = io.connect(baseUrl);

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
