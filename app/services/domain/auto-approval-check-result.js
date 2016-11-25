class AutoApprovalCheckResult {
  constructor (checkName, result, failureMessage) {
    this.checkName = checkName
    this.result = result
    this.failureMessage = failureMessage
  }
}

module.exports = AutoApprovalCheckResult
