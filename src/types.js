// @flow
export type Field = {
  name: string,
  type: string,
  rdfType: string
}

export type Schema = {
  fields: Array<Field>
}

export type EncodingChannel =
  | 'x'
  | 'y'
  | 'x2'
  | 'y2'
  | 'color'
  | 'opacity'
  | 'size'
  | 'shape'
  | 'text'
  | 'tooltip'
  | 'href'
  | 'order'
  | 'detail'
  | 'row'
  | 'column'

export type MarkType =
  | 'area'
  | 'bar'
  | 'line'
  | 'point'
  | 'tick'
  | 'rect'
  | 'circle'
  | 'square'

export type EncodingType =
  | 'auto'
  | 'quantitative'
  | 'ordinal'
  | 'nominal'
  | 'temporal'

export type EncLineType = {
  field: ?Field,
  channel: EncodingChannel,
  type: string,

  bin: boolean,
  aggregate: string,
  zero: boolean,
  scale: string
}

export type ConfigType = {
  mark: MarkType,
  encodings: Array<EncLineType>
}
