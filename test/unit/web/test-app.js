const proxyquire = require('proxyquire')
const sinon = require('sinon')
const supertest = require('supertest')
const expect = require('chai').expect

describe('web/app', function () {
  describe('GET /status', function () {
    let request
    let stubGetTaskCountsByStatus

    beforeEach(function () {
      stubGetTaskCountsByStatus = sinon.stub().resolves()
      const app = proxyquire('../../../app/web/app', {
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
