const express = require('express')
const getTaskCountsByStatus = require('../services/data/get-task-counts-by-status')

var app = express()
var route = express.Router()

app.use('/', route)

route.get('/status', function (req, res) {
  getTaskCountsByStatus().then(function (statusCounts) {
    res.status(200).json({status: 'OK', tasks: statusCounts})
  })
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handlers
app.use(function (err, req, res, next) {
  res.status(err.status || 500).json({
    message: err.message,
    error: {}
  })
})

module.exports = app
