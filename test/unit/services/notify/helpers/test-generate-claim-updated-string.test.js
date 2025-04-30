const generateClaimUpdatedString = require('../../../../../app/services/notify/helpers/generate-claim-updated-string')

describe('notify/helpers/generate-claim-updated-string', () => {
  it('should contain note and document details', () => {
    const UPDATED_DOCUMENTS = [{ DocumentType: 'VISIT-CONFIRMATION', DocumentStatus: 'post-later' }]

    const message = generateClaimUpdatedString(UPDATED_DOCUMENTS)

    expect(message).toMatch(UPDATED_DOCUMENTS[0].DocumentType)
    expect(message).toMatch(UPDATED_DOCUMENTS[0].DocumentStatus)
  })
})
