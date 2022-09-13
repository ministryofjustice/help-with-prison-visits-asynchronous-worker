const config = require('./config')

module.exports = {
  asyncworker: {
    client: 'mssql',
    connection: {
      host: config.DATABASE_SERVER,
      user: config.ASYNC_WORKER_USERNAME,
      password: config.ASYNC_WORKER_PASSWORD,
      database: config.DATABASE,
      requestTimeout: 90000,
      connectionTimeout: 90000,
      options: {
        encrypt: false,
        requestTimeout: 90000,
        connectionTimeout: 90000,
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
      requestTimeout: 90000,
      connectionTimeout: 90000,
      options: {
        encrypt: false,
        requestTimeout: 90000,
        connectionTimeout: 90000,
        enableArithAbort: true
      }
    },
    pool: {
      min: 2,
      max: 10
    },
    acquireConnectionTimeout: 300000
    //, debug: true // uncomment to debug
  },
  testing: {
    client: 'mssql',
    connection: {
      host: config.TESTING_DATABASE_SERVER,
      user: config.TESTING_USERNAME,
      password: config.TESTING_PASSWORD,
      database: config.TESTING_DATABASE,
      options: {
        encrypt: false,
        enableArithAbort: true
      }
    }
    // , debug: true // uncomment to debug
  }

}
