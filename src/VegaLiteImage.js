// @flow
import { extendObservable } from 'mobx'
import React, { Component } from 'react'
import * as vega from 'vega'
import * as vl from 'vega-lite'
import { observer } from 'mobx-react'

type Props = {
  spec: Object,
  data: Array<Object>,
  alt?: string,
  className?: string,
  onRender?: Blob => mixed
}

class VegaLiteImage extends Component<Props> {
  image: string

  constructor(props) {
    super(props)
    extendObservable(this, {
      image: ''
    })
  }
  componentDidMount() {
    this.constructView()
  }

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
      .initialize()
      .width(640)

    view.change('source', vega.changeset().insert(data))

    const svgString: string = await view.toSVG()

    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    const url = window.URL.createObjectURL(blob)

    this.image = url
    view.finalize()

    this.props.onRender && this.props.onRender(blob)
  }

  render() {
    if (!this.image) return null

    return (
      <img
        src={this.image}
        alt={this.props.alt}
        className={this.props.className}
      />
    )
  }
}

export default observer(VegaLiteImage)
