const getAutoApproveClaims = require('../data/get-auto-reject-claim')
const insertClaimEventSystemMessage = require('../data/insert-claim-event-system-message')
const updateClaimStatus = require('../data/update-claim-status')
const deleteAutoApproveClaim = require('../data/delete-auto-approve-claim')
const statusEnum = require('../../constants/status-enum')
const claimEventEnum = require('../../constants/claim-event-enum')
const config = require('../../../config')

module.exports.execute = function (task) {
  var claimData
  var autoRejectClaimsAfterWeeks = parseInt(config.AUTO_REJECT_AFTER_WEEKS)
  var autoRejectClaimsOlderThan = dateFormatter.now().subtract(autoRejectClaimsAfterWeeks, 'weeks').toDate()

  return getAutoRejectClaims()
    .then(function (data) {
      claimData = data
      claimData.forEach(function (claim) {
        return insertClaimEventSystemMessage(claim.Reference, claim.EligibilityId, claim.ClaimId, null, claimEventEnum.CLAIM_REJECTED.value, null, 'We have not had an update for ' + autoRejectClaimsAfterWeeks + ' weeks. Rejecting the claim.', false) })
          .then(function () {
            return updateClaimStatus(claim.ClaimId, statusEnum.REJECTED)
          })
      })
}
