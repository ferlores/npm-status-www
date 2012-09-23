$(document).ready(function () {
  var socket = io.connect('')
  socket.on('update', function (data) {
    update(data)
  })
})

function update (data) {
  var elem = $('#' + data.action)
    , className = data.statusOK ? 'ok' : 'fail' 
    , ago = Math.round( (Date.now()/1000 - data.time) / 60)

  elem.addClass(className)
  elem.find('.status').html('<p>Last update:<br>' + ago + ' minutes ago</p><p>' + 
    'Request: ' + Math.round(data.timeElapsed*100)/100 + 's</p>')
}
