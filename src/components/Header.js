// @flow
import React, { Component, Fragment } from 'react'
import { Navbar } from 'react-bootstrap'
import { observer, inject } from 'mobx-react'
import logo from './logo.png'

import type { StoreType } from '../util/Store'

class Header extends Component<{
  store: StoreType
}> {
  render() {
    const { store } = this.props
    const { agentid, datasetid } = store

    const hasContext = !!(agentid && datasetid)

    const href = hasContext
      ? `https://data.world/${agentid}/${datasetid}`
      : 'https://data.world'

    const headerText = hasContext ? (
      <Fragment>
        <span style={{ color: 'white' }}>
          {agentid}/{datasetid}
        </span>
        <span style={{ color: '#a3afbf' }}>/chart-builder</span>
      </Fragment>
    ) : (
      <span style={{ color: '#a3afbf' }}>chart-builder</span>
    )

    return (
      <Navbar inverse staticTop fluid style={{ border: 0 }}>
        <Navbar.Header>
          <Navbar.Brand>
            <a
              href="https://data.world/integrations/chart-builder"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                alt="data.world logo"
                src={logo}
                style={{
                  height: 30,
                  marginTop: 13,
                  width: 30,
                  marginLeft: '-0.5rem'
                }}
              />
            </a>
          </Navbar.Brand>
          <Navbar.Text style={{ marginLeft: '0.75rem' }}>
            {headerText}
          </Navbar.Text>
        </Navbar.Header>
        <Navbar.Text pullRight>
          <Navbar.Link href={href}>Back to data.world</Navbar.Link>
        </Navbar.Text>
      </Navbar>
    )
  }
}

export default inject('store')(observer(Header))
