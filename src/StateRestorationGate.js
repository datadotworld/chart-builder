// @flow
import { Component } from 'react'
import { restoreFromStateString } from './urlState'
import type { Node } from 'react'
import type { StoreType } from './Store'

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
    const params = new URLSearchParams(props.history.location.search)
    if (params.has('s')) {
      try {
        restoreFromStateString(store, params.get('s'), { token: store.token })
        history.replace({
          pathname: '/',
          search: new URLSearchParams({
            agentid: store.agentid,
            datasetid: store.datasetid,
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
