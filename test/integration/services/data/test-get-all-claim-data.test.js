const testHelper = require('../../../test-helper')
const insertClaimEvent = require('../../../../app/services/data/insert-claim-event')

const getAllClaimData = require('../../../../app/services/data/get-all-claim-data')

const EXTSCHEMA = 'ExtSchema'
const INTSCHEMA = 'IntSchema'

describe('services/data/get-all-claim-data', () => {
  describe('get first time claim data', () => {
    const REFERENCE = 'FIRST12'
    let eligibilityId
    let claimId

    beforeAll(() => {
      return testHelper.insertClaimEligibilityData(EXTSCHEMA, REFERENCE).then(ids => {
        eligibilityId = ids.eligibilityId
        claimId = ids.claimId
      })
    })

    it('should return all first time claim data', () => {
      return getAllClaimData(EXTSCHEMA, REFERENCE, eligibilityId, claimId).then(data => {
        expect(data.Eligibility.Reference).toBe(REFERENCE)
        expect(data.Claim.Reference).toBe(REFERENCE)
        expect(data.Prisoner.Reference).toBe(REFERENCE)
        expect(data.Visitor.Reference).toBe(REFERENCE)
        expect(data.ClaimExpenses[0].ClaimId).toBe(claimId)
        expect(data.ClaimBankDetail.ClaimId).toBe(claimId)
        expect(data.ClaimChildren[0].ClaimId).toBe(claimId)
        expect(data.ClaimDocument[0].ClaimId).toBe(claimId)
      })
    })

    afterAll(() => {
      return testHelper.deleteAll(REFERENCE, EXTSCHEMA)
    })
  })

  describe('get repeat claim data', () => {
    const REFERENCE = 'REPEAT5'
    const ELIGIBILITYID = 4321
    let claimId

    beforeAll(() => {
      return testHelper
        .insertClaimData(EXTSCHEMA, REFERENCE, ELIGIBILITYID, testHelper.getClaimData(REFERENCE))
        .then(newClaimId => {
          claimId = newClaimId
        })
    })

    it('should return all repeat claim data', () => {
      return getAllClaimData(EXTSCHEMA, REFERENCE, ELIGIBILITYID, claimId).then(data => {
        expect(data.Eligibility).toBeUndefined()
        expect(data.Prisoner).toBeUndefined()
        expect(data.Visitor).toBeUndefined()
        expect(data.Claim.Reference).toBe(REFERENCE)
        expect(data.Claim.EligibilityId).toBe(ELIGIBILITYID)
        expect(data.ClaimExpenses[0].ClaimId).toBe(claimId)
        expect(data.ClaimBankDetail.ClaimId).toBe(claimId)
        expect(data.ClaimChildren[0].ClaimId).toBe(claimId)
        expect(data.ClaimDocument[0].ClaimId).toBe(claimId)
        expect(data.EligibilityVisitorUpdateContactDetail.EligibilityId).toBe(ELIGIBILITYID)
      })
    })

    afterAll(() => {
      return testHelper.deleteAll(REFERENCE, EXTSCHEMA)
    })
  })

  describe('get internal claim data', () => {
    const REFERENCE = 'INTCLMD'
    let eligibilityId
    let claimId

    beforeAll(() => {
      return testHelper.insertClaimEligibilityData(INTSCHEMA, REFERENCE).then(ids => {
        eligibilityId = ids.eligibilityId
        claimId = ids.claimId
        return insertClaimEvent(REFERENCE, eligibilityId, claimId, null, 'TEST', null, null, true)
      })
    })

    it('should return events and deductions', () => {
      return getAllClaimData(INTSCHEMA, REFERENCE, eligibilityId, claimId).then(data => {
        expect(data.Eligibility.Reference).toBe(REFERENCE)
        expect(data.ClaimEvents[0].ClaimId).toBe(claimId)
        expect(data.ClaimDeductions[0].ClaimId).toBe(claimId)
      })
    })

    afterAll(() => {
      return testHelper.deleteAll(REFERENCE, INTSCHEMA)
    })
  })
})
