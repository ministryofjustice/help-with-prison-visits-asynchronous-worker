module.exports = {
  asyncworker: {
    client: 'mssql',
    connection: {
      host: process.env.APVS_DATABASE_SERVER,
      user: process.env.APVS_ASYNC_WORKER_USERNAME,
      password: process.env.APVS_ASYNC_WORKER_PASSWORD,
      database: process.env.APVS_DATABASE,
      options: {
        encrypt: true
      }
    },
    pool: {
      min: 2,
      max: 10
    }
    //, debug: true // uncomment to debug
  }
}
