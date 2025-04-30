const getClaim = require('../data/get-claim')
const getNumberOfClaimsForEligibility = require('../data/get-number-of-claims-for-eligibility')
const getAllClaimData = require('../data/get-all-claim-data')
const copyClaimDataToArchive = require('../data/copy-claim-data-to-archive')
const deleteClaimFromInternal = require('../data/delete-claim-from-internal')

module.exports = claimId => {
  let eligibilityId
  let reference
  let deleteEligibility
  let claimData

  return getClaim('IntSchema', claimId)
    .then(claim => {
      eligibilityId = claim.EligibilityId
      reference = claim.Reference
      return getNumberOfClaimsForEligibility('IntSchema', eligibilityId)
    })
    .then(numberOfClaims => {
      deleteEligibility = numberOfClaims === 1
      return getAllClaimData('IntSchema', reference, eligibilityId, claimId, true)
    })
    .then(result => {
      claimData = result
      return copyClaimDataToArchive(claimData)
    })
    .then(() => {
      return deleteClaimFromInternal(eligibilityId, claimId, deleteEligibility)
    })
    .then(() => {
      claimData.DeleteEligibility = deleteEligibility
      return claimData
    })
}
