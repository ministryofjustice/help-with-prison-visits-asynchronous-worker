const config = require('../../config')
const bunyan = require('bunyan')
const PrettyStream = require('bunyan-prettystream')
const logsPath = config.LOGGING_PATH || 'logs/asynchronous-worker.log'

// Stream to handle pretty printing of Bunyan logs to stdout.
var prettyStream = new PrettyStream()
prettyStream.pipe(process.stdout)

// Create a base logger for the application.
var log = bunyan.createLogger({
  name: 'asynchronous-worker',
  streams: []
})

// Add console Stream.
log.addStream({
  level: 'DEBUG',
  stream: prettyStream
})

// Add file stream.
log.addStream({
  type: 'rotating-file',
  level: 'DEBUG',
  path: logsPath,
  period: '1d',
  count: 7
})

module.exports = log
