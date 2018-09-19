// @flow
import React, { PureComponent } from 'react'
import load from 'little-loader'
import { CLIENT_ID } from '../util/constants'

export type SelectedDatasetType = { id: string, owner: string }
type P = {
  onSelect: SelectedDatasetType => mixed,
  onCancel: () => mixed,
  limitToProjects?: boolean
}

const WIDGET_JS = 'https://widgets.data.world/dataworld-widgets.js'
let loadedScript = false
export default class LoadScriptWrapper extends PureComponent<
  P,
  { loaded: boolean }
> {
  state = {
    loaded: loadedScript
  }

  componentDidMount() {
    if (this.state.loaded) return

    load(WIDGET_JS, {
      callback: err => {
        if (err) return
        loadedScript = true
        this.setState({
          loaded: true
        })
      }
    })
  }
  render() {
    if (!this.state.loaded) return null

    return <DWDatasetModal {...this.props} />
  }
}

type DatasetSelector = {
  success: (fn: (Array<SelectedDatasetType>) => mixed) => void,
  cancel: (fn: () => void) => void,
  show: () => mixed,
  close: () => mixed
}

class DWDatasetModal extends PureComponent<P> {
  datasetSelector: DatasetSelector

  componentDidMount() {
    this.datasetSelector = new window.dataworldWidgets.DatasetSelector({
      client_id: CLIENT_ID,
      linkText: 'Select',
      resourceFilter: this.props.limitToProjects ? 'project' : undefined
    })

    this.datasetSelector.success(selectedDatasets => {
      const [dataset] = selectedDatasets
      if (dataset) {
        this.props.onSelect(dataset)
      } else {
        this.props.onCancel()
      }
    })

    this.datasetSelector.cancel(() => {
      this.props.onCancel()
    })

    // Shows the dataset selector
    this.datasetSelector.show()
  }
  componentWillUnmount() {
    this.datasetSelector.close()
  }
  render() {
    return null
  }
}
