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
