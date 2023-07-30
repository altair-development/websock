require('dotenv').config()
const { createServer } = require('http'),
  { Server } = require('socket.io'),
  { createAdapter } = require('@socket.io/redis-adapter'),
  sessionMiddleware = require('./config/middlewares/sessionMiddleware'),
  myIoredis = require('./util/myIoredis'),
  { get } = require('./util/axios')

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: process.env.WEB_URL,
    credentials: true
  },
  allowRequest: (req, callback) => {
    // with HTTP long-polling, we have access to the HTTP response here, but this is not
    // the case with WebSocket, so we provide a dummy response object
    const fakeRes = {
      getHeader() {
        return []
      },
      setHeader(key, values) {
        req.cookieHolder = values[0]
      },
      writeHead() {},
    }
    sessionMiddleware(req, fakeRes, () => {
      console.log('req.headers.cookie', req.headers.cookie)
      console.log('req.session', req.session)
      if (req.session) {
        // trigger the setHeader() above
        fakeRes.writeHead()
        // manually save the session (normally triggered by res.end())
        req.session.save()
      }
      callback(null, true)
    })
  }
})

io.engine.on("initial_headers", (headers, req) => {
  if (req.cookieHolder) {
    headers["set-cookie"] = req.cookieHolder
    delete req.cookieHolder
  }
})

const pubClient = new myIoredis()
const subClient = new myIoredis()

pubClient.on('connect', () => { 
  console.log('connect ioRedis')
})

io.adapter(createAdapter(pubClient, subClient))

io.use((socket, next) => {
  let clientIp = socket.handshake.address
  clientIp = clientIp.indexOf('::ffff:') == 0 ? clientIp.substring(7) : clientIp
  socket.isLocalhost = clientIp === process.env.PODIP
  console.log('isLocalhost ', socket.isLocalhost)
  const session = socket.request.session
  if ((session && session.user) || socket.isLocalhost) {
    next()
  } else {
    next(new Error("unauthorized"))
  }
})

io.on('connection', (socket) => {
  console.log('connect /', socket.id)
  if (socket.isLocalhost) {
    return
  }
  socket.on('join', async ({ clanIds }, callback) => {
    try {
      console.log('at join', clanIds)
      const { headers } = socket.request
      // const { data } = await get('/clans/getTrueMyclanWithStatus', { headers })
      const data = {}
      console.log('data', data)
      clanIds.forEach(clanId => {
        socket.join(clanId)
        socket.on('emitMessage:' + clanId, (data) => {
          console.log('socket.rooms', socket.rooms)
          socket.to(clanId).emit('message', data)
        })
      })
      // TODO コールバック関数に循環参照を持つオブジェクトを渡すとエラーが発生する。
      // その場合はhttps://github.com/socketio/socket.io/issues/1665を参考に独自パーサーを作成する必要アリ。
      callback(data)
    } catch (err) {
      console.log('err', err)
      callback(err.message)
    }
  })
  socket.on("disconnecting", () => {
    console.log('disconnect', socket.id)
  })
  socket.on('disconnect', () => {
    console.log('disconnect', socket.id)
  })
})

io.listen(process.env.PORT)
