/* eslint-disable @typescript-eslint/no-empty-interface,no-template-curly-in-string */

// Schema documentation lives at:
// https://app.swaggerhub.com/apis/yanir/experiments/0.1.0

import * as dateFns from 'date-fns'
import _ from 'lodash'
import * as tinyCase from 'tiny-case'
import * as yup from 'yup'
import { ArraySchema, DateSchema, MixedSchema, NumberSchema, ObjectSchema } from 'yup'

import { transformSchemaFieldNames } from 'src/utils/yup'

/**
 * Setup Yup UI Validation messages
 *
 * I have taken the defaults (see below) and removed the '${path}' references.
 * Should not be run with tests as we want that extra information.
 *
 * An unfortunate downside to this is that we get less information on run-time errors.
 * If we do want better run-time errors we simply need to wrap the schema in an object
 * before we validate: yup.object({ x: schemaT  }).validate({ x })
 * Then the validation error will have an inner property with both path's and errors.
 *
 * The defaults:
 * https://github.com/jquense/yup/blob/master/src/locale.js
 */
const yupLocale = {
  mixed: {
    default: 'This field is invalid',
    required: 'This field is a required field',
    oneOf: 'This field must be one of the following values: ${values}',
    notOneOf: 'This field must not be one of the following values: ${values}',
    defined: 'This field is required',
  },
  string: {
    length: 'This field must be exactly ${length} characters',
    min: 'This field must be at least ${min} characters',
    max: 'This field must be at most ${max} characters',
    matches: 'This field must match the following: "${regex}"',
    email: 'This field must be a valid email',
    url: 'This field must be a valid URL',
    uuid: 'This field must be a valid UUID',
    trim: 'This field must be a trimmed string',
    lowercase: 'This field must be a lowercase string',
    uppercase: 'This field must be a upper case string',
  },
  number: {
    min: 'This field must be greater than or equal to ${min}',
    max: 'This field must be less than or equal to ${max}',
    lessThan: 'This field must be less than ${less}',
    moreThan: 'This field must be greater than ${more}',
    notEqual: 'This field must be not equal to ${notEqual}',
    positive: 'This field must be a positive number',
    negative: 'This field must be a negative number',
    integer: 'This field must be an integer',
  },
  date: {
    min: 'This field must be later than ${min}',
    max: 'This field must be at earlier than ${max}',
  },
  boolean: {},
  object: {
    noUnknown: 'This field has unspecified keys: ${unknown}',
  },
  array: {
    min: 'This field must have at least ${min} items',
    max: 'This field must have less than or equal to ${max} items',
  },
}
yup.setLocale(yupLocale as yup.LocaleObject)

// The following definition is a bit hacky, but it effectively undefines some fields from the parent schema.
const yupUndefined = yup.mixed().oneOf([]).optional()
const yupNullOnly = yup.mixed().nullable().oneOf([null])

export type IdType = number
export const idSchema: NumberSchema<IdType> = yup.number().integer().positive().defined()
export type NameType = string
export const nameSchema = yup
  .string()
  .max(128)
  .matches(/^[a-z][a-z0-9_]*[a-z0-9]$/, 'This field must use a basic snake_case.')
  .defined()
export type DateType = Date
export const dateSchema: DateSchema<DateType> = yup
  .date()
  // As yup's default transform sets a local timezone and we want it to be in UTC:
  .transform(function (_value, originalValue: unknown) {
    if (originalValue === '') {
      return null
    }
    if (originalValue === undefined || originalValue === null) {
      return originalValue
    }
    if (!(typeof originalValue === 'string' || typeof originalValue === 'number' || originalValue instanceof Date)) {
      throw new Error('Invalid originalValue for date')
    }
    return new Date(originalValue)
  })
  .defined()

/**
 * A new number schema:
 * - Accepts NaN.
 * - Transforms 'nan', 'inf', '-inf' to their corresponding values.
 *   The strings come from python string representations for the corresponding values.
 *   This is necessary as JSON doesn't allow these special values forcing us to serialize them.
 *
 * Unfortunately I couldn't extend yup's number schema to allow NaN.
 * See https://github.com/jquense/yup/issues/1330
 */
export type ExtendedNumber = number
export const extendedNumberSchema: MixedSchema<ExtendedNumber> = yup
  .mixed<number>()
  .transform((_value: unknown, originalValue: unknown) => {
    if (originalValue === 'nan' || (typeof originalValue === 'number' && isNaN(originalValue))) {
      return NaN
    }
    if (originalValue === 'inf') {
      return Infinity
    }
    if (originalValue === '-inf') {
      return -Infinity
    }
    if (originalValue === '' || originalValue === true || originalValue === false || originalValue === null) {
      return null
    }
    const maybeNumber = Number(originalValue)
    // NaN at this point means a parsing/data issue.
    if (isNaN(maybeNumber)) {
      return null
    }
    return maybeNumber
  })
  .defined()
  // eslint-disable-next-line no-template-curly-in-string
  .test('is-number', '${path} is not a number', (value: unknown) => typeof value === 'number')

export enum TagNamespace {
  ExclusionGroup = 'exclusion_group',
}

export interface TagBare {
  tagId: IdType
  namespace: NameType
  name: NameType
  description: string
}
export const tagBareSchema: ObjectSchema<TagBare> = yup
  .object({
    tagId: idSchema.defined(),
    namespace: nameSchema.defined(),
    name: nameSchema.defined(),
    description: yup.string().defined(),
  })
  .defined()
  .camelCase()
// For consistency and openness:
export interface TagFull extends TagBare {}
export const tagFullSchema: ObjectSchema<TagFull> = tagBareSchema
export type TagFullNew = Omit<TagFull, 'tagId'> & {
  tagId?: IdType | null
}
export const tagFullNewSchema: ObjectSchema<TagFullNew> = tagFullSchema.shape({
  tagId: idSchema.optional().nullable(),
})
export const tagFullNewOutboundSchema = transformSchemaFieldNames(tagFullNewSchema, tinyCase.snakeCase).snakeCase()

export interface Event {
  event: string
  props?: Record<string, string> | undefined | null
}
export const eventSchema: ObjectSchema<Event> = yup
  .object({
    event: yup.string().defined(),
    props: yup.mixed<Record<string, string>>().notRequired(),
  })
  .defined()
  .camelCase()

interface EventNewProp {
  key: string
  value: string
}
export interface EventNew {
  event: string
  props: EventNewProp[]
}
const eventNewPropSchema: ObjectSchema<EventNewProp> = yup
  .object({
    key: yup.string().defined(),
    value: yup.string().defined(),
  })
  .defined()
export const eventNewSchema: ObjectSchema<EventNew> = yup
  .object({
    event: yup.string().defined(),
    props: yup.array(eventNewPropSchema).defined() as ArraySchema<EventNewProp[], yup.AnyObject, undefined, ''>,
  })
  .defined()
  .camelCase()

export enum TransactionTypes {
  NewPurchase = 'new purchase',
  Recurring = 'recurring',
  Cancellation = 'cancellation',
  StopRecurring = 'stop recurring',
  UpdateCard = 'update card',
  Refund = 'refund',
  StartTrial = 'start trial',
  StartRecurring = 'start recurring',
  TransferOut = 'transfer out',
  TransferIn = 'transfer in',
  Reactivation = 'reactivation',
}

export interface MetricRevenueParams {
  refundDays: number
  productSlugs: string[]
  transactionTypes: TransactionTypes[]
}
export const metricRevenueParamsSchema: ObjectSchema<MetricRevenueParams> = yup
  .object({
    refundDays: yup.number().integer().positive().defined(),
    productSlugs: yup.array(yup.string().defined()).defined(),
    transactionTypes: yup.array(yup.string().oneOf(Object.values(TransactionTypes)).defined()).defined(),
  })
  .json()
  .defined()
  .camelCase()

export enum PipeModels {
  ChurnUntimed = 'churn_untimed',
}

export enum PipeValueFields {
  Prediction = 'prediction',
}

export enum PipeBlogToUserAggregationMethod {
  Max = 'max',
  Min = 'min',
}

export interface MetricPipeParams {
  model: PipeModels
  valueField: PipeValueFields
  blogToUserAggregationMethod: PipeBlogToUserAggregationMethod
  extraAnalysisWindowDays: number
}
export const metricPipeParamsSchema: ObjectSchema<MetricPipeParams> = yup
  .object({
    model: yup.string().oneOf(Object.values(PipeModels)).defined(),
    valueField: yup.string().oneOf(Object.values(PipeValueFields)).defined(),
    blogToUserAggregationMethod: yup.string().oneOf(Object.values(PipeBlogToUserAggregationMethod)).defined(),
    extraAnalysisWindowDays: yup.number().integer().positive().defined(),
  })
  .json()
  .defined()
  .camelCase()

export enum MetricParameterType {
  Conversion = 'conversion',
  Revenue = 'revenue',
  Pipe = 'pipe',
}

// We are defining a noTest version of the metric schema due to the interdependencies in the the types for the tests:
export type Metric = {
  metricId: IdType
  name: NameType
  description: string
  higherIsBetter: boolean
  parameterType: MetricParameterType
  eventParams?: Event[] | null
  revenueParams?: MetricRevenueParams | null
  pipeParams?: MetricPipeParams | null
  tags?: TagFull[]
}
type MetricParamsField = 'eventParams' | 'revenueParams' | 'pipeParams'
const noTestMetricSchema: ObjectSchema<Metric> = yup
  .object({
    metricId: idSchema.defined(),
    name: nameSchema.defined(),
    description: yup.string().defined(),
    parameterType: yup.string().oneOf(Object.values(MetricParameterType)).defined(),
    higherIsBetter: yup.boolean().defined(),
    eventParams: yup.mixed().when('parameterType', {
      is: MetricParameterType.Conversion,
      then: (_schema) => yup.array(eventSchema).defined().json(),
      otherwise: (_schema) => yupNullOnly,
    }) as MixedSchema<Event[] | undefined | null>,
    revenueParams: yup.mixed().when('parameterType', {
      is: MetricParameterType.Revenue,
      then: (_schema) => metricRevenueParamsSchema.defined(),
      otherwise: (_schema) => yupNullOnly,
    }) as MixedSchema<MetricRevenueParams | undefined | null>,
    pipeParams: yup.mixed().when('parameterType', {
      is: MetricParameterType.Pipe,
      then:
        // istanbul ignore next; trivial
        (_schema) => metricPipeParamsSchema.defined(),
      otherwise: (_schema) => yupNullOnly,
    }) as MixedSchema<MetricPipeParams | undefined | null>,
    tags: yup.array(tagFullSchema) as ArraySchema<TagFull[] | undefined, yup.AnyObject, undefined, ''>,
  })
  .defined()
  .camelCase()

export const metricParameterTypeToParameterField: Record<MetricParameterType, keyof Omit<Metric, 'metricId'>> = {
  [MetricParameterType.Conversion]: 'eventParams',
  [MetricParameterType.Revenue]: 'revenueParams',
  [MetricParameterType.Pipe]: 'pipeParams',
} as const

export const metricSchema: ObjectSchema<Metric> = noTestMetricSchema
  // Note: Ignoring no-unsafe-member-access is fine here, as exceptions will turn into validation errors.
  .test('expected-params', 'Missing expected params field for parameter type.', (metric) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return !!metric[metricParameterTypeToParameterField[metric.parameterType as string as MetricParameterType]]
  })
  .test('unexpected-params', 'Unexpected params found not matching parameter type.', (metric) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return (
      Object.values(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        _.omit(metricParameterTypeToParameterField, metric.parameterType),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ).filter((parameterField) => metric[parameterField as MetricParamsField]).length === 0
    )
  })
export type MetricNew = Omit<Metric, 'metricId' | 'tags'> & {
  metricId?: IdType | null
  tags: IdType[]
}
export const metricNewSchema: ObjectSchema<MetricNew> = metricSchema.shape({
  metricId: idSchema.nullable().notRequired(),
  // Used by Formik and AbacusAutocomplete when editing assigned tags.
  tags: yup.array(idSchema.defined()).defined(),
})
export const metricNewOutboundSchema = transformSchemaFieldNames(metricNewSchema, tinyCase.snakeCase)
  .snakeCase()
  .transform(
    // istanbul ignore next; Tested by integration
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    (currentValue) => ({
      ...currentValue,
      revenueParams: undefined,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      revenue_params: currentValue.revenue_params
        ? transformSchemaFieldNames(metricRevenueParamsSchema, tinyCase.snakeCase)
            .snakeCase()
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            .cast(currentValue.revenue_params)
        : undefined,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      pipe_params: currentValue.pipe_params
        ? transformSchemaFieldNames(metricPipeParamsSchema, tinyCase.snakeCase)
            .snakeCase()
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            .cast(currentValue.pipe_params)
        : undefined,
    }),
  )
  .shape({
    tags: yup.array(transformSchemaFieldNames(yupPick(tagFullSchema, ['tagId']), tinyCase.snakeCase).snakeCase()),
  })
export interface MetricNewOutbound extends yup.InferType<typeof metricNewOutboundSchema> {}

export enum AttributionWindowSeconds {
  OneHour = 3600,
  SixHours = 21600,
  TwelveHours = 43200,
  TwentyFourHours = 86400,
  SeventyTwoHours = 259200,
  OneWeek = 604800,
  TwoWeeks = 1209600,
  ThreeWeeks = 1814400,
  FourWeeks = 2419200,
}

export interface MetricAssignmentNew {
  attributionWindowSeconds: AttributionWindowSeconds
  changeExpected: boolean
  isPrimary: boolean
  metricId: IdType
  minDifference: number
}
export const metricAssignmentNewSchema: ObjectSchema<MetricAssignmentNew> = yup
  .object({
    attributionWindowSeconds: yup
      .number()
      .integer()
      .positive()
      .oneOf(Object.values(AttributionWindowSeconds) as number[])
      .defined() as yup.Schema<AttributionWindowSeconds>,
    changeExpected: yup.bool().defined(),
    isPrimary: yup.bool().defined(),
    metricId: idSchema.defined(),
    minDifference: yup.number().defined().positive(),
  })
  .defined()
  .camelCase()
export const metricAssignmentNewOutboundSchema = transformSchemaFieldNames(
  metricAssignmentNewSchema,
  tinyCase.snakeCase,
).snakeCase()

export type MetricAssignment = MetricAssignmentNew & {
  metricAssignmentId: IdType
}
export const metricAssignmentSchema: ObjectSchema<MetricAssignment> = metricAssignmentNewSchema
  .shape({
    metricAssignmentId: idSchema.defined(),
  })
  .defined()
  .camelCase()

export enum SegmentType {
  Country = 'country',
  Locale = 'locale',
}

export interface Segment {
  segmentId: IdType
  name: string
  type: SegmentType
}
export const segmentSchema: ObjectSchema<Segment> = yup
  .object({
    segmentId: idSchema.defined(),
    name: yup.string().defined(),
    type: yup.string().oneOf(Object.values(SegmentType)).defined(),
  })
  .defined()
  .camelCase()

export interface SegmentAssignmentNew {
  segmentId: IdType
  isExcluded: boolean
}
export const segmentAssignmentNewSchema: ObjectSchema<SegmentAssignmentNew> = yup
  .object({
    segmentId: idSchema.defined(),
    isExcluded: yup.bool().defined(),
  })
  .defined()
  .camelCase()
export const segmentAssignmentNewOutboundSchema = transformSchemaFieldNames(
  segmentAssignmentNewSchema,
  tinyCase.snakeCase,
).snakeCase()

export type SegmentAssignment = SegmentAssignmentNew & {
  segmentAssignmentId: IdType
}
export const segmentAssignmentSchema = segmentAssignmentNewSchema
  .shape({
    segmentAssignmentId: idSchema.defined(),
  })
  .defined()
  .camelCase()

export interface VariationNew {
  name: string
  isDefault: boolean
  allocatedPercentage: number
}
export const variationNewSchema: ObjectSchema<VariationNew> = yup
  .object({
    name: nameSchema.defined(),
    isDefault: yup.bool().defined(),
    allocatedPercentage: yup.number().integer().min(1).max(99).defined(),
  })
  .defined()
  .camelCase()
export const variationNewOutboundSchema = transformSchemaFieldNames(variationNewSchema, tinyCase.snakeCase).snakeCase()

export type Variation = VariationNew & {
  variationId: IdType
}
export const variationSchema = variationNewSchema
  .shape({
    variationId: idSchema.defined(),
  })
  .defined()
  .camelCase()

export enum Platform {
  Akismet = 'akismet',
  Calypso = 'calypso',
  Dayone = 'dayone',
  Dsp = 'dsp',
  Email = 'email',
  Jetpack = 'jetpack',
  Lohp = 'lohp',
  Mlsales = 'mlsales',
  Pipe = 'pipe',
  Tumblr = 'tumblr',
  Wccom = 'wccom',
  Woocommerce = 'woocommerce',
  Woocommerceandroid = 'woocommerceandroid',
  Woocommerceios = 'woocommerceios',
  Wpandroid = 'wpandroid',
  Wpcom = 'wpcom',
  Wpios = 'wpios',
}

export enum Status {
  Staging = 'staging',
  Running = 'running',
  Completed = 'completed',
  Disabled = 'disabled',
}

export enum AssignmentCacheStatus {
  Fresh = 'fresh',
  Missing = 'missing',
  Stale = 'stale',
}

export interface DistributionStats {
  mean: ExtendedNumber
  top_99: ExtendedNumber | null
  bottom_99: ExtendedNumber | null
  top_95: ExtendedNumber
  bottom_95: ExtendedNumber
  top_50: ExtendedNumber | null
  bottom_50: ExtendedNumber | null
}
export const distributionStatsSchema: ObjectSchema<DistributionStats> = yup
  .object({
    mean: extendedNumberSchema,
    top_99: extendedNumberSchema.nullable(),
    bottom_99: extendedNumberSchema.nullable(),
    top_95: extendedNumberSchema,
    bottom_95: extendedNumberSchema,
    top_50: extendedNumberSchema.nullable(),
    bottom_50: extendedNumberSchema.nullable(),
  })
  .defined()
  .camelCase()

export interface MetricEstimates {
  variations: Record<string, DistributionStats>
  diffs: Record<string, DistributionStats>
  ratios: Record<string, DistributionStats>
}
export const metricEstimatesSchema: ObjectSchema<MetricEstimates> = (
  yup.object({
    variations: yup.object().defined(),
    diffs: yup.object().defined(),
    ratios: yup.object().defined(),
  }) as ObjectSchema<MetricEstimates>
)
  .defined()
  .camelCase()

export enum AnalysisStrategy {
  IttPure = 'itt_pure',
  MittNoSpammers = 'mitt_no_spammers',
  MittNoCrossovers = 'mitt_no_crossovers',
  MittNoSpammersNoCrossovers = 'mitt_no_spammers_no_crossovers',
  PpNaive = 'pp_naive',
}

export interface Analysis {
  metricAssignmentId: IdType
  analysisDatetime: DateType
  analysisStrategy: AnalysisStrategy
  participantStats: Record<string, number>
  metricEstimates: MetricEstimates | null
}
export const analysisSchema: ObjectSchema<Analysis> = yup
  .object({
    metricAssignmentId: idSchema.defined(),
    analysisDatetime: dateSchema.defined(),
    analysisStrategy: yup.string().oneOf(Object.values(AnalysisStrategy)).defined(),
    // These can be validated further in yup but it isn't performant to do it simply (using lazy) and although
    // there is a performant way to do so (higher up lazy) it isn't worth it complexity wise.
    participantStats: yup.object().defined() as yup.Schema<Record<string, number>>,
    metricEstimates: metricEstimatesSchema.nullable().defined(),
  })
  .defined()
  .camelCase()

interface AnalysisResponse {
  analyses: Analysis[]
}
export const analysisResponseSchema: ObjectSchema<AnalysisResponse> = yup
  .object({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    analyses: yup.array(analysisSchema).defined() as yup.ArraySchema<Analysis[], yup.AnyObject, any, ''>,
  })
  .defined()

export const MAX_DISTANCE_BETWEEN_NOW_AND_START_DATE_IN_MONTHS = 12
export const MAX_DISTANCE_BETWEEN_START_AND_END_DATE_IN_MONTHS = 12
export interface ExperimentBare {
  experimentId: IdType
  name: NameType
  startDatetime: DateType | null
  endDatetime: DateType | null
  status: Status
  platform: Platform
  ownerLogin: string
}
export const experimentBareSchema: ObjectSchema<ExperimentBare> = yup
  .object({
    experimentId: idSchema.defined(),
    name: nameSchema.defined(),
    startDatetime: dateSchema.defined().nullable(),
    endDatetime: dateSchema
      .defined()
      .nullable()
      .when('startDatetime', ([startDatetime], schema) =>
        // istanbul ignore next; trivial
        startDatetime ? schema.min(startDatetime, 'End date must be after start date.') : schema,
      ),
    status: yup.string().oneOf(Object.values(Status)).defined(),
    platform: yup.string().oneOf(Object.values(Platform)).defined(),
    ownerLogin: yup.string().defined(),
  })
  .defined()
  .camelCase()

export type ExperimentSummary = ExperimentBare & {
  analyses: Analysis[]
  description: string
}
export const experimentSummarySchema = experimentBareSchema.shape({
  analyses: yup.array(analysisSchema).defined(),
  description: yup.string().defined(),
})

export interface ExperimentSummaryResponse {
  experiments: ExperimentSummary[]
}
export const experimentSummaryResponse = yup
  .object({
    experiments: yup.array(experimentSummarySchema).defined(),
  })
  .defined()

export type ExperimentFull = ExperimentBare & {
  description: string
  existingUsersAllowed: boolean
  p2Url?: string | null
  endReason?: string | null
  conclusionUrl?: string | null
  deployedVariationId?: number | null
  exposureEvents: Event[] | null
  metricAssignments: MetricAssignment[]
  segmentAssignments: SegmentAssignment[]
  variations: Variation[]
  exclusionGroupTagIds?: IdType[] | undefined
  assignmentCacheStatus: AssignmentCacheStatus
}
export const experimentFullSchema: ObjectSchema<ExperimentFull> = experimentBareSchema
  .shape({
    analyses: yupUndefined,
    description: yup.string().defined(),
    existingUsersAllowed: yup.boolean().defined(),
    p2Url: yup.string().url().nullable(),
    endReason: yup.string().nullable(),
    conclusionUrl: yup.string().url().nullable(),
    deployedVariationId: idSchema.nullable().notRequired(),
    exposureEvents: yup.array(eventSchema).defined().nullable(),
    metricAssignments: yup.array(metricAssignmentSchema).defined().min(1),
    segmentAssignments: yup.array(segmentAssignmentSchema).defined(),
    variations: yup.array(variationSchema).defined().min(2),
    exclusionGroupTagIds: yup.array(idSchema.defined()),
    assignmentCacheStatus: yup.string().oneOf(Object.values(AssignmentCacheStatus)).defined(),
  })
  .defined()
  .camelCase()

const now = new Date()

export const experimentFullNewSchema = experimentFullSchema.shape({
  experimentId: idSchema.nullable().notRequired(),
  status: yupUndefined,
  assignmentCacheStatus: yupUndefined,
  p2Url: yup.string().url().nullable().notRequired(),
  conclusionUrl: yup.string().url().nullable().notRequired(),
  endReason: yup.string().nullable().notRequired(),
  startDatetime: dateSchema
    .notRequired()
    .nullable()
    .test(
      'future-start-date',
      'Start date (UTC) must be in the future.',
      // We need to refer to new Date() instead of using dateFns.isFuture so MockDate works with this in the tests.
      (date) => date === null || date === undefined || dateFns.isBefore(new Date(), date),
    )
    .test(
      'bounded-start-date',
      `Start date must be within ${MAX_DISTANCE_BETWEEN_NOW_AND_START_DATE_IN_MONTHS} months from now.`,
      // We need to refer to new Date() instead of using dateFns.isFuture so MockDate works with this in the tests.
      (date) =>
        date === null ||
        date === undefined ||
        dateFns.isBefore(date, dateFns.addMonths(now, MAX_DISTANCE_BETWEEN_NOW_AND_START_DATE_IN_MONTHS)),
    ),
  endDatetime: dateSchema
    .notRequired()
    .nullable()
    .when('startDatetime', ([startDatetime], schema) =>
      startDatetime && startDatetime instanceof Date
        ? schema
            .min(startDatetime, 'End date must be after start date.')
            .max(
              dateFns.addMonths(startDatetime, MAX_DISTANCE_BETWEEN_START_AND_END_DATE_IN_MONTHS),
              `End date must be within ${MAX_DISTANCE_BETWEEN_START_AND_END_DATE_IN_MONTHS} months of start date.`,
            )
        : schema,
    ),
  exposureEvents: yup.array(eventNewSchema).notRequired(),
  metricAssignments: yup
    .array(metricAssignmentNewSchema)
    .defined()
    .min(1, 'At least one metric assignment is required.')
    .test(
      'primary-metric-assignment',
      `One primary metric assignment is required.`,
      (metricAssignments: MetricAssignmentNew[]) =>
        Array.isArray(metricAssignments) && metricAssignments.some((metricAssignment) => metricAssignment.isPrimary),
    ),
  segmentAssignments: yup.array(segmentAssignmentNewSchema).defined(),
  variations: yup
    .array(variationNewSchema)
    .defined()
    .min(2)
    .test(
      'default-variation-exists',
      'A default variation is required.',
      (variations: VariationNew[]) => variations && variations.some((variation) => variation.isDefault),
    )
    .test(
      'max-total',
      'The sum of allocated percentages must be less than or equal to 100.',
      (variations: VariationNew[]) =>
        variations &&
        variations.reduce((acc: number, variation) => acc + Number(variation.allocatedPercentage), 0) <= 100,
    )
    .test(
      'unique-names',
      'Variation names must be unique.',
      (variations: VariationNew[]) => variations && new Set(variations.map((x) => x.name)).size === variations.length,
    ),
})
export interface ExperimentFullNew extends yup.InferType<typeof experimentFullNewSchema> {}
/**
 * For casting use only.
 */
export const experimentFullNewOutboundSchema = transformSchemaFieldNames(experimentFullNewSchema, tinyCase.snakeCase)
  .shape({
    exposure_events: yup.array(eventSchema).defined().nullable(),
    // Due to the snakeCase function we end up with p_2_url instead of p2_url, so we fix that here:
    p_2_url: yupUndefined,
    p2_url: yup.string().url().defined().nullable(),
    start_datetime: yup.string().defined().nullable(),
    end_datetime: yup.string().defined().nullable(),
    metric_assignments: yup.array(metricAssignmentNewOutboundSchema).defined(),
    segment_assignments: yup.array(segmentAssignmentNewOutboundSchema).defined(),
    variations: yup.array(variationNewOutboundSchema).defined(),
  })
  .snakeCase()
  .transform(
    // istanbul ignore next; Tested by integration
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    (currentValue) => ({
      ...currentValue,
      // Due to the snakeCase function we end up with p_2_url instead of p2_url, so we fix that here:
      p_2_url: undefined,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
      p2_url: currentValue.p_2_url,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
      start_datetime:
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
        currentValue?.start_datetime instanceof Date
          ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
            currentValue.start_datetime.toISOString()
          : // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
            currentValue?.start_datetime,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
      end_datetime:
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
        currentValue?.end_datetime instanceof Date
          ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
            currentValue.end_datetime.toISOString()
          : // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
            currentValue?.end_datetime,
      // Converting EventNew to Event
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      exposure_events: currentValue.exposure_events.map(
        (event: EventNew): Event => ({
          event: event.event,
          props:
            event.props && event.props.length > 0
              ? _.fromPairs(event.props.map(({ key, value }) => [key, value]))
              : undefined,
        }),
      ),
    }),
  )

export const autocompleteItemSchema = yup
  .object({
    name: yup.string().defined(),
    value: yup.mixed<number | string>().defined(),
  })
  .required()
export interface AutocompleteItem extends yup.InferType<typeof autocompleteItemSchema> {}

/**
 * @deprecated We want schemas for data types, not for request shapes. Use inline yup schemas instead.
 */
export const autocompleteSchema = yup
  .object({
    completions: yup.array(autocompleteItemSchema).defined(),
  })
  .defined()

export const eventPropsSchema = yup
  .object({
    name: yup.string().defined(),
    description: yup.string().defined(),
  })
  .defined()
export interface EventProp extends yup.InferType<typeof eventPropsSchema> {}

export const eventDetailsSchema = yup
  .object({
    name: yup.string().defined(),
    description: yup.string().defined(),
    owner: yup.string().defined(),
    is_registered: yup.boolean().defined(),
    is_validated: yup.boolean().defined(),
    props: yup.array(eventPropsSchema).defined(),
  })
  .defined()
export interface EventDetails extends yup.InferType<typeof eventDetailsSchema> {}

/**
 * The yup equivalant of _.pick, produces a subset of the original schema.
 *
 * @param schema A yup object schema
 * @param props Properties to pick
 * @param value See yup.reach
 * @param context See yup.reach
 */
export function yupPick(
  schema: yup.ObjectSchema<yup.AnyObject>,
  props: string[],
  value?: unknown,
  context?: unknown,
  // eslint-disable-next-line @typescript-eslint/ban-types
): ObjectSchema<{} | undefined> {
  return yup.object(_.fromPairs(props.map((prop) => [prop, yup.reach(schema, prop, value, context)])))
}
