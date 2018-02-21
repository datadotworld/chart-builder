// @flow
import { types } from 'mobx-state-tree'
import sparqlTypeToVegaType from './sparqlTypeToVegaType'
import { parseParams } from './util'
import type {
  EncodingChannel,
  EncodingType,
  TimeUnitType,
  SortType
} from './types'

type ModelType<T> = {
  create: (o?: Object) => T
}

export type FieldType = {
  // model
  name: string,
  label: ?string,
  rdfType: string,

  // views
  typeDerivedFromRdfType: string
}

const Field: ModelType<FieldType> = types
  .model('Field', {
    name: types.identifier(types.string),
    label: types.maybe(types.string),
    rdfType: types.string
  })
  .views(self => ({
    get typeDerivedFromRdfType() {
      return sparqlTypeToVegaType(self.rdfType)
    }
  }))

export type EncLineType = {
  _id: number,
  field: null | FieldType,
  channel: EncodingChannel,
  type: EncodingType,

  bin: boolean,
  aggregate: string,
  zero: boolean,
  scale: string,
  sort: SortType,
  timeUnit: TimeUnitType,

  // views
  autoType: string,

  // actions
  setField: (f: null | FieldType) => void,
  setChannel: (channel: string) => void,
  setType: (type: string) => void,
  setAggregate: (aggregate: string) => void,
  setBin: (bin: boolean) => void,
  setZero: (zero: boolean) => void,
  setScale: (scale: string) => void,
  setSort: (sort: string) => void,
  setTimeUnit: (t: null | string) => void
}

let currentEncLineID = 0

const EncLine: ModelType<EncLineType> = types
  .model('EncLine', {
    _id: types.optional(types.number, () => currentEncLineID++),

    field: types.maybe(types.reference(Field)),
    channel: types.optional(types.string, 'x'),
    type: types.optional(types.string, 'auto'),

    bin: types.optional(types.boolean, false),
    aggregate: types.optional(types.string, 'none'),
    zero: types.optional(types.boolean, true),
    scale: types.optional(types.string, 'linear'),
    sort: types.optional(
      types.enumeration(['ascending', 'descending']),
      'ascending'
    ),
    timeUnit: types.maybe(types.string)
  })
  .views(self => ({
    get autoType() {
      return self.field ? self.field.typeDerivedFromRdfType : null
    }
  }))
  .actions(self => ({
    setField(f: null | FieldType) {
      if (self.field && self.field.name === '*' && self.aggregate === 'count') {
        self.aggregate = 'none'
      }
      self.field = f
      if (f && f.name === '*') {
        self.aggregate = 'count'
      }
    },
    setChannel(channel: string) {
      self.channel = channel
    },
    setType(type: string) {
      self.type = type
    },
    setAggregate(aggregate: string) {
      self.aggregate = aggregate
    },
    setBin(bin: boolean) {
      self.bin = bin
    },
    setZero(zero: boolean) {
      self.zero = zero
    },
    setScale(scale: string) {
      self.scale = scale
    },
    setSort(sort: string) {
      self.sort = sort
    },
    setTimeUnit(t: null | string) {
      self.timeUnit = t
    }
  }))

export type ChartConfigType = {
  mark: string,
  encodings: Array<EncLineType>,
  manualSpec: null | string,
  width: ?number,
  height: ?number,

  // views
  hasPossiblyValidChart: boolean,
  hasManualSpec: boolean,
  hasFacetField: boolean,
  generatedSpec: Object,

  // actions
  setMark: (mark: string) => void,
  addEncoding: () => void,
  setManualSpec: (s: null | string) => void,
  setDimensions: (w: number, h: number) => void
}

const ChartConfig = types
  .model('ChartConfig', {
    mark: types.optional(types.string, 'bar'),
    encodings: types.array(EncLine),
    manualSpec: types.maybe(types.string),
    width: types.maybe(types.number),
    height: types.maybe(types.number)
  })
  .views((self: ChartConfigType) => ({
    get hasPossiblyValidChart() {
      return self.encodings.some(e => e.field)
    },
    get hasManualSpec() {
      return !!self.manualSpec
    },
    get hasFacetField() {
      return self.encodings.some(
        e => e.field && (e.channel === 'row' || e.channel === 'column')
      )
    },
    get generatedSpec() {
      if (self.manualSpec) {
        try {
          const obj = JSON.parse(self.manualSpec)
          return obj
        } catch (e) {}
      }

      const encoding = {}
      self.encodings.forEach(e => {
        if (e.field) {
          const enc = {
            field: e.field.name,
            type: e.type === 'auto' ? e.autoType : e.type,
            bin: e.bin || undefined,
            aggregate: e.aggregate === 'none' ? undefined : e.aggregate,
            sort: e.sort === 'ascending' ? undefined : e.sort,
            timeUnit: e.timeUnit || undefined,
            scale: {
              type: e.scale,
              zero: e.zero
            }
          }
          encoding[e.channel] = enc
        }
      })

      return {
        $schema: 'https://vega.github.io/schema/vega-lite/v2.json',
        width: self.hasFacetField ? undefined : self.width || undefined,
        height: self.hasFacetField ? undefined : self.height || undefined,
        autosize:
          !self.hasFacetField && (self.width || self.height)
            ? {
                type: 'fit',
                contains: 'padding'
              }
            : undefined,
        mark: self.mark,
        encoding,
        data: { name: 'source' },
        config: { background: '#ffffff', padding: 20 }
      }
    }
  }))
  .actions((self: ChartConfigType) => ({
    setMark(mark: string) {
      self.mark = mark
    },
    addEncoding() {
      self.encodings.push(EncLine.create())
    },
    removeEncoding(e: EncLineType) {
      ;(self.encodings: any).remove(e)
    },
    setManualSpec(s: null | string) {
      self.manualSpec = s
    },
    setDimensions(w: null | number, h: null | number) {
      self.width = w
      self.height = h
    }
  }))

export type StoreType = {
  token: string,
  location: Object,
  fields: Array<FieldType>,
  config: ChartConfigType,

  // views
  parsedUrlQuery: Object,
  hasValidParams: boolean,
  agentid: string,
  datasetid: string,
  query: string,

  // actions
  syncQueryParams: Object => void,
  reset: () => void,
  setToken: string => void,
  setFields: (Array<FieldType>) => void,
  setBrowserLocation: Object => void,
  addBrowserHistoryListener: Object => void
}

const Store: ModelType<StoreType> = types
  .model('Store', {
    token: types.string,

    location: types.frozen,

    fields: types.optional(types.array(Field), []),
    config: ChartConfig
  })
  .views((self: StoreType) => ({
    get hasValidParams() {
      return !!self.agentid && !!self.datasetid && !!self.query
    },

    get parsedUrlQuery() {
      return parseParams(self.location.search)
    },

    get agentid() {
      return self.parsedUrlQuery.agentid
    },
    get datasetid() {
      return self.parsedUrlQuery.datasetid
    },
    get query() {
      return self.parsedUrlQuery.query
    }
  }))
  .actions((self: StoreType) => ({
    syncQueryParams(obj) {
      Object.assign(self, obj)
    },
    reset() {
      self.config = ({
        mark: 'bar',
        encodings: [
          EncLine.create({ channel: 'x' }),
          EncLine.create({ channel: 'y' }),
          EncLine.create({ channel: 'color' })
        ]
      }: any)
    },
    setToken(token: string) {
      self.token = token
    },
    setFields(f: Array<FieldType>) {
      self.fields = f
    },
    setBrowserLocation(location: Object) {
      self.location = location
    },
    addBrowserHistoryListener(history: any) {
      self.setBrowserLocation(history.location)

      history.listen(self.setBrowserLocation)
    }
  }))

export default Store
