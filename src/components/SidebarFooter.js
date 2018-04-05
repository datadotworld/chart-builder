// @flow
/* eslint jsx-a11y/anchor-is-valid: 0 */
import React, { Component } from 'react'
import { extendObservable } from 'mobx'
import { observer } from 'mobx-react'
import LicenseModal from './LicenseModal'

import classes from './SidebarFooter.module.css'

class SidebarFooter extends Component<{}> {
  showLicenses: boolean

  constructor() {
    super()

    extendObservable(this, {
      showLicenses: false
    })
  }

  render() {
    return (
      <div className={classes.bottomBar}>
        <div>
          <a
            href="https://vega.github.io/vega-lite/docs/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vega-Lite docs
          </a>
          {' | '}
          <a
            href=""
            onClick={e => {
              e.preventDefault()
              this.showLicenses = true
            }}
            data-test="license-open"
          >
            Licenses
          </a>
          {' | '}
          <a
            href="https://github.com/datadotworld/chart-builder"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
        <small className={classes.name}>© data.world</small>
        {this.showLicenses && (
          <LicenseModal onClose={() => (this.showLicenses = false)} />
        )}
      </div>
    )
  }
}

export default observer(SidebarFooter)
