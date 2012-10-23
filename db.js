var mongo = require('mongodb')
  , url = require('url')
  , db = url.parse(process.env.DB)
  , client

if (db.protocol !== 'mongodb:') throw new Error('Only mongodb support')

db.pathname = db.pathname.replace('/', '')
db.auth = db.auth ? db.auth.split(':') : undefined
db.port = db.port ? parseInt(db.port, 10) : undefined

client = new mongo.Db(db.pathname, new mongo.Server(db.hostname, db.port, {}), {safe: false})

module.exports = function (callback) {
  client.open(function(err, p_client) {
    if (err) throw err
    
    if (db.auth)
      client.authenticate(db.auth[0], db.auth[1], run)
    else
      run()

    function run(err, replies) {
      client.collection('status', callback)
    }
  })
  return client
}
