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
  data: Array<Object>,
  onViewRender: (v: Object) => void
}

export default class VegaLiteEmbed extends Component<Props> {
  // $FlowIssue: createRef api
  nodeRef = React.createRef()

  shouldComponentUpdate() {
    return false
  }

  componentDidMount() {
    this.constructView()
  }

  node: ?HTMLDivElement
  view: ?Object

  async constructView() {
    const { spec, data, onViewRender } = this.props
    const loader = vega.loader()
    const logLevel = vega.Warn
    const renderer = 'svg'

    const vgSpec = vl.compile(spec).spec

    const runtime = vega.parse(vgSpec)

    const view = new vega.View(runtime, {
      loader,
      logLevel,
      renderer
    })
      .initialize(this.nodeRef.current)
      .change('source', vega.changeset().insert(data))

    try {
      VegaTooltip.vegaLite(view, spec)
    } catch (e) {}

    this.view = view
    await view.runAsync()
    onViewRender && onViewRender(view)
  }

  componentWillUnmount() {
    this.view && this.view.finalize()
  }

  render() {
    return <div data-test="vega-embed" ref={this.nodeRef} />
  }
}
