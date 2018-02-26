// @flow
import React, { Component } from 'react'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import { css } from 'emotion'
import { observer, inject } from 'mobx-react'

import type { Node } from 'react'
import type { StoreType } from './Store'

const classes = {
  dropdownButton: css`
    & + .dropdown-menu {
      min-width: 10rem;
    }
  `
}

function urlFromObject(obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], {
    type: 'application/json'
  })
  return URL.createObjectURL(blob)
}

type DownloadMenuItemProps = {
  download: string,
  children: Node,
  getDownloadUrl: () => string
}

class DownloadMenuItem extends Component<DownloadMenuItemProps> {
  handleMouseDown = async e => {
    const { currentTarget } = e

    const url = await this.props.getDownloadUrl()
    currentTarget.setAttribute('href', url)
  }

  render() {
    const { children, download } = this.props

    return (
      <MenuItem
        download={download}
        onMouseDown={this.handleMouseDown}
        href="##"
      >
        {children}
      </MenuItem>
    )
  }
}

type Props = {
  store: StoreType,
  getVegaView: () => Object
}

class DownloadButton extends Component<Props> {
  render() {
    const { store, getVegaView } = this.props

    return (
      <DropdownButton
        bsSize="xs"
        title="Download"
        id="dropdown-download"
        disabled={!store.config.hasPossiblyValidChart}
        className={classes.dropdownButton}
        pullRight
        noCaret
      >
        <MenuItem header>JSON</MenuItem>
        <DownloadMenuItem
          download="vega-lite.vl.json"
          getDownloadUrl={() => {
            return urlFromObject(store.config.generatedSpec)
          }}
          href="##"
        >
          Vega-Lite <span className="text-muted">(.vl.json)</span>
        </DownloadMenuItem>
        <DownloadMenuItem
          download="vega.vg.json"
          getDownloadUrl={() => {
            return urlFromObject(
              require('vega-lite').compile(store.config.generatedSpec).spec
            )
          }}
          href="##"
        >
          Vega <span className="text-muted">(.vg.json)</span>
        </DownloadMenuItem>
        <MenuItem header>Image</MenuItem>
        <DownloadMenuItem
          download="download.png"
          getDownloadUrl={() => {
            return getVegaView().toImageURL('png')
          }}
          href="##"
        >
          PNG <span className="text-muted">(.png)</span>
        </DownloadMenuItem>
        <DownloadMenuItem
          download="download.svg"
          getDownloadUrl={() => {
            return getVegaView().toImageURL('svg')
          }}
          href="##"
        >
          SVG <span className="text-muted">(.svg)</span>
        </DownloadMenuItem>
      </DropdownButton>
    )
  }
}

export default inject('store')(observer(DownloadButton))
