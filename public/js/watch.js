$(document).ready(function () {
  var socket = io.connect('')
  socket.on('update', function (data) {
    updateStatus(data)
  })

  socket.on('twit', function (data) {
    if (!$.isArray(data)) data = [data]
    $.each(data, function (idx, twit) {
      $('#twits .content').prepend($(renderTwit(twit)))
    })
  })
})

function updateStatus (data) {
  var elem = $('#' + data.action)
    , className = data.statusOK ? 'ok' : 'fail' 
    , ago = Math.round( (Date.now()/1000 - data.time) / 60)

  elem.addClass(className)
  elem.find('.status').html('<p>Last update:<br>' + ago + ' minutes ago</p><p>' + 
    'Request: ' + Math.round(data.timeElapsed*100)/100 + 's</p>')
}

function renderTwit(twit) {
  var html = '<div class="twit twit-' + twit.id + '">';

  html += '<img  " src="' + twit.profile_image_url + '" />';
  html += '<p class="text"><span class="username"><a href="https://twitter.com/' + twit.screen_name + '"target=_blank rel="external">' + twit.screen_name + '</a>:</span> ';
  html += twit.text;
  html += '</p></div>';
  return html;
}

