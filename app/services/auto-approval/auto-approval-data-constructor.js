module.exports = function (claimData, autoApprovalData) {
  var eligibilityData = claimData.Eligibility ? claimData.Eligibility : autoApprovalData.Eligibility
  var visitorData = claimData.Visitor ? claimData.Visitor : autoApprovalData.Visitor
  var prisonerData = claimData.Prisoner ? claimData.Prisoner : autoApprovalData.Prisoner

  var result = {
    Eligibility: eligibilityData,
    Prisoner: prisonerData,
    Visitor: visitorData,
    Claim: claimData.Claim,
    ClaimChildren: claimData.ClaimChildren,
    ClaimExpenses: claimData.ClaimExpenses,
    ClaimDocument: claimData.ClaimDocument,
    ClaimBankDetail: claimData.ClaimBankDetail,
    previousClaims: autoApprovalData.previousClaims,
    latestManuallyApprovedClaim: autoApprovalData.latestManuallyApprovedClaim
  }

  return result
}
