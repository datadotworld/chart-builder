import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route } from 'react-router-dom'
import './index.css'
import App from './App'
import { unregister } from './registerServiceWorker'

const KeyAppBySearch = props => {
  return <App {...props} key={props.location.search} />
}

ReactDOM.render(
  <BrowserRouter>
    <Route component={KeyAppBySearch} />
  </BrowserRouter>,
  document.getElementById('root')
)

unregister()
