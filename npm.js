var connect = require('connect')
  , fs = require('fs')
  , dirSamples = __dirname + '/samples/'
  , interval = 5 * 60 * 1000
  , samples = []
  , keys = {
      'consumer_key': process.env.consumer_key
    , 'consumer_secret' : process.env.consumer_secret
    , 'access_token_key' : process.env.access_token_key
    , 'access_token_secret': process.env.access_token_secret
  }
  , tu = require('tuiter')(keys)

  
/*****************************************************************************/

fs.readdir(dirSamples, function (err, list) {
  if (err) throw new Error('Cannot read samples folder')
  list.forEach(function (name) {
    samples.push(require(dirSamples + name))
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
  // emit data
  db.collection('status', function (err, collection) {
    ['registry', 'website'].forEach(function (action){
      collection.find({action: action}).sort({'time': -1}).limit(1)
        .nextObject(function(err, results) {
          socket.emit('update', results)
        })
    })
  })
  socket.emit('twit', twits)  
})


var twits = []
twits.push = function (twit) {
  Array.prototype.push.call(this, twit)
  io.sockets.emit('twit', twit)
}

var extractTweet = function (tweet) {
  return {
      screen_name: tweet.user.screen_name
    , id: tweet.id 
    , text: tweet.text 
    , profile_image_url: tweet.user.profile_image_url
  }
}

// Get the last 20 twits at startup
tu.userTimeline({screen_name: 'npmjs'}, function (er, res) {
  res.forEach(function (tweet) {
    twits.unshift(extractTweet(tweet))
  })
})

// 179132846 my twitterID for testing
tu.filter({follow: ['309528017']}, function (stream) {
  stream.on('tweet', function (tweet) {
    twits.push(extractTweet(tweet))
  })
})
