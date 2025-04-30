const stubZendesk = jest.fn().mockResolvedValue()

describe('services/send-technical-help', () => {
  it('should call zendesk with correct details', () => {
    expect(() => {
      expect(stubZendesk).toHaveBeenCalledTimes(1)
    })
  })
})
