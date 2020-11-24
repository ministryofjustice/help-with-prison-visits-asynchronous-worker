const config = require('../../config')
const bunyan = require('bunyan')
const PrettyStream = require('bunyan-prettystream')

const logsPath = config.LOGGING_PATH || 'logs/asynchronous-worker.log'
const logsLevel = config.LOGGING_LEVEL

// Stream to handle pretty printing of Bunyan logs to stdout.
var prettyStream = new PrettyStream()
prettyStream.pipe(process.stdout)

// Create a base logger for the application.
var log = bunyan.createLogger({
  name: 'asynchronous-worker',
  streams: [],
  serializers: {
    error: errorSerializer
  }
})

// Add console Stream.
log.addStream({
  level: 'DEBUG',
  stream: prettyStream
})

// Add file stream.
log.addStream({
  type: 'rotating-file',
  level: logsLevel,
  path: logsPath,
  period: '1d',
  count: 7
})

function errorSerializer (error) {
  return {
    message: error.message,
    name: error.name,
    stack: error.stack
  }
}

module.exports = log
