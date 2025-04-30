const log = require('../../../app/services/log')

describe('services/log', () => {
  describe('create logger', () => {
    it('should create a log called asynchronous-worker', () => {
      expect(log.fields.name).toBe('asynchronous-worker')
    })
  })
})
