import * as yup from 'yup'

/**
 * Transform an object schema's field names, returning a new schema.
 */
export function transformSchemaFieldNames<
  // eslint-disable-next-line @typescript-eslint/naming-convention
  TIn extends yup.Maybe<yup.AnyObject>,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  TContext = yup.AnyObject,
  // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-explicit-any
  TDefault = any,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  TFlags extends yup.Flags = '',
>(schema: yup.ObjectSchema<TIn, TContext, TDefault, TFlags>, transform: (fieldName: string) => string) {
  return yup.object(Object.fromEntries(Object.entries(schema.fields).map(([k, v]) => [transform(k), v])))
}
