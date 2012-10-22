var connect = require('connect')
  , fs = require('fs')
  , keys = {
      'consumer_key': process.env.consumer_key
    , 'consumer_secret' : process.env.consumer_secret
    , 'access_token_key' : process.env.access_token_key
    , 'access_token_secret': process.env.access_token_secret
  }
  , Tuiter = require('tuiter')
  , tu = new Tuiter(keys)
  , samples = []
  , lastSample = []
  , dirSamples = __dirname + '/samples/'
  , interval = 5 * 60 * 1000
  , timeline = 309528017 // @npmjs

  
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

  lastSample = []
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

  lastSample.push(sample)
  io.sockets.emit('update', sample)
}

/****************************************************************************/

var app = connect()
    .use(connect.static(__dirname + '/public'))
    .listen(process.env.PORT || 80)
  , io = require('socket.io').listen(app)

io.set('log level', 1)

io.sockets.on('connection', function (socket) {
  lastSample.forEach(function (sample){
    socket.emit('update', sample)
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

// Connect a stream for incomming tweets 
tu.filter({follow: [timeline]}, function (stream) {
  stream.on('tweet', function (tweet) {
    if(!tweet.user) return console.log(tweet)
    if(tweet.user.id === timeline) 
      twits.push(extractTweet(tweet))
  })
})
