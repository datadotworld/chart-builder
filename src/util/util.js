// @flow
import React from 'react'
import { Tooltip } from 'react-bootstrap'

export function parseParams(searchString: String) {
  const query = new URLSearchParams(searchString)
  const obj = {}
  for (let entry of query) {
    obj[entry[0]] = entry[1]
  }
  return obj
}

export function createParams(objOrString: Object | string) {
  if (typeof objOrString === 'string') return new URLSearchParams(objOrString)

  const query = new URLSearchParams()
  for (let key in objOrString) {
    query.set(key, objOrString[key])
  }
  return query
}

export function getDownloadName(baseName: string, extension: string) {
  const dateStr = new Date().toISOString().replace(/[.:]/g, '-')
  return `${baseName}-${dateStr}.${extension}`
}

export function encodeFieldName(name: string) {
  return name.replace(/([.[\]])/g, '\\$1')
}

export function tooltipOverlay(id: string, description: string) {
  return <Tooltip id={id}>{description}</Tooltip>
}

type PossibleFieldType = {| name: string, rdfType?: string |}
// sometimes a `field` doesn't contain an `rdfType`. we'll fallback to `string` in that case
export function fixupJsonFields(fields: Array<PossibleFieldType>) {
  const mapped: Array<PossibleFieldType> = fields.map(f => ({
    rdfType: 'http://www.w3.org/2001/XMLSchema#string',
    ...f
  }))

  return mapped
}
