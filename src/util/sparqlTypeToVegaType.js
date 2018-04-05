// @flow
import type { EncodingType } from './types'

const typeMap: { [string]: ?EncodingType } = {
  string: 'nominal',
  boolean: 'nominal',
  duration: 'nominal',
  time: 'nominal',
  gYearMonth: 'nominal',
  gYear: 'nominal',
  gMonthDay: 'nominal',
  gDay: 'nominal',
  gMonth: 'nominal',
  hexBinary: 'nominal',
  base64Binary: 'nominal',
  anyURI: 'nominal',
  normalizedString: 'nominal',
  token: 'nominal',
  language: 'nominal',
  yearMonthDuration: 'nominal',
  dayTimeDuration: 'nominal',

  float: 'quantitative',
  double: 'quantitative',
  decimal: 'quantitative',
  integer: 'quantitative',
  nonPositiveInteger: 'quantitative',
  negativeInteger: 'quantitative',
  long: 'quantitative',
  int: 'quantitative',
  short: 'quantitative',
  byte: 'quantitative',
  nonNegativeInteger: 'quantitative',
  unsignedLong: 'quantitative',
  unsignedInt: 'quantitative',
  unsignedShort: 'quantitative',
  unsignedByte: 'quantitative',
  positiveInteger: 'quantitative',

  date: 'temporal',
  dateTime: 'temporal',
  dateTimeStamp: 'temporal'
}

export default function(datatype: string): EncodingType {
  const strippedType = datatype.replace('http://www.w3.org/2001/XMLSchema#', '')

  const t = typeMap[strippedType]
  return t || 'nominal'
}
