// NOTE: Keep in sync with apvs-internal-web to ensure all checks can be disabled in admin config
module.exports = [
  'are-children-under-18',
  'cost-and-variance-equal-or-less-than-first-time-claim',
  'do-expenses-match-first-time-claim',
  'has-claimed-less-than-max-times-this-year',
  'has-uploaded-prison-visit-confirmation-and-receipts',
  'is-claim-submitted-within-time-limit',
  'is-claim-total-under-limit',
  'is-latest-manual-claim-approved',
  'is-no-previous-pending-claim',
  'is-prison-not-in-guernsey-jersey',
  'is-visit-in-past',
  'visit-date-different-to-previous-claims'
]
