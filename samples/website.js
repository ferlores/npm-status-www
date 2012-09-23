var request = require('request')
  , microtime = require('microtime')

module.exports = function website(io, callback) {
  var start = microtime.nowDouble()
    , end
    , result

  request('http://npmjs.org', function (err, res, body) {
    end = microtime.nowDouble()
    callback({
      action: 'website',
      time: end,
      timeElapsed: end - start,
      statusOK: !err && res.statusCode === 200
    })
  })
}
