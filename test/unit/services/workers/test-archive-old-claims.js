const expect = require('chai').expect
const moment = require('moment')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
require('sinon-bluebird')

const CLAIM_ID_1 = 1
const CLAIM_ID_2 = 2

var config = { ARCHIVE_CLAIMS_AFTER_DAYS: '10' }
var tenDaysAgo = moment().subtract(10, 'day')
var tenDaysAgoMinus5mins = tenDaysAgo.subtract(5, 'minute').toDate()
var tenDaysAgoPlus5mins = tenDaysAgo.add(10, 'minute').toDate()

var getAllClaimsOlderThanDate
var insertTask

var archiveOldClaims

describe('services/workers/archive-old-claims', function () {
  beforeEach(function () {
    getAllClaimsOlderThanDate = sinon.stub()
    insertTask = sinon.stub()

    archiveOldClaims = proxyquire('../../../../app/services/workers/archive-old-claims', {
      '../../../config': config,
      '../data/get-all-claims-older-than-date': getAllClaimsOlderThanDate,
      '../data/insert-task': insertTask
    })
  })

  it('should retrieve all claims older than current date minus config days', function () {
    getAllClaimsOlderThanDate.resolves([])

    return archiveOldClaims.execute({}).then(function () {
      expect(getAllClaimsOlderThanDate.calledOnce).to.be.true
      expect(getAllClaimsOlderThanDate.firstCall.args[0]).to.be.within(tenDaysAgoMinus5mins, tenDaysAgoPlus5mins)
    })
  })

  it('should insert an archive claim task for each claim id found', function () {
    getAllClaimsOlderThanDate.resolves([CLAIM_ID_1, CLAIM_ID_2])
    insertTask.resolves()

    return archiveOldClaims.execute({}).then(function () {
      expect(insertTask.calledTwice).to.be.true
    })
  })
})
