import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route } from 'react-router-dom'
import { createBrowserHistory } from 'history'
import './index.css'
import AuthGate from './AuthGate'
import { unregister } from './registerServiceWorker'
import { Provider } from 'mobx-react'

import Store from './Store'
const history = createBrowserHistory()

const store = Store.create({
  agentid: '',
  datasetid: '',
  query: '',
  token: '',

  config: {
    mark: 'bar',
    encodings: []
  }
})
store.addBrowserHistoryListener(history)

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Route component={AuthGate} />
    </Router>
  </Provider>,
  document.getElementById('root')
)

unregister()
