import _ from 'lodash'

/**
 * Formats the boolean as Yes or No.
 */
export function formatBoolean(bool: boolean): 'Yes' | 'No' {
  return bool ? 'Yes' : 'No'
}

/**
 * Precision to be inputed into _.round, to be used outside of graphs.
 */
const numberFormatPrecision = 2

export type NumberToString = (number: number) => string

/**
 * Formats a number by applying the default precision rounding
 */
export const standardNumberFormatter: NumberToString = (n) => `${_.round(n, numberFormatPrecision)}`

/**
 * Formats a number by applying the default precision rounding and localization
 * eg: comma separated thousands
 */
export const localizeNumber: NumberToString = (n) => _.round(n, numberFormatPrecision).toLocaleString()

/**
 * Formats a number by rendering it with fixed decimals (default precision) and localizing
 * eg: 1005.5 => 1,005.50
 */
export const localizeNumberToFixedDecimals: NumberToString = (n) =>
  n.toLocaleString(undefined, {
    maximumFractionDigits: numberFormatPrecision,
    minimumFractionDigits: numberFormatPrecision,
  })

/**
 * Formats a number by rounding to integer, replacing millions and thousands with M and K, and localizing
 */
export const abbreviateNumber: NumberToString = (n) => {
  if (Math.abs(n) > 1000000) {
    return `${(n / 1000000).toLocaleString(undefined, { maximumFractionDigits: 2 })}M`
  }
  if (Math.abs(n) > 1000) {
    return `${(n / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })}K`
  }
  return _.round(n).toLocaleString()
}
