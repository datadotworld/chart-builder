// @flow
import { extendObservable } from 'mobx'
import type { Field, EncodingChannel, EncodingType, TimeUnitType } from './types'

import sparqlTypeToVegaType from './sparqlTypeToVegaType'

type SortType = 'ascending' | 'descending'

type OptsType = {
  field?: null | Field,
  channel?: EncodingChannel,
  type?: EncodingType,

  bin?: boolean,
  aggregate?: string,
  zero?: boolean,
  scale?: string,
  sort?: SortType,
  timeUnit?: TimeUnitType
}

export default class EncLine {
  field: null | Field
  channel: EncodingChannel
  type: EncodingType

  bin: boolean
  aggregate: string
  zero: boolean
  scale: string
  sort: SortType
  timeUnit: null | TimeUnitType

  autoType: EncodingType

  constructor(opts: OptsType = {}) {
    extendObservable(this, {
      field: opts.field || null,
      channel: opts.channel || 'x',
      type: opts.type || 'auto',

      bin: opts.bin || false,
      aggregate: opts.aggregate || 'none',
      zero: opts.zero || true,
      scale: opts.scale || 'linear',
      sort: opts.sort || 'ascending',
      timeUnit: opts.timeUnit || null,

      get autoType() {
        return this.field ? sparqlTypeToVegaType(this.field.rdfType) : null
      }
    })
  }
}
