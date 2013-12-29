$(document).ready(function () {
  var socket = io.connect('')
  socket.on('update', function (data) {
    updateStatus(data)
  })

  socket.on('twit', function (data) {
    if (!$.isArray(data)) data = [data]
    $content = $('#twits .content');
    $content.html('')
    $.each(data, function (idx, twit) {
       $content.prepend($(renderTwit(twit)))
    })
  })
})

function updateStatus (data) {
  var elem = $('#' + data.action)
    , className = data.statusOK ? 'ok' : 'fail' 
    , ago = Math.round( (Date.now()/1000 - data.time) / 60)

  elem.addClass(className)
  elem.find('.status').html('<p>Last update: <b>' + ago + ' minutes ago</b></p><p>' + 
    'Request: <b>' + Math.round(data.timeElapsed*100)/100 + 's</b></p>')
}

function renderTwit(twit) {
  var html = '<div class="clearfix twit twit-' + twit.id + '">';
  html += '<img src="' + twit.profile_image_url + '" />';
  html += '<p class="text"><span class="username"><a href="https://twitter.com/' + twit.screen_name + '"target=_blank rel="external">' + twit.screen_name + '</a>:</span> ';
  html += twit.text;
  html += '<div class="time text-italic">';
  html += moment(twit.created_at).fromNow();
  html += '</div>';
  html += '</p>';
  html += '</div>';
  return html;
}

