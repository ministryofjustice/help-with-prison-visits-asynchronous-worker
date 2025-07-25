const testHelper = require('../../../test-helper')
const dateFormatter = require('../../../../app/services/date-formatter')

const REFERENCE = 'AUTOAPD'
let eligibilityId
let claimId

let claimData
let previousClaims

let getAllClaimDataStub
let getDataForAutoApprovalCheck

jest.mock('./get-all-claim-data', () => getAllClaimDataStub)

describe.skip('services/data/get-data-for-auto-approval-check', () => {
  beforeAll(() => {
    const uniqueId = Math.floor(Date.now() / 100) - 15000000000
    claimData = testHelper.getClaimData(REFERENCE)

    getAllClaimDataStub = jest.fn().mockResolvedValue(claimData)

    getDataForAutoApprovalCheck = require('../../../../app/services/data/get-data-for-auto-approval-check')

    eligibilityId = claimData.Claim.EligibilityId
    claimId = claimData.Claim.ClaimId

    previousClaims = [
      {
        Claim: {
          ClaimId: uniqueId,
          EligibilityId: eligibilityId,
          Reference: REFERENCE,
          DateOfJourney: dateFormatter.now().subtract(80, 'days').toDate(),
          DateCreated: dateFormatter.now().subtract(70, 'days').toDate(),
          DateSubmitted: dateFormatter.now().subtract(60, 'days').toDate(),
          DateReviewed: dateFormatter.now().subtract(50, 'days').toDate(),
          IsAdvanceClaim: false,
          Status: 'APPROVED',
        },
        ClaimBankDetail: {
          ClaimBankDetailId: uniqueId,
          EligibilityId: eligibilityId,
          Reference: REFERENCE,
          ClaimId: uniqueId,
          AccountNumber: '00123456',
          SortCode: '001122',
          NameOnAccount: 'Joe Bloggs',
          RollNumber: 'ROLL-1BE.R',
        },
      },
      {
        Claim: {
          // Advance claim should not be used for auto-approval
          ClaimId: uniqueId + 1,
          EligibilityId: eligibilityId,
          Reference: REFERENCE,
          DateOfJourney: dateFormatter.now().subtract(70, 'days').toDate(),
          DateCreated: dateFormatter.now().subtract(70, 'days').toDate(),
          DateSubmitted: dateFormatter.now().subtract(70, 'days').toDate(),
          DateReviewed: dateFormatter.now().subtract(71, 'days').toDate(),
          IsAdvanceClaim: true,
          Status: 'APPROVED',
        },
        ClaimBankDetail: {
          ClaimBankDetailId: uniqueId + 1,
          EligibilityId: eligibilityId,
          Reference: REFERENCE,
          ClaimId: uniqueId + 1,
          AccountNumber: '00123456',
          SortCode: '001122',
          NameOnAccount: 'Joe Bloggs',
          RollNumber: 'ROLL-1BE.R',
        },
      },
      {
        Claim: {
          ClaimId: uniqueId + 2,
          EligibilityId: eligibilityId,
          Reference: REFERENCE,
          DateOfJourney: dateFormatter.now().subtract(60, 'days').toDate(),
          DateCreated: dateFormatter.now().subtract(50, 'days').toDate(),
          DateSubmitted: dateFormatter.now().subtract(40, 'days').toDate(),
          DateReviewed: dateFormatter.now().subtract(30, 'days').toDate(),
          IsAdvanceClaim: false,
          Status: 'REJECTED',
        },
        ClaimBankDetail: {
          ClaimBankDetailId: uniqueId + 2,
          EligibilityId: eligibilityId,
          Reference: REFERENCE,
          ClaimId: uniqueId + 2,
          AccountNumber: '00123456',
          SortCode: '001122',
          NameOnAccount: 'Joe Bloggs',
          RollNumber: 'ROLL-1BE.R',
        },
      },
      {
        Claim: {
          ClaimId: uniqueId + 3,
          EligibilityId: eligibilityId,
          Reference: REFERENCE,
          DateOfJourney: dateFormatter.now().subtract(100, 'days').toDate(),
          DateCreated: dateFormatter.now().subtract(90, 'days').toDate(),
          DateSubmitted: dateFormatter.now().subtract(80, 'days').toDate(),
          DateReviewed: dateFormatter.now().subtract(70, 'days').toDate(),
          IsAdvanceClaim: false,
          Status: 'REJECTED',
        },
        ClaimBankDetail: {
          ClaimBankDetailId: uniqueId + 3,
          EligibilityId: eligibilityId,
          Reference: REFERENCE,
          ClaimId: uniqueId + 3,
          AccountNumber: '00123456',
          SortCode: '001122',
          NameOnAccount: 'Joe Bloggs',
          RollNumber: 'ROLL-1BE.R',
        },
      },
      {
        Claim: {
          // This claim should be used for auto-approval time limit check
          ClaimId: uniqueId + 4,
          EligibilityId: eligibilityId,
          Reference: REFERENCE,
          DateOfJourney: dateFormatter.now().subtract(80, 'days').toDate(),
          DateCreated: dateFormatter.now().subtract(70, 'days').toDate(),
          DateSubmitted: dateFormatter.now().subtract(60, 'days').toDate(),
          DateReviewed: dateFormatter.now().subtract(20, 'days').toDate(),
          IsAdvanceClaim: false,
          Status: 'APPROVED',
        },
        ClaimBankDetail: {
          ClaimBankDetailId: uniqueId + 4,
          EligibilityId: eligibilityId,
          Reference: REFERENCE,
          ClaimId: uniqueId + 4,
          AccountNumber: '00123456',
          SortCode: '001122',
          NameOnAccount: 'Joe Bloggs',
          RollNumber: 'ROLL-1BE.R',
        },
      },
      {
        Claim: {
          // Auto-approved claim should not be used for auto-approval
          ClaimId: uniqueId + 5,
          EligibilityId: eligibilityId,
          Reference: REFERENCE,
          DateOfJourney: dateFormatter.now().subtract(80, 'days').toDate(),
          DateCreated: dateFormatter.now().subtract(70, 'days').toDate(),
          DateSubmitted: dateFormatter.now().subtract(60, 'days').toDate(),
          DateReviewed: dateFormatter.now().subtract(10, 'days').toDate(),
          IsAdvanceClaim: false,
          Status: 'AUTO-APPROVED',
        },
        ClaimBankDetail: {
          ClaimBankDetailId: uniqueId + 5,
          EligibilityId: eligibilityId,
          Reference: REFERENCE,
          ClaimId: uniqueId + 5,
          AccountNumber: '00123456',
          SortCode: '001122',
          NameOnAccount: 'Joe Bloggs',
          RollNumber: 'ROLL-1BE.R',
        },
      },
    ]

    const createClaims = []
    previousClaims.forEach(previousClaim => {
      createClaims.push(testHelper.insertClaimData('IntSchema', REFERENCE, uniqueId + 1, previousClaim))
    })

    return Promise.all(createClaims)
  })

  it('should return all current and previous claim data associated to the claimant', () => {
    return getDataForAutoApprovalCheck(REFERENCE, eligibilityId, claimId).then(result => {
      expect(result.previousClaims).not.toBeNull()
      expect(result.latestManuallyApprovedClaim).not.toBeNull()
      expect(result.latestManuallyApprovedClaim.ClaimId).toBe(result.previousClaims[1].ClaimId)
    })
  })

  afterAll(() => {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
