// @flow
import { extendObservable } from 'mobx'
import type { Field, EncodingChannel, EncodingType } from './types'

import sparqlTypeToVegaType from './sparqlTypeToVegaType'

type OptsType = {
  field?: null | Field,
  channel?: EncodingChannel,
  type?: EncodingType,

  bin?: boolean,
  aggregate?: string,
  zero?: boolean,
  scale?: string
}

export default class EncLine {
  field: null | Field
  channel: EncodingChannel
  type: EncodingType

  bin: boolean
  aggregate: string
  zero: boolean
  scale: string

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

      get autoType() {
        return this.field ? sparqlTypeToVegaType(this.field.rdfType) : null
      }
    })
  }
}
