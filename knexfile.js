const config = require('./config')

module.exports = {
  asyncworker: {
    client: 'mssql',
    connection: {
      host: config.DATABASE_SERVER,
      user: config.ASYNC_WORKER_USERNAME,
      password: config.ASYNC_WORKER_PASSWORD,
      database: config.DATABASE,
      options: {
        encrypt: false,
        requestTimeout: 90000,
        enableArithAbort: true
      }
    },
    pool: {
      min: 2,
      max: 100
    },
    acquireConnectionTimeout: 300000
    //, debug: true // uncomment to debug
  },
  archive: {
    client: 'mssql',
    connection: {
      host: config.DATABASE_SERVER,
      user: config.ASYNC_WORKER_USERNAME,
      password: config.ASYNC_WORKER_PASSWORD,
      database: config.ARCHIVE_DATABASE,
      options: {
        encrypt: false,
        requestTimeout: 90000,
        enableArithAbort: true
      }
    },
    pool: {
      min: 2,
      max: 10
    },
    acquireConnectionTimeout: 300000
    //, debug: true // uncomment to debug
  }

}
