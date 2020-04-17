var proxyquire = require('proxyquire')
var sinon = require('sinon')
var supertest = require('supertest')
var expect = require('chai').expect

describe('web/app', function () {
  describe('GET /status', function () {
    var request
    var stubGetTaskCountsByStatus

    beforeEach(function () {
      stubGetTaskCountsByStatus = sinon.stub().resolves()
      var app = proxyquire('../../../app/web/app', {
        '../services/data/get-task-counts-by-status': stubGetTaskCountsByStatus
      })
      request = supertest(app)
    })

    it('should respond with a 200 and call to get task counts', function (done) {
      request
        .get('/status')
        .expect(200)
        .end(function (error, response) {
          expect(error).to.be.null //eslint-disable-line
          expect(stubGetTaskCountsByStatus.calledOnce).to.be.true //eslint-disable-line
          done()
        })
    })
  })
})
