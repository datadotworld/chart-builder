import Store from '../Store'
import {
  restoreFromStateString,
  getStateString,
  getStateUrl
} from '../urlState'

describe('getStateString', () => {
  it('works', () => {
    const store = Store.create()
    expect(getStateString(store)).toMatchSnapshot()
  })
})

describe('getStateUrl', () => {
  it('works', () => {
    const store = Store.create()
    expect(getStateUrl(store)).toMatchSnapshot()
  })
})

describe('restoreFromStateString', () => {
  it('works', () => {
    const store = Store.create({
      config: {
        mark: 'line'
      }
    })
    const str = getStateString(store)

    const newStore = Store.create({
      config: {
        mark: 'bar'
      }
    })
    restoreFromStateString(newStore, str, {})
    expect(newStore).toMatchSnapshot()
  })
})
