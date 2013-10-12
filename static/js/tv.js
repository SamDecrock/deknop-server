var TV = (function(){

  var socket = null;
  var baseUrl = null;

  function init(url){
    console.log('Connect to: ' + url);
    baseUrl = url;
    socket = io.connect(baseUrl);

    socket.on('point', function(data){
      console.log('Point received: ' + JSON.stringify(data));
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



/*
{"type":"question:soon","time":4,"buttons":[],"passed":true} demo:56
{"type":"question:start","time":6,"buttons":["A","B"],"passed":true,"countdown":2} demo:56
{"type":"question:end","time":8,"buttons":[],"passed":true} 


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
      */

/*
socket.on('point', function(data){
      console.log(JSON.stringify(data));
});
*/