const getClaim = require('../data/get-claim')
const getNumberOfClaimsForEligibility = require('../data/get-number-of-claims-for-eligibility')
const getAllClaimData = require('../data/get-all-claim-data')
const copyClaimDataToArchive = require('../data/copy-claim-data-to-archive')
const deleteClaimFromInternal = require('../data/delete-claim-from-internal')

module.exports = function (claimId) {
  let eligibilityId
  let reference
  let deleteEligibility
  let claimData

  return getClaim('IntSchema', claimId)
    .then(function (claim) {
      eligibilityId = claim.EligibilityId
      reference = claim.Reference
      return getNumberOfClaimsForEligibility('IntSchema', eligibilityId)
    })
    .then(function (numberOfClaims) {
      deleteEligibility = numberOfClaims === 1
      return getAllClaimData('IntSchema', reference, eligibilityId, claimId, true)
    })
    .then(function (result) {
      claimData = result
      return copyClaimDataToArchive(claimData)
    })
    .then(function () {
      return deleteClaimFromInternal(eligibilityId, claimId, deleteEligibility)
    })
    .then(function () {
      claimData.DeleteEligibility = deleteEligibility
      return claimData
    })
}
