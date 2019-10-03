// @flow
import React, { Component } from 'react'
import { decorate, observable } from 'mobx'
import { observer } from 'mobx-react'
import { FormGroup, InputGroup, FormControl, Button } from 'react-bootstrap'
import { API_HOST } from '../util/constants'
import DWDatasetModal, { type SelectedDatasetType } from './DWDatasetModal'

type Props = {
  token: string,
  defaultValue: string,
  value: string,
  limitToProjects?: boolean,
  onChange: (id: string) => mixed
}

function toID(d: SelectedDatasetType) {
  return d.owner + '/' + d.id
}

class DatasetSelector extends Component<Props> {
  loadingInitial: boolean = true
  modalOpen: boolean = false

  componentDidMount() {
    this.setValueIfValid()
  }

  async setValueIfValid() {
    const { token, defaultValue, limitToProjects } = this.props
    if (!defaultValue) return

    try {
      const resp = await fetch(`${API_HOST}/v0/datasets/${defaultValue}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
      if (resp.ok) {
        const jsonResponse = await resp.json()
        if (
          jsonResponse.accessLevel === 'WRITE' ||
          jsonResponse.accessLevel === 'ADMIN'
        ) {
          if ((limitToProjects && jsonResponse.isProject) || !limitToProjects) {
            this.props.onChange(defaultValue)
          }
        }
      }
    } catch (e) {}

    this.loadingInitial = false
  }

  handleSelect = (d: SelectedDatasetType) => {
    this.props.onChange(toID(d))
    this.modalOpen = false
  }

  handleSelectClick = () => {
    this.modalOpen = true
  }

  handleCancel = () => {
    this.modalOpen = false
  }

  render() {
    const { limitToProjects } = this.props
    const value = this.loadingInitial
      ? 'Loading...'
      : this.props.value ||
        `Select ${limitToProjects ? 'project' : 'dataset/project'}`

    return (
      <>
        <FormGroup>
          <InputGroup>
            <FormControl type="text" readOnly value={value} />
            <InputGroup.Button>
              <Button
                data-dw="select-dataset-modal"
                onClick={this.handleSelectClick}
                style={{ padding: '0 0.5rem' }}
              >
                Select
              </Button>
            </InputGroup.Button>
          </InputGroup>
        </FormGroup>
        {this.modalOpen && (
          <DWDatasetModal
            limitToProjects={this.props.limitToProjects}
            onSelect={this.handleSelect}
            onCancel={this.handleCancel}
          />
        )}
      </>
    )
  }
}

decorate(DatasetSelector, {
  modalOpen: observable,
  loadingInitial: observable
})

export default observer(DatasetSelector)
