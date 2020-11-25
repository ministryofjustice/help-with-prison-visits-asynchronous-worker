const expect = require('chai').expect
const log = require('../../../app/services/log')

describe('services/log', function () {
  describe('create logger', function () {
    it('should create a log called asynchronous-worker', function () {
      expect(log.fields.name).to.equal('asynchronous-worker')
    })
  })
})
