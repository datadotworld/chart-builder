// @flow
import React, { Component } from 'react'
import * as vega from 'vega'
import * as vl from 'vega-lite'
import * as VegaTooltip from 'vega-tooltip'

/*
expects a spec with a named source called `source`
*/
type Props = {
  spec: Object,
  data: Array<Object>
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
    let { spec, data } = this.props
    const loader = vega.loader()
    const logLevel = vega.Warn
    const renderer = 'svg'

    spec = vl.compile(spec).spec

    const runtime = vega.parse(spec)

    const view = new vega.View(runtime, {
      loader,
      logLevel,
      renderer
    })
      .initialize(this.node)
      .change('source', vega.changeset().insert(data))

    VegaTooltip.vegaLite(view, spec)

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
