module.exports = function (claimData, autoApprovalData) {
  const eligibilityData = claimData.Eligibility ? claimData.Eligibility : autoApprovalData.Eligibility
  const visitorData = claimData.Visitor ? claimData.Visitor : autoApprovalData.Visitor
  const prisonerData = claimData.Prisoner ? claimData.Prisoner : autoApprovalData.Prisoner

  const result = {
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
