const config = require('./config')

const longTimeout = 90000
const retryTimeout = 10000

module.exports = {
  asyncworker: {
    client: 'mssql',
    connection: {
      host: config.DATABASE_SERVER,
      user: config.ASYNC_WORKER_USERNAME,
      password: config.ASYNC_WORKER_PASSWORD,
      database: config.DATABASE,
      requestTimeout: longTimeout,
      connectionTimeout: longTimeout,
      options: {
        encrypt: false,
        enableArithAbort: true,
      },
    },
    pool: {
      min: 2,
      max: 100,
      createRetryIntervalMillis: retryTimeout,
      createTimeoutMillis: longTimeout,
    },
    // , debug: true // uncomment to debug
  },
  archive: {
    client: 'mssql',
    connection: {
      host: config.DATABASE_SERVER,
      user: config.ASYNC_WORKER_USERNAME,
      password: config.ASYNC_WORKER_PASSWORD,
      database: config.ARCHIVE_DATABASE,
      requestTimeout: longTimeout,
      connectionTimeout: longTimeout,
      options: {
        encrypt: false,
        enableArithAbort: true,
      },
    },
    pool: {
      min: 2,
      max: 10,
      createRetryIntervalMillis: retryTimeout,
      createTimeoutMillis: longTimeout,
    },
    // , debug: true // uncomment to debug
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
        enableArithAbort: true,
      },
    },
    // , debug: true // uncomment to debug
  },
}
