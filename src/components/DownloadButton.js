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
  getDownloadUrl: () => string,
  'data-dw'?: string
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
        data-dw={this.props['data-dw']}
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
          data-dw="download-vega-lite"
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
          data-dw="download-vega"
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
          data-dw="download-png"
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
          data-dw="download-svg"
          baseName="download"
          extension="svg"
          getDownloadUrl={() => {
            return getVegaView().toImageURL('svg')
          }}
          href="##"
        >
          SVG <span className="text-muted">(.svg)</span>
        </DownloadMenuItem>
        <MenuItem header>HTML</MenuItem>
        <DownloadMenuItem
          data-dw="download-html"
          baseName="download"
          extension="html"
          getDownloadUrl={() => {
            const vlSpec = JSON.stringify(
              store.config.getSpecWithMinimumAmountOfData(getData())
            )
            let html = `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/vega@4.2.0"></script>
  <script src="https://cdn.jsdelivr.net/npm/vega-lite@3.0.0-rc3"></script>
  <script src="https://cdn.jsdelivr.net/npm/vega-embed@3.18.2"></script>
</head>
<body>

  <div id="vis"></div>

  <script type="text/javascript">
    var yourVlSpec = ${vlSpec};
    vegaEmbed("#vis", yourVlSpec);
  </script>
</body>
</html>
            `
            const blob = new Blob([html], {
              type: 'application/html'
            })
            return URL.createObjectURL(blob)
          }}
          href="##"
        >
          HTML <span className="text-muted">(.html)</span>
        </DownloadMenuItem>
      </DropdownButton>
    )
  }
}

export default inject('store')(observer(DownloadButton))
