const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')

const CLAIM_ID = 1234
const ELIGIBILITY_ID = 4321
const REFERENCE = 'MOVECLM'
const CLAIM_DATA = { Claim: { ClaimId: CLAIM_ID } }

var moveClaimDataToArchiveDatabase

var getClaim
var getNumberOfClaimsForEligibility
var getAllClaimData
var copyClaimDataToArchive
var deleteClaimFromInternal

describe('services/archiving/move-claim-data-to-archive-database', function () {
  beforeEach(function () {
    getClaim = sinon.stub()
    getNumberOfClaimsForEligibility = sinon.stub()
    getAllClaimData = sinon.stub()
    copyClaimDataToArchive = sinon.stub()
    deleteClaimFromInternal = sinon.stub()

    moveClaimDataToArchiveDatabase = proxyquire('../../../../app/services/archiving/move-claim-data-to-archive-database', {
      '../data/get-claim': getClaim,
      '../data/get-number-of-claims-for-eligibility': getNumberOfClaimsForEligibility,
      '../data/get-all-claim-data': getAllClaimData,
      '../data/copy-claim-data-to-archive': copyClaimDataToArchive,
      '../data/delete-claim-from-internal': deleteClaimFromInternal
    })
  })

  it('should retrieve claim data, copy to archive and delete from internal', function () {
    getClaim.resolves({ EligibilityId: ELIGIBILITY_ID, Reference: REFERENCE })
    getNumberOfClaimsForEligibility.resolves(1)
    getAllClaimData.resolves(CLAIM_DATA)
    copyClaimDataToArchive.resolves()
    deleteClaimFromInternal.resolves()

    return moveClaimDataToArchiveDatabase(CLAIM_ID).then(function (archivedClaimData) {
      expect(getClaim.calledWith('IntSchema', CLAIM_ID)).to.be.true //eslint-disable-line
      expect(getNumberOfClaimsForEligibility.calledWith('IntSchema', ELIGIBILITY_ID)).to.be.true //eslint-disable-line
      expect(getAllClaimData.calledWith('IntSchema', REFERENCE, ELIGIBILITY_ID, CLAIM_ID)).to.be.true //eslint-disable-line
      expect(copyClaimDataToArchive.calledWith(CLAIM_DATA)).to.be.true //eslint-disable-line
      expect(deleteClaimFromInternal.calledWith(ELIGIBILITY_ID, CLAIM_ID, true)).to.be.true //eslint-disable-line
      expect(archivedClaimData.DeleteEligibility).to.be.true //eslint-disable-line
    })
  })

  it('should not call to delete Eligibility or return optionalEligibilityId if not last claim for Eligibility', function () {
    getClaim.resolves({ EligibilityId: ELIGIBILITY_ID, Reference: REFERENCE })
    getNumberOfClaimsForEligibility.resolves(2)
    getAllClaimData.resolves(CLAIM_DATA)
    copyClaimDataToArchive.resolves()
    deleteClaimFromInternal.resolves()

    return moveClaimDataToArchiveDatabase(CLAIM_ID).then(function (archivedClaimData) {
      expect(deleteClaimFromInternal.calledWith(ELIGIBILITY_ID, CLAIM_ID, false)).to.be.true //eslint-disable-line
      expect(archivedClaimData.DeleteEligibility).to.be.false //eslint-disable-line
    })
  })
})
