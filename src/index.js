// @flow
import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route } from 'react-router-dom'
import { Provider } from 'mobx-react'
import { createBrowserHistory } from 'history'
import { injectGlobal } from 'emotion'

import AuthGate from './AuthGate'
import { unregister } from './registerServiceWorker'
import Store from './Store'

import 'vega-tooltip/build/vega-tooltip.css'
injectGlobal`
  html,
  body {
    height: 100%;
  }

  #root {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .popover-title {
    margin: 0;
    padding: 4px 14px;
    font-size: 14px;
    background-color: #f7f7f7;
    border-bottom: 1px solid #ebebeb;
    border-radius: 5px 5px 0 0;
    font-weight: bold;
  }

  .form-horizontal .control-label {
    padding-top: 7px;
  }
  .form-horizontal .form-group {
    margin-bottom: 0;
  }

  .navbar-right {
    margin-right: 0;
  }
`

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
