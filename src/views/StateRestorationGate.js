// @flow
import { Component } from 'react'
import { restoreFromStateString } from '../util/urlState'
import { createParams } from '../util/util'
import type { Node } from 'react'
import type { StoreType } from '../util/Store'

type Props = {
  history: Object,
  location: Object,
  store: StoreType,
  children: Node
}

export default class StateRestorationGate extends Component<Props> {
  constructor(props: Props) {
    super(props)

    const { history, store } = this.props
    const params = createParams(props.history.location.search)
    if (params.has('s')) {
      try {
        restoreFromStateString(store, params.get('s'), { token: store.token })
        history.replace({
          pathname: '/',
          search: createParams({
            dataset: store.dataset,
            query: store.query
          }).toString()
        })
      } catch (e) {}
    }
  }

  render() {
    return this.props.children
  }
}
