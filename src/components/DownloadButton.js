// @flow
import React, { Component } from 'react'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import { observer, inject } from 'mobx-react'
import { getDownloadName } from '../util/util'
import classes from './DownloadButton.module.css'

import type { Node } from 'react'
import type { StoreType } from '../util/Store'

function urlFromObject(obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], {
    type: 'application/json'
  })
  return URL.createObjectURL(blob)
}

type DownloadMenuItemProps = {
  extension: string,
  baseName: string,
  children: Node,
  getDownloadUrl: () => string
}

export class DownloadMenuItem extends Component<DownloadMenuItemProps> {
  handleMouseDown = async (e: SyntheticMouseEvent<HTMLElement>) => {
    const { currentTarget } = e
    const { getDownloadUrl, baseName, extension } = this.props

    const url = await getDownloadUrl()
    currentTarget.setAttribute('href', url)
    currentTarget.setAttribute('download', getDownloadName(baseName, extension))
  }

  render() {
    const { children, baseName, extension } = this.props

    return (
      <MenuItem
        download={`${baseName}.${extension}`}
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
  getVegaView: () => Object,
  getData: () => Array<Object>
}

export class DownloadButton extends Component<Props> {
  render() {
    const { store, getVegaView, getData } = this.props

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
          baseName="vega-lite"
          extension="vl.json"
          getDownloadUrl={() => {
            return urlFromObject(
              store.config.getSpecWithMinimumAmountOfData(getData())
            )
          }}
          href="##"
        >
          Vega-Lite <span className="text-muted">(.vl.json)</span>
        </DownloadMenuItem>
        <DownloadMenuItem
          baseName="vega"
          extension="vg.json"
          getDownloadUrl={() => {
            return urlFromObject(
              require('vega-lite').compile(
                store.config.getSpecWithMinimumAmountOfData(getData())
              ).spec
            )
          }}
          href="##"
        >
          Vega <span className="text-muted">(.vg.json)</span>
        </DownloadMenuItem>
        <MenuItem header>Image</MenuItem>
        <DownloadMenuItem
          baseName="download"
          extension="png"
          getDownloadUrl={() => {
            return getVegaView().toImageURL('png')
          }}
          href="##"
        >
          PNG <span className="text-muted">(.png)</span>
        </DownloadMenuItem>
        <DownloadMenuItem
          baseName="download"
          extension="svg"
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
