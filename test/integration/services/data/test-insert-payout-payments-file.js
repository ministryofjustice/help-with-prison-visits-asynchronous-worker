const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)

const insertDirectPaymentFile = require('../../../../app/services/data/insert-payout-payment-file')
const path = 'data/payments/test' + Math.floor(Math.random() * 20) + '.csv'

describe('services/data/insert-payout-payment-file', function () {
  it('should create PayoutPaymentFile with path', function () {
    var currentDate = new Date()
    var twoMinutesAgo = new Date().setMinutes(currentDate.getMinutes() - 2)
    var twoMinutesAhead = new Date().setMinutes(currentDate.getMinutes() + 2)
    return insertDirectPaymentFile(path)
      .then(function () {
        return knex.table('IntSchema.PayoutPaymentFile')
          .where({'Filepath': path})
          .first()
          .then(function (result) {
            expect(result.Filepath).to.be.equal(path)
            expect(result.DateCreated).to.be.within(twoMinutesAgo, twoMinutesAhead)
            expect(result.IsEnabled).to.be.true
          })
      })
  })

  after(function () {
    return knex('IntSchema.PayoutPaymentFile').where('Filepath', path).del()
  })
})
