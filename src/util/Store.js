// @flow
import { types } from 'mobx-state-tree'
import sparqlTypeToVegaType from './sparqlTypeToVegaType'
import { parseParams, encodeFieldName } from './util'
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

export const Field: ModelType<FieldType> = types
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
  sortField: ?EncLineType,

  // views
  autoType: string,
  appliedType: string,

  // actions
  setField: (f: null | FieldType) => void,
  setChannel: (channel: string) => void,
  setType: (type: string) => void,
  setAggregate: (aggregate: string) => void,
  setBin: (bin: boolean) => void,
  setZero: (zero: boolean) => void,
  setScale: (scale: string) => void,
  setSort: (sort: string) => void,
  setTimeUnit: (t: null | string) => void,
  setSortField: (e: null | EncLineType) => void
}

let currentEncLineID = 0

export const EncLine: ModelType<EncLineType> = types
  .model('EncLine', {
    _id: types.identifier(types.number),

    field: types.maybe(types.reference(Field)),
    channel: types.optional(types.string, 'x'),
    type: types.optional(types.string, 'auto'),

    bin: types.optional(types.boolean, false),
    aggregate: types.maybe(types.string),
    zero: types.optional(types.boolean, true),
    scale: types.optional(types.string, 'linear'),
    sort: types.optional(
      types.enumeration(['none', 'ascending', 'descending']),
      'ascending'
    ),
    timeUnit: types.maybe(types.string),
    sortField: types.maybe(types.reference(types.late(() => EncLine)))
  })
  .views(self => ({
    get autoType() {
      return self.field ? self.field.typeDerivedFromRdfType : null
    },
    get appliedType() {
      return self.type === 'auto' ? self.autoType : self.type
    }
  }))
  .actions(self => ({
    setField(f: null | FieldType) {
      if (self.field && self.field.name === '*' && self.aggregate === 'count') {
        self.aggregate = null
      }
      self.field = f
      if (f && f.name === '*') {
        self.aggregate = 'count'
      }
    },
    setChannel(channel: string) {
      self.channel = channel
    },
    setType(type: EncodingType) {
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
    },
    setSortField(e: null | EncLineType) {
      self.sortField = e
    }
  }))
  .preProcessSnapshot(snapshot => ({
    ...snapshot,
    aggregate: snapshot.aggregate === 'none' ? null : snapshot.aggregate,
    _id: snapshot._id == null ? currentEncLineID++ : snapshot._id
  }))

export type ChartConfigType = {
  title: null | string,
  mark: string,
  encodings: Array<EncLineType>,
  manualSpec: null | string,
  width: null | number,
  height: null | number,

  // views
  hasPossiblyValidChart: boolean,
  hasManualSpec: boolean,
  hasFacetField: boolean,
  generatedSpec: Object,
  getMinimumAmountOfData: (data: Array<Object>) => Array<Object>,
  getSpecWithMinimumAmountOfData: (data: Array<Object>) => Object,

  // actions
  setTitle: (title: string) => void,
  setMark: (mark: string) => void,
  addEncoding: () => void,
  setManualSpec: (s: null | string) => void,
  setDimensions: (w: null | number, h: null | number) => void,
  removeEncoding: (e: EncLineType) => void
}

export const ChartConfig = types
  .model('ChartConfig', {
    title: types.maybe(types.string),
    mark: types.optional(types.string, 'bar'),
    encodings: types.optional(types.array(EncLine), () => []),
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
          const sortOrder =
            e.sort === 'none'
              ? null
              : e.sort === 'ascending'
                ? undefined
                : e.sort

          const sort =
            e.sortField && e.sortField.field
              ? {
                  field: e.sortField.field.name,
                  op:
                    e.sortField.aggregate === null
                      ? 'average'
                      : e.sortField.aggregate,
                  order: sortOrder
                }
              : sortOrder

          const enc = {
            field: encodeFieldName(e.field.name),
            type: e.appliedType,
            bin: e.bin || undefined,
            aggregate: e.aggregate === null ? undefined : e.aggregate,
            sort,

            timeUnit: e.timeUnit || undefined,
            scale: {
              type: e.scale,
              zero: e.zero
            }
          }

          // concat tooltips instead of overrriding
          if (e.channel === 'tooltip' && encoding[e.channel]) {
            const existing = encoding[e.channel]
            encoding[e.channel] = [
              ...(Array.isArray(existing) ? existing : [existing]),
              enc
            ]
          } else {
            encoding[e.channel] = enc
          }
        }
      })

      return {
        $schema: 'https://vega.github.io/schema/vega-lite/v2.json',
        title: self.title || undefined,
        width: self.hasFacetField ? undefined : self.width || undefined,
        height: self.hasFacetField ? undefined : self.height || undefined,
        autosize:
          !self.hasFacetField && (self.width || self.height)
            ? {
                type: 'fit',
                contains: 'padding'
              }
            : undefined,
        mark: { type: self.mark },
        encoding,
        data: { name: 'source' },
        config: { background: '#ffffff', padding: 20 }
      }
    },
    getMinimumAmountOfData(data: Array<Object>) {
      // if they've defined a manual spec, they could be using anything
      if (self.hasManualSpec) return data

      // otherwise, they should only be using fields that we know about
      const wantedFields: Array<string> = [
        ...new Set(
          self.encodings
            .filter(e => e.field)
            .map(e => (e.field ? e.field.name : ''))
        )
      ]

      return data.map(d => {
        const obj = {}
        wantedFields.forEach(w => {
          obj[w] = d[w]
        })
        return obj
      })
    },
    getSpecWithMinimumAmountOfData(data: Array<Object>) {
      const values = self.getMinimumAmountOfData(data)

      return {
        ...self.generatedSpec,
        data: {
          values: values
        }
      }
    }
  }))
  .actions((self: ChartConfigType) => ({
    setMark(mark: string) {
      self.mark = mark
    },
    addEncoding() {
      const encoding = EncLine.create()
      self.encodings.push(encoding)
      return encoding
    },
    removeEncoding(e: EncLineType) {
      self.encodings.forEach(enc => {
        if (enc.sortField === e) enc.sortField = null
      })
      ;(self.encodings: any).remove(e)
    },
    setManualSpec(s: null | string) {
      self.manualSpec = s
    },
    setDimensions(w: null | number, h: null | number) {
      self.width = w
      self.height = h
    },
    setTitle(t: string) {
      self.title = t || null
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
    token: types.optional(types.string, ''),

    location: types.frozen,

    fields: types.optional(types.array(Field), []),
    config: types.optional(ChartConfig, {})
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
