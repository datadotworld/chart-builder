import Store, { ChartConfig, Field } from '../Store'

describe('Store', () => {
  it('works', () => {
    const store = Store.create()
    store.reset()
    expect(store).toMatchSnapshot()
  })

  it('detects valid params', () => {
    const store = Store.create({
      location: {
        search: 'agentid=foo&datasetid=bar&query=select'
      }
    })
    expect(store.hasValidParams).toBe(true)
    expect({
      agentid: store.agentid,
      datasetid: store.datasetid,
      query: store.query
    }).toMatchSnapshot()
  })

  it('detects invalid params', () => {
    const store = Store.create({
      location: {
        search: 'agentid=foo&datasetid=bar'
      }
    })
    expect(store.hasValidParams).toBe(false)
  })
  ;[
    ['sql', 'sql'],
    ['sqL', 'sql'],
    ['blah', 'sql'],
    ['', 'sql'],
    ['sparql', 'sparql'],
    ['sparqL', 'sparql']
  ].forEach(([type, expected]) => {
    it(`standardizes queryType from ${type} to ${expected}`, () => {
      const store = Store.create({
        location: {
          search: `agentid=foo&datasetid=bar&query=select&query_type=${type}`
        }
      })
      expect(store.queryType).toBe(expected)
    })
  })
  ;[
    ['agentid=a&datasetid=b', { agentid: 'a', datasetid: 'b' }],
    ['dataset=a/b', { agentid: 'a', datasetid: 'b' }],
    ['dataset=a&agentid=b&datasetid=c', { agentid: 'b', datasetid: 'c' }],
    ['project=a/b', { agentid: 'a', datasetid: 'b' }],
    ['dataset=c/d&project=a/b', { agentid: 'c', datasetid: 'd' }],
    [
      'dataset=c/d&project=a/b&agentid=e&datasetid=f',
      { agentid: 'c', datasetid: 'd' }
    ]
  ].forEach(([search, expected]) => {
    it(`parsing agentid/datasetid works for ${search}`, () => {
      const store = Store.create({
        location: {
          search
        }
      })

      expect({
        agentid: store.agentid,
        datasetid: store.datasetid
      }).toEqual(expected)
    })
  })
})

describe('ChartConfig', () => {
  it('works', () => {
    const config = ChartConfig.create()
    expect(config).toMatchSnapshot()
  })
  it('sets a few encodings', () => {
    const store = Store.create()
    store.reset()
    expect(store.config.hasPossiblyValidChart).toBe(false)
    store.setFields([
      {
        name: 'foo',
        rdfType: 'http://www.w3.org/2001/XMLSchema#float'
      }
    ])
    store.config.encodings[0].setField(store.fields[0])
    expect(store.config.hasPossiblyValidChart).toBe(true)

    expect(store).toMatchSnapshot()
    expect(store.config.generatedSpec).toMatchSnapshot()
    expect(
      store.config.getMinimumAmountOfData([{ foo: 1, bar: 2 }])
    ).toMatchSnapshot()
  })
})
