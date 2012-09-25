var connect = require('connect')
  , fs = require('fs')
  , dirSamples = __dirname + '/samples/'
  , interval = 5 * 60 * 1000
  , samples = []
  
/*****************************************************************************/

fs.readdir(dirSamples, function (err, list) {
  if (err) throw new Error('Cannot read samples folder')
  list.forEach(function (name) {
    samples.push(require(dirSamples + name));
  })
})

var db = require('./db')(check)

function check(err, collection) {
  if (err) throw new Error('Error reading database')

  samples.forEach(function (fn) {
    fn({}, saveData)
  })

  setTimeout(function () {
    check(err, collection)
  }, interval)
}

function saveData(sample) {
  db.collection('status', function (err, collection) {
    collection.insert(sample, function(err, docs) {
      if (err) throw err
    })
  })

  io.sockets.emit('update', sample)
}


/****************************************************************************/

var app = connect()
    .use(connect.static(__dirname + '/public'))
    .listen(process.env.PORT || 80)
  , io = require('socket.io').listen(app)

io.set('log level', 1)

io.sockets.on('connection', function (socket) {
  db.collection('status', function (err, collection) {

    ['registry', 'website'].forEach(function (action){
      collection.find({action: action}).sort({'time': -1}).limit(1)
        .nextObject(function(err, results) {
          socket.emit('update', results)
        });
    })
    
  })
});
