import {
  parseParams,
  createParams,
  getDownloadName,
  encodeFieldName,
  fixupJsonFields
} from '../util'

describe('parseParams', () => {
  it('works', () => {
    expect(parseParams('a=1&b=2')).toMatchSnapshot()
  })
})

describe('createParams', () => {
  it('works with string', () => {
    expect(new Map(createParams('a=1&b=2'))).toMatchSnapshot()
  })

  it('works with object', () => {
    expect(new Map(createParams({ a: 1, b: 2 }))).toMatchSnapshot()
  })
})

describe('getDownloadName', () => {
  it('works', () => {
    const RealDate = Date

    global.Date = class extends RealDate {
      constructor() {
        return new RealDate('2018-04-01T18:00:00.000Z')
      }
    }

    expect(getDownloadName('base-name', 'png')).toMatchSnapshot()
  })
})

describe('encodeFieldName', () => {
  const specs = [
    [`normal.foo`, `normal\\.foo`],
    [`normal.[]foo`, `normal\\.\\[\\]foo`],
    [`normal`, `normal`]
  ]

  specs.forEach(([input, expected]) => {
    it(`works for ${input}`, () => {
      expect(encodeFieldName(input)).toBe(expected)
    })
  })
})

describe('fixupJsonFields', () => {
  it('works', () => {
    expect(
      fixupJsonFields([
        {
          name: 'foo',
          rdfType: 'http://www.w3.org/2001/XMLSchema#decimal'
        },
        {
          name: 'bar'
        }
      ])
    ).toMatchSnapshot()
  })
})
