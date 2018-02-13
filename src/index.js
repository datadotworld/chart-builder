import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route } from 'react-router-dom'
import './index.css'
import AuthGate from './AuthGate'
import { unregister } from './registerServiceWorker'

ReactDOM.render(
  <BrowserRouter>
    <Route component={AuthGate} />
  </BrowserRouter>,
  document.getElementById('root')
)

unregister()
