var request = require('request')
  , microtime = require('microtime')

module.exports = function registry(io, callback) {
  var start = microtime.nowDouble()
    , end
    , result

  request('http://registry.npmjs.org', function (err, res, body) {
    end = microtime.nowDouble()
    callback({
      action: 'registry',
      time: end,
      timeElapsed: end - start,
      statusOK: !err && res.statusCode === 200
    })
  })
}
