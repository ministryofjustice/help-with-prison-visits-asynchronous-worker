const getAutoApproveClaims = require('../data/get-auto-approve-claim')
const autoApproveClaim = require('../data/auto-approve-claim')
const deleteAutoApproveClaim = require('../data/delete-auto-approve-claim')
const log = require('../log')

const autoApproveClaims = function () {
  log.info('Starting auto approve claims')
  let claimData

  return getAutoApproveClaims()
    .then(function (data) {
      claimData = data
      log.info(`Auto approval: ${claimData.length} claims found`)
      claimData.forEach(function (claim) {
        log.info(`Auto approval: processing ClaimId ${claim.ClaimId}`)
        return autoApproveClaim(claim.Reference, claim.EligibilityId, claim.ClaimId, claim.EmailAddress)
          .then(function () {
            return deleteAutoApproveClaim(claim.AutoApprovalId)
          })
      })
    })
}

module.exports = {
  autoApproveClaims
}
