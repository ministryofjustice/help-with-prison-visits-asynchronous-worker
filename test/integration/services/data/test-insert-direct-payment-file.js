const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const fileTypeEnum = require('../../../../app/constants/payment-filetype-enum')

const insertDirectPaymentFile = require('../../../../app/services/data/insert-direct-payment-file')
const path = 'data/payments/test' + Math.floor(Math.random() * 20) + '.csv'

describe('services/data/insert-direct-payment-file', function () {
  it('should create DirectPaymentFile with path and AccessPay file type', function () {
    return insertDirectPaymentFile(path, fileTypeEnum.ACCESSPAY_FILE)
      .then(function () {
        return knex.table('IntSchema.DirectPaymentFile')
          .where({'Filepath': path, 'FileType': fileTypeEnum.ACCESSPAY_FILE})
          .first()
          .then(function (result) {
            expect(result.Filepath).to.be.equal(path)
            expect(result.FileType).to.be.equal(fileTypeEnum.ACCESSPAY_FILE)
            expect(result.DateCreated).not.to.be.null
            expect(result.IsEnabled).to.be.true
          })
      })
  })

  after(function () {
    return knex('IntSchema.DirectPaymentFile').where('Filepath', path).del()
  })
})
