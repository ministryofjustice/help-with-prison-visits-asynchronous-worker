const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const fileTypeEnum = require('../../../../app/constants/payment-filetype-enum')
const dateFormatter = require('../../../../app/services/date-formatter')

const insertDirectPaymentFile = require('../../../../app/services/data/insert-direct-payment-file')

const path = `data/payments/test${Math.floor(Math.random() * 20)}.csv`

describe('services/data/insert-direct-payment-file', function () {
  it('should create DirectPaymentFile with path and AccessPay file type', function () {
    const currentDate = dateFormatter.now()
    const twoMinutesAgo = dateFormatter.now().minutes(currentDate.get('minutes') - 2)
    const twoMinutesAhead = dateFormatter.now().minutes(currentDate.get('minutes') + 2)
    return insertDirectPaymentFile(path, fileTypeEnum.ACCESSPAY_FILE).then(function () {
      const db = getDatabaseConnector()

      return db
        .table('IntSchema.DirectPaymentFile')
        .where({ Filepath: path, FileType: fileTypeEnum.ACCESSPAY_FILE })
        .first()
        .then(function (result) {
          expect(result.Filepath).toBe(path)
          expect(result.FileType).toBe(fileTypeEnum.ACCESSPAY_FILE)
          expect(result.DateCreated).toBeGreaterThanOrEqual(twoMinutesAgo.toDate())
          expect(result.DateCreated).toBeLessThanOrEqual(twoMinutesAhead.toDate())
          expect(result.IsEnabled).toBe(true)
        })
    })
  })

  afterAll(function () {
    const db = getDatabaseConnector()

    return db('IntSchema.DirectPaymentFile').where('Filepath', path).del()
  })
})
