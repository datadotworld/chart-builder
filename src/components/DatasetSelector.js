// @flow
import React, { Component, Fragment } from 'react'
import { extendObservable } from 'mobx'
import { observer } from 'mobx-react'
import { API_HOST } from '../util/constants'

async function fetchUntilCompletion(token: string, baseUrl: string) {
  let next = ''
  const records = []
  do {
    const fullUrl = baseUrl + (next ? `&next=${encodeURIComponent(next)}` : '')
    const data = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      }
    }).then(r => r.json())
    records.push(...data.records)
    next = data.nextPageToken
  } while (next)
  return records
}

async function fetchAllDatasets(token: string, limitToProjects: boolean) {
  const baseUrl = `${API_HOST}/v0/user/${
    limitToProjects ? 'projects' : 'datasets'
  }`
  const [ownDatasets, contribDatasets] = await Promise.all([
    fetchUntilCompletion(token, `${baseUrl}/own?limit=100`),
    fetchUntilCompletion(token, `${baseUrl}/contributing?limit=100`)
  ])
  return ownDatasets.concat(contribDatasets)
}

type Props = {
  token: string,
  defaultValue: string,
  value: string,
  limitToProjects?: boolean,
  onChange: (id: string) => mixed
}

type Dataset = { owner: string, id: string, isProject: boolean }

function toID(d: Dataset) {
  return d.owner + '/' + d.id
}

class DatasetSelector extends Component<Props> {
  loading: boolean
  datasets: ?Array<Dataset>

  constructor() {
    super()
    extendObservable(this, {
      loading: true,
      datasets: null
    })
  }

  componentDidMount() {
    this.fetch()
  }

  async fetch() {
    this.loading = true
    this.datasets = await fetchAllDatasets(
      this.props.token,
      !!this.props.limitToProjects
    )
    this.loading = false

    const { defaultValue, onChange } = this.props
    if (defaultValue) {
      if (this.datasets.some(d => toID(d) === defaultValue)) {
        onChange(defaultValue)
        return
      }
    }
    // set the first dataset as selected
    const [dataset] = this.datasets
    if (dataset && this.props.onChange) {
      this.props.onChange(toID(dataset))
    }
  }

  handleChange = e => {
    this.props.onChange(e.target.value)
  }

  render() {
    const value = this.loading ? '' : this.props.value

    return (
      <select
        disabled={this.loading}
        className="form-control"
        value={value}
        onChange={this.handleChange}
      >
        {this.datasets ? (
          <Fragment>
            <option value="">
              Choose a {this.props.limitToProjects ? 'project' : 'dataset'}
            </option>
            {this.datasets.map(d => {
              const text = toID(d)
              return (
                <option key={text} value={text}>
                  {text}
                </option>
              )
            })}
          </Fragment>
        ) : (
          <option disabled value="">
            Loading...
          </option>
        )}
      </select>
    )
  }
}

export default observer(DatasetSelector)
