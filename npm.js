var npm = require('npm')
  , url = require('url')
  , connect = require('connect')
  , microtime = require('microtime')
  , interval = 10 * 60 * 1000

/*****************************************************************************/
var db = require('./db')(check)

function check(err, collection) {
  var start = microtime.nowDouble()
    , end
    , result

  npm.load({}, function (err) {
    if (err) throw err
    npm.commands.search(['npm-registry-client'], true, function (err, data) {
      if (err) throw err
      end = microtime.nowDouble()

      result = {
        action: 'search',
        time: end,
        timeElapsed: end - start
      }

      io.sockets.emit('data', result)

      collection.insert(result, function(err, docs) {
        if (err) throw err
      })

      setTimeout(function () {
        check(err, collection)
      }, interval)
    })

  })
}

/****************************************************************************/

var app = connect()
    .use(connect.static(__dirname + '/public'))
    .listen(process.env.PORT || 80)
  , io = require('socket.io').listen(app)

io.sockets.on('connection', function (socket) {
  db.collection('status', function (err, collection) {
    if(err) throw err
    collection.find().toArray(function(err, results) {
      socket.emit('init', results)
    });
  })
});
