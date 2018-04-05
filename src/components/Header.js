// @flow
import React, { Component, Fragment } from 'react'
import { Navbar } from 'react-bootstrap'
import { observer, inject } from 'mobx-react'
import logo from './logo.svg'

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
        <span style={{ color: '#a3afbf' }}>{agentid}/{datasetid}</span>/Chart
        Builder
      </Fragment>
    ) : (
      'Chart Builder'
    )

    return (
      <Navbar inverse staticTop fluid style={{ border: 0 }}>
        <Navbar.Header>
          <Navbar.Brand>
            <img
              alt="data.world logo"
              src={logo}
              style={{
                height: 40,
                marginTop: 9,
                width: 40,
                marginLeft: '-0.5rem'
              }}
            />
          </Navbar.Brand>
          <Navbar.Text>{headerText}</Navbar.Text>
        </Navbar.Header>
        <Navbar.Text pullRight>
          <Navbar.Link href={href}>Back to data.world</Navbar.Link>
        </Navbar.Text>
      </Navbar>
    )
  }
}

export default inject('store')(observer(Header))
