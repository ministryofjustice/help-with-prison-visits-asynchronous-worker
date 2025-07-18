const moment = require('moment')
const dateFormatter = require('../../../app/services/date-formatter')

const DATE_FORMAT = 'YYYY-MM-DD'
const INVALID_DATE_ERROR = 'Invalid date'

describe('services/date-formatter', () => {
  const VALID_DAY = '01'
  const VALID_MONTH = '01'
  const VALID_YEAR = '2000'
  const EXPECTED_DATE = moment([VALID_YEAR, VALID_MONTH, VALID_DAY], DATE_FORMAT)

  const INVALID_DAY = '55'
  const INVALID_MONTH = '55'
  const INVALID_YEAR = 'invalid year'

  describe('format', () => {
    const DATE_1 = moment('2016-01-01', DATE_FORMAT)
    const DATE_1_FORMATTED = '2016-01-01'

    it('should return string in expected format', () => {
      const result = dateFormatter.format(DATE_1)
      expect(result).toBe(DATE_1_FORMATTED)
    })

    it('should return error if passed null', () => {
      const result = dateFormatter.format(null)
      expect(result).toBe(INVALID_DATE_ERROR)
    })

    it('should return error if passed undefined', () => {
      const result = dateFormatter.format(undefined)
      expect(result).toBe(INVALID_DATE_ERROR)
    })

    it('should return error if passed anything other than a Date object', () => {
      const result = dateFormatter.format({})
      expect(result).toBe(INVALID_DATE_ERROR)
    })
  })

  describe('build', () => {
    it('should return string in expected format', () => {
      const result = dateFormatter.build(VALID_DAY, VALID_MONTH, VALID_YEAR)
      expect(result.format(DATE_FORMAT)).toBe(EXPECTED_DATE.format(DATE_FORMAT))
    })

    it('should return error if passed null', () => {
      const result = dateFormatter.build(null, null, null)
      expect(result.toString()).toBe(INVALID_DATE_ERROR)
    })

    it('should return error if passed undefined', () => {
      const result = dateFormatter.build(undefined, undefined, undefined)
      expect(result.toString()).toBe(INVALID_DATE_ERROR)
    })

    it('should return error if passed a non valid day value (1 - 31)', () => {
      const result = dateFormatter.build(INVALID_DAY, VALID_MONTH, VALID_YEAR)
      expect(result.toString()).toBe(INVALID_DATE_ERROR)
    })

    it('should return error if passed a non valid month value (1 - 12)', () => {
      const result = dateFormatter.build(VALID_DAY, INVALID_MONTH, VALID_YEAR)
      expect(result.toString()).toBe(INVALID_DATE_ERROR)
    })

    it('should return error if passed a non valid year value (not a number)', () => {
      const result = dateFormatter.build(VALID_DAY, VALID_MONTH, INVALID_YEAR)
      expect(result.toString()).toBe(INVALID_DATE_ERROR)
    })
  })

  describe('buildFormatted', () => {
    it('should return string in expected format', () => {
      const result = dateFormatter.buildFormatted(VALID_DAY, VALID_MONTH, VALID_YEAR)
      expect(result.toString()).toBe(dateFormatter.format(EXPECTED_DATE, DATE_FORMAT))
    })

    it('should return error if passed null', () => {
      const result = dateFormatter.buildFormatted(null, null, null)
      expect(result.toString()).toBe(INVALID_DATE_ERROR)
    })

    it('should return error if passed undefined', () => {
      const result = dateFormatter.buildFormatted(undefined, undefined, undefined)
      expect(result.toString()).toBe(INVALID_DATE_ERROR)
    })

    it('should return error if passed a non valid day value (1 - 31)', () => {
      const result = dateFormatter.buildFormatted(VALID_YEAR, VALID_MONTH, INVALID_DAY)
      expect(result.toString()).toBe(INVALID_DATE_ERROR)
    })

    it('should return error if passed a day greater than 29 in February', () => {
      const result = dateFormatter.buildFormatted(VALID_YEAR, '02', '31')
      expect(result.toString()).toBe(INVALID_DATE_ERROR)
    })

    it('should return error if passed a non valid month value (1 - 12)', () => {
      const result = dateFormatter.buildFormatted(VALID_YEAR, INVALID_MONTH, VALID_DAY)
      expect(result.toString()).toBe(INVALID_DATE_ERROR)
    })

    it('should return error if passed a non valid year value (not a number)', () => {
      const result = dateFormatter.buildFormatted(INVALID_YEAR, VALID_MONTH, VALID_DAY)
      expect(result.toString()).toBe(INVALID_DATE_ERROR)
    })
  })

  describe('buildDateFromString', () => {
    const DATE_AS_STRING = '2000-01-01'

    it('should return date made from string', () => {
      const result = dateFormatter.buildFromDateString(DATE_AS_STRING)
      expect(result.toString()).toBe(EXPECTED_DATE.toString())
    })

    it('should return false if passed null', () => {
      const result = dateFormatter.buildFromDateString(null)
      expect(result).toBe(false)
    })

    it('should return false if passed undefined', () => {
      const result = dateFormatter.buildFromDateString(undefined)
      expect(result).toBe(false)
    })

    it('should return error if passed a non valid day value (1 - 31)', () => {
      const result = dateFormatter.buildFromDateString(`${VALID_YEAR}-${VALID_MONTH}-${INVALID_DAY}`)
      expect(result.toString()).toBe(INVALID_DATE_ERROR)
    })

    it('should return error if passed a day greater than 29 in February', () => {
      const result = dateFormatter.buildFromDateString(`${VALID_YEAR}-02-31`)
      expect(result.toString()).toBe(INVALID_DATE_ERROR)
    })

    it('should return error if passed a non valid month value (1 - 12)', () => {
      const result = dateFormatter.buildFromDateString(`${VALID_YEAR}-${INVALID_MONTH}-${VALID_DAY}`)
      expect(result.toString()).toBe(INVALID_DATE_ERROR)
    })

    it('should return error if passed a non valid year value (not a number)', () => {
      const result = dateFormatter.buildFromDateString(`${INVALID_YEAR}-${VALID_MONTH}-${VALID_DAY}`)
      expect(result.toString()).toBe(INVALID_DATE_ERROR)
    })
  })
})
