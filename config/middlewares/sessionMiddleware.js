const session = require('express-session'),
  RedisStore = require('connect-redis')(session),
  myIoredis = require('../../util/myIoredis'),
  redis = new myIoredis()

module.exports = session({
  store: new RedisStore({ client: redis }),
  secret: process.env.SESSION_SECRET,
  saveUninitialized : false,
  resave: false
})