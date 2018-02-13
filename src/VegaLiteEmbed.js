// @flow
import React, { Component } from 'react'
import * as vegaImport from 'vega'
import * as VegaLite from 'vega-lite'
import * as VegaTooltip from 'vega-tooltip'

const vega = vegaImport
const vl = VegaLite

type Props = {
  spec: Object,
  width: number,
  height: number
}

export default class VegaLiteEmbed extends Component<Props> {
  shouldComponentUpdate() {
    return false
  }

  componentDidMount() {
    this.constructView()
  }

  node: ?HTMLDivElement
  view: ?Object

  async constructView() {
    let { spec, width, height } = this.props
    const loader = vega.loader()
    const logLevel = vega.Warn
    const renderer = 'svg'

    const values = spec.data.values
    spec.data = {
      name: 'source'
    }

    spec = vl.compile(spec).spec

    const runtime = vega.parse(spec)

    const view = new vega.View(runtime, {
      loader,
      logLevel,
      renderer
    }).initialize(this.node)

    view.change('source', vega.changeset().insert(values))

    VegaTooltip.vegaLite(view, spec)

    view.width(width).height(height)

    this.view = view
    await view.runAsync()
  }

  componentWillUnmount() {
    this.view && this.view.finalize()
  }

  render() {
    return <div ref={r => (this.node = r)} />
  }
}
