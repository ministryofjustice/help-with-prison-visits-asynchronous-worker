const getClaim = require('../data/get-claim')
const getNumberOfClaimsForEligibility = require('../data/get-number-of-claims-for-eligibility') // TODO
const getAllClaimData = require('../data/get-all-claim-data') // TODO update to include internal tables like claimEvents/deductions
const copyClaimDataToArchive = require('../data/copy-claim-data-to-archive') // TODO
const deleteClaimFromInternal = require('../data/delete-claim-from-internal') // TODO

module.exports = function (claimId) {
  var eligibilityId
  var reference
  var deleteEligibility

  return getClaim('IntSchema', claimId)
    .then(function (claim) {
      eligibilityId = claim.EligibilityId
      reference = claim.Reference
      return getNumberOfClaimsForEligibility('IntSchema', eligibilityId)
    })
    .then(function (numberOfClaims) {
      deleteEligibility = numberOfClaims === 1
      return getAllClaimData('IntSchema', reference, eligibilityId, claimId)
    })
    .then(function (claimData) {
      return copyClaimDataToArchive(claimData)
    })
    .then(function () {
      return deleteClaimFromInternal(eligibilityId, claimId, deleteEligibility)
    })
    .then(function () {
      return deleteEligibility ? eligibilityId : null
    })
}
