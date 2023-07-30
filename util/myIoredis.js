const ioredis = require('ioredis')

class myIoredis extends ioredis {
  constructor() {
    let redis_address = null;
    if (process.env.NODE_ENV === 'development') {
      // redis server (master) にアクセス
      redis_address = {
        port: process.env.REDIS_STNL_PORTS,
        host: process.env.REDIS_STNL_HOSTS,
        password: process.env.REDIS_DB_PASS,
        connectTimeout: 20000
      };
    } else {
      // redis sentinel にアクセス
      const sentinels = [],
        redis_stnl_hosts = process.env.REDIS_STNL_HOSTS.split(','),
        redis_stnl_ports = process.env.REDIS_STNL_PORTS.split(',');
      
      for (let idx in redis_stnl_hosts) {
        sentinels.push({
          host: redis_stnl_hosts[idx],
          port: redis_stnl_ports[idx]
        });
      }
      redis_address = {
        sentinels,
        name: process.env.REDIS_STNL_NAME,
        password: process.env.REDIS_DB_PASS
      };
    }
    super(redis_address);
  }
}

module.exports = myIoredis;