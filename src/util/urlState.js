// @flow
import lzString from 'lz-string'
import { applySnapshot, getSnapshot } from 'mobx-state-tree'

export function restoreFromStateString(
  store: Object,
  stateString: string,
  mergeOpts: Object
) {
  const decompressed: string = lzString.decompressFromEncodedURIComponent(
    stateString
  )
  const data = {
    ...JSON.parse(decompressed),
    ...mergeOpts
  }
  applySnapshot(store, data)
}

export function getStateString(store: Object): string {
  const snap = getSnapshot(store)
  const sanitized = {
    version: 1,
    location: snap.location
      ? {
          search: snap.location.search
        }
      : undefined,
    config: snap.config
  }

  const data = JSON.stringify(sanitized)
  return lzString.compressToEncodedURIComponent(data)
}

export function getStateUrl(store: Object) {
  return document.location.origin + '/?s=' + getStateString(store)
}
