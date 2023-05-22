/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as yup from 'yup'

import * as Schemas from './schemas'

describe('lib/schemas.ts module', () => {
  describe('autocomplete schema tests', () => {
    const completionObject = {
      completions: [
        {
          name: 'Santa',
          value: 'smartcookie',
        },
        {
          name: 'Snow White',
          value: 'sleepingprincess',
        },
        {
          name: 'Hello World',
          value: 'Hello World',
        },
      ],
    }

    const eventDetailObject = {
      name: 'test_event',
      description: 'A description about a test event',
      owner: 'bob',
      is_registered: false,
      is_validated: true,
      props: [
        {
          name: 'complicated_property',
          description: 'This prop is complicated',
        },
        {
          name: 'no_description',
          description: '',
        },
      ],
    }

    it('should parse responses correctly', async () => {
      expect(await Schemas.autocompleteSchema.validate(completionObject, { abortEarly: false })).toEqual(
        completionObject,
      )
    })

    it('should parse event details correctly', async () => {
      expect(await Schemas.eventDetailsSchema.validate(eventDetailObject, { abortEarly: false })).toEqual(
        eventDetailObject,
      )
    })
  })

  describe('metricSchema params constraint', () => {
    it('should require params matching parameter type', async () => {
      expect.assertions(6)

      try {
        await Schemas.metricSchema.validate(
          {
            parameterType: Schemas.MetricParameterType.Conversion,
            eventParams: null,
            revenueParams: null,
          },
          { abortEarly: false },
        )
      } catch (e) {
        if (!(e instanceof yup.ValidationError)) {
          throw new Error('Unexpected error')
        }
        expect(e.errors).toMatchInlineSnapshot(`
          Array [
            "This field is required",
            "This field is required",
            "This field is required",
            "This field is required",
            "eventParams cannot be null",
            "Missing expected params field for parameter type.",
          ]
        `)
      }

      try {
        await Schemas.metricSchema.validate(
          {
            parameterType: Schemas.MetricParameterType.Revenue,
            eventParams: null,
            revenueParams: null,
          },
          { abortEarly: false },
        )
      } catch (e) {
        if (!(e instanceof yup.ValidationError)) {
          throw new Error('Unexpected error')
        }
        expect(e.errors).toMatchInlineSnapshot(`
          Array [
            "This field is required",
            "This field is required",
            "This field is required",
            "This field is required",
            "revenueParams cannot be null",
            "Missing expected params field for parameter type.",
          ]
        `)
      }

      try {
        await Schemas.metricSchema.validate(
          {
            parameterType: Schemas.MetricParameterType.Conversion,
            eventParams: [],
            revenueParams: null,
          },
          { abortEarly: false },
        )
      } catch (e) {
        if (!(e instanceof yup.ValidationError)) {
          throw new Error('Unexpected error')
        }
        expect(e.errors).toMatchInlineSnapshot(`
          Array [
            "This field is required",
            "This field is required",
            "This field is required",
            "This field is required",
          ]
        `)
      }

      try {
        await Schemas.metricSchema.validate(
          {
            parameterType: Schemas.MetricParameterType.Revenue,
            eventParams: [],
            revenueParams: null,
          },
          { abortEarly: false },
        )
      } catch (e) {
        if (!(e instanceof yup.ValidationError)) {
          throw new Error('Unexpected error')
        }
        expect(e.errors).toMatchInlineSnapshot(`
          Array [
            "This field is required",
            "This field is required",
            "This field is required",
            "This field is required",
            "This field must be one of the following values: ",
            "revenueParams cannot be null",
            "Missing expected params field for parameter type.",
            "Unexpected params found not matching parameter type.",
          ]
        `)
      }

      try {
        await Schemas.metricSchema.validate(
          {
            parameterType: Schemas.MetricParameterType.Conversion,
            eventParams: null,
            revenueParams: {},
          },
          { abortEarly: false },
        )
      } catch (e) {
        if (!(e instanceof yup.ValidationError)) {
          throw new Error('Unexpected error')
        }
        expect(e.errors).toMatchInlineSnapshot(`
          Array [
            "This field is required",
            "This field is required",
            "This field is required",
            "This field is required",
            "eventParams cannot be null",
            "This field must be one of the following values: ",
            "Missing expected params field for parameter type.",
            "Unexpected params found not matching parameter type.",
          ]
        `)
      }

      try {
        await Schemas.metricSchema.validate(
          {
            parameterType: Schemas.MetricParameterType.Revenue,
            eventParams: null,
            revenueParams: {},
          },
          { abortEarly: false },
        )
      } catch (e) {
        if (!(e instanceof yup.ValidationError)) {
          throw new Error('Unexpected error')
        }
        expect(e.errors).toMatchInlineSnapshot(`
          Array [
            "This field is required",
            "This field is required",
            "This field is required",
            "This field is required",
            "This field is required",
            "This field is required",
            "This field is required",
          ]
        `)
      }
    })

    it('should require exactly one params property', async () => {
      expect.assertions(4)

      try {
        await Schemas.metricSchema.validate(
          {
            eventParams: [],
            revenueParams: {},
          },
          { abortEarly: false },
        )
      } catch (e) {
        if (!(e instanceof yup.ValidationError)) {
          throw new Error('Unexpected error')
        }
        expect(e.errors).toMatchInlineSnapshot(`
          Array [
            "This field is required",
            "This field is required",
            "This field is required",
            "This field is required",
            "This field is required",
            "This field must be one of the following values: ",
            "This field must be one of the following values: ",
            "Missing expected params field for parameter type.",
            "Unexpected params found not matching parameter type.",
          ]
        `)
      }

      try {
        await Schemas.metricSchema.validate(
          {
            eventParams: null,
            revenueParams: null,
          },
          { abortEarly: false },
        )
      } catch (e) {
        if (!(e instanceof yup.ValidationError)) {
          throw new Error('Unexpected error')
        }
        expect(e.errors).toMatchInlineSnapshot(`
          Array [
            "This field is required",
            "This field is required",
            "This field is required",
            "This field is required",
            "This field is required",
            "Missing expected params field for parameter type.",
          ]
        `)
      }

      try {
        await Schemas.metricSchema.validate(
          {
            parameterType: Schemas.MetricParameterType.Conversion,
            eventParams: [],
            revenueParams: null,
          },
          { abortEarly: false },
        )
      } catch (e) {
        if (!(e instanceof yup.ValidationError)) {
          throw new Error('Unexpected error')
        }
        expect(e.errors).toMatchInlineSnapshot(`
          Array [
            "This field is required",
            "This field is required",
            "This field is required",
            "This field is required",
          ]
        `)
      }

      try {
        await Schemas.metricSchema.validate(
          {
            parameterType: Schemas.MetricParameterType.Revenue,
            revenueParams: {},
            eventParams: null,
          },
          { abortEarly: false },
        )
      } catch (e) {
        if (!(e instanceof yup.ValidationError)) {
          throw new Error('Unexpected error')
        }
        expect(e.errors).toMatchInlineSnapshot(`
          Array [
            "This field is required",
            "This field is required",
            "This field is required",
            "This field is required",
            "This field is required",
            "This field is required",
            "This field is required",
          ]
        `)
      }
    })
  })

  describe('experimentFullSchema endDatetime', () => {
    it('throws validation error if endDate is before startDate', async () => {
      expect.assertions(1)
      try {
        await Schemas.experimentFullSchema.validate(
          {
            startDatetime: '2020-08-01',
            endDatetime: '2019-08-02',
          },
          { abortEarly: false },
        )
      } catch (e) {
        if (!(e instanceof yup.ValidationError)) {
          throw new Error('Unexpected error')
        }
        expect(String(e.inner)).toContain('End date must be after start date.')
      }
    })

    it('allows more than 12 months between startDate and endDate', async () => {
      expect.assertions(1)
      try {
        await Schemas.experimentFullSchema.validate(
          {
            startDatetime: '2020-08-01',
            endDatetime: '2021-08-10',
          },
          { abortEarly: false },
        )
      } catch (e) {
        if (!(e instanceof yup.ValidationError)) {
          throw new Error('Unexpected error')
        }
        expect(String(e.inner)).not.toContain('End date must be within 12 months of start date.')
      }
    })
  })

  describe('experimentFullNewSchema endDatetime', () => {
    it('throws validation error if endDate is not within defined period of startDate', async () => {
      expect.assertions(1)
      try {
        await Schemas.experimentFullNewSchema.validate(
          {
            startDatetime: '2020-08-02',
            endDatetime: '2021-08-03',
          },
          { abortEarly: false },
        )
      } catch (e) {
        if (!(e instanceof yup.ValidationError)) {
          throw new Error('Unexpected error')
        }
        expect(e.inner).toMatchInlineSnapshot(`
          Array [
            [ValidationError: This field is required],
            [ValidationError: Start date (UTC) must be in the future.],
            [ValidationError: End date must be within 12 months of start date.],
            [ValidationError: This field is required],
            [ValidationError: This field is required],
            [ValidationError: This field is required],
            [ValidationError: This field is required],
            [ValidationError: This field is required],
            [ValidationError: This field is required],
            [ValidationError: This field is required],
          ]
        `)
      }
    })
  })

  describe('extendedNumberSchema', () => {
    it('should work as expected with normal numbers', () => {
      expect(Schemas.extendedNumberSchema.validateSync(Number.MIN_SAFE_INTEGER)).toBe(Number.MIN_SAFE_INTEGER)
      expect(Schemas.extendedNumberSchema.validateSync(-1)).toBe(-1)
      expect(Schemas.extendedNumberSchema.validateSync(0)).toBe(0)
      expect(Schemas.extendedNumberSchema.validateSync(1)).toBe(1)
      expect(Schemas.extendedNumberSchema.validateSync(Number.MIN_VALUE)).toBe(Number.MIN_VALUE)
      expect(Schemas.extendedNumberSchema.validateSync(Number.MAX_SAFE_INTEGER)).toBe(Number.MAX_SAFE_INTEGER)
    })
    it('should work as expected with number extensions', () => {
      expect(Schemas.extendedNumberSchema.validateSync(NaN)).toBe(NaN)
      expect(Schemas.extendedNumberSchema.validateSync('nan')).toBe(NaN)
      expect(Schemas.extendedNumberSchema.validateSync(Infinity)).toBe(Infinity)
      expect(Schemas.extendedNumberSchema.validateSync('inf')).toBe(Infinity)
      expect(Schemas.extendedNumberSchema.validateSync(-Infinity)).toBe(-Infinity)
      expect(Schemas.extendedNumberSchema.validateSync('-inf')).toBe(-Infinity)
    })
    it('should throw validation errors for non extended-numbers', () => {
      expect(() => Schemas.extendedNumberSchema.validateSync('')).toThrowErrorMatchingInlineSnapshot(
        `"this cannot be null"`,
      )
      expect(() => Schemas.extendedNumberSchema.validateSync('asdf')).toThrowErrorMatchingInlineSnapshot(
        `"this cannot be null"`,
      )
      expect(() => Schemas.extendedNumberSchema.validateSync({})).toThrowErrorMatchingInlineSnapshot(
        `"this cannot be null"`,
      )
      expect(() => Schemas.extendedNumberSchema.validateSync(true)).toThrowErrorMatchingInlineSnapshot(
        `"this cannot be null"`,
      )
      expect(() => Schemas.extendedNumberSchema.validateSync(false)).toThrowErrorMatchingInlineSnapshot(
        `"this cannot be null"`,
      )
      expect(() => Schemas.extendedNumberSchema.validateSync(null)).toThrowErrorMatchingInlineSnapshot(
        `"this cannot be null"`,
      )
    })
  })

  describe('dateSchema', () => {
    it('should work as expected', () => {
      expect(Schemas.dateSchema.validateSync('2023-05-15')).toEqual(new Date('2023-05-15T00:00:00Z'))
      expect(Schemas.dateSchema.validateSync('2023-05-15T01:00Z')).toEqual(new Date('2023-05-15T01:00:00Z'))
      expect(() => Schemas.dateSchema.validateSync({})).toThrowErrorMatchingInlineSnapshot(
        `"Invalid originalValue for date"`,
      )
      expect(() => Schemas.dateSchema.validateSync('')).toThrowErrorMatchingInlineSnapshot(`"this cannot be null"`)
      expect(() => Schemas.dateSchema.validateSync('invalid-date')).toThrowErrorMatchingInlineSnapshot(
        `"this must be a \`date\` type, but the final value was: \`Invalid Date\` (cast from the value \`\\"invalid-date\\"\`)."`,
      )
      expect(() => Schemas.dateSchema.validateSync(null)).toThrowErrorMatchingInlineSnapshot(`"this cannot be null"`)
      expect(() => Schemas.dateSchema.validateSync(undefined)).toThrowErrorMatchingInlineSnapshot(
        `"This field is required"`,
      )
    })
    it('should work as expected for nullable/notrequired datetimes', () => {
      expect(Schemas.dateSchema.nullable().validateSync(null)).toBe(null)
      expect(Schemas.dateSchema.nullable().validateSync('')).toBe(null)
      expect(Schemas.dateSchema.notRequired().validateSync(undefined)).toBe(undefined)
    })
  })
})
