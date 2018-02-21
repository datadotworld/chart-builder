// @flow
import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route } from 'react-router-dom'
import { Provider } from 'mobx-react'
import { createBrowserHistory } from 'history'
import './index.css'

import AuthGate from './AuthGate'
import { unregister } from './registerServiceWorker'
import Store from './Store'

const history = createBrowserHistory()

const store = Store.create({
  token: '',

  config: {
    mark: 'bar',
    encodings: []
  }
})
store.addBrowserHistoryListener(history)

const rootElement = document.getElementById('root')
if (rootElement) {
  ReactDOM.render(
    <Provider store={store}>
      <Router history={history}>
        <Route component={AuthGate} />
      </Router>
    </Provider>,
    rootElement
  )
}

unregister()
