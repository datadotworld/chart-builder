// @flow

export function parseParams(searchString: String) {
  const query = new URLSearchParams(searchString)
  const obj = {}
  for (let entry of query) {
    obj[entry[0]] = entry[1]
  }
  return obj
}
