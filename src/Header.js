// @flow
import React, { PureComponent } from 'react'
import { Navbar } from 'react-bootstrap'
import logo from './logo.png'

export default class extends PureComponent {
  render() {
    return (
      <Navbar inverse staticTop>
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
          <Navbar.Link href="https://data.world">Back to data.world</Navbar.Link>
        </Navbar.Text>
      </Navbar>
    )
  }
}
