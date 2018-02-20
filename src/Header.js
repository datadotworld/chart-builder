// @flow
import React, { Component } from 'react'
import { Navbar } from 'react-bootstrap'
import { observer, inject } from 'mobx-react'
import logo from './logo.png'

import type { StoreType } from './Store'

class Header extends Component<{
  store: StoreType
}> {
  render() {
    const { store } = this.props
    const { agentid, datasetid } = store

    const href =
      agentid && datasetid
        ? `https://data.world/${agentid}/${datasetid}`
        : 'https://data.world'
    return (
      <Navbar inverse staticTop fluid>
        <Navbar.Header>
          <Navbar.Brand>
            <img
              alt="data.world logo"
              src={logo}
              style={{ height: 40, marginTop: 9 }}
            />
          </Navbar.Brand>
          <Navbar.Text>Vega-Lite Explorer</Navbar.Text>
        </Navbar.Header>
        <Navbar.Text pullRight>
          <Navbar.Link href={href}>Back to data.world</Navbar.Link>
        </Navbar.Text>
      </Navbar>
    )
  }
}

export default inject('store')(observer(Header))
