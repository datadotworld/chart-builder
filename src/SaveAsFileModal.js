// @flow
import React, { Component } from 'react'
import {
  Modal,
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Alert,
  Col,
  Row,
  Grid
} from 'react-bootstrap'
import { extendObservable } from 'mobx'
import { observer, inject } from 'mobx-react'
import { API_HOST } from './constants'
import DatasetSelector from './DatasetSelector'
import LoadingAnimation from './LoadingAnimation'
import VegaLiteImage from './VegaLiteImage'
import './SaveAsInsightModal.css'
import type { StoreType } from './Store'

type Props = {
  onClose: Function,
  spec: Object,
  data: Array<Object>,
  defaultId: string,
  store: StoreType
}

class SaveAsFileModal extends Component<Props> {
  id: string
  filename: string

  response: ?{ message: string, uri: string }
  saving: boolean

  constructor(props) {
    super(props)

    extendObservable(this, {
      id: '',
      filename: 'vega-lite.vl.json',
      response: null,
      saving: false
    })
  }

  getInsightCreateUrl() {
    return `${API_HOST}/v0/uploads/${this.id}/files/${this.filename}`
  }

  handleSave = async () => {
    const { spec, data, store } = this.props
    this.saving = true

    const specWithData = {
      ...spec,
      data: {
        values: data
      }
    }

    const d = await fetch(this.getInsightCreateUrl(), {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${store.token}`,
        'Content-Type': 'application/octet-stream'
      },
      body: JSON.stringify(specWithData)
    }).then(r => r.json())

    this.response = {
      ...d,
      uri: `https://data.world/${this.id}/workspace/file?filename=${
        this.filename
      }`
    }
    this.saving = false
  }

  render() {
    return (
      <Modal
        show
        onHide={this.props.onClose}
        backdrop="static"
        className="modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Save as file</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.response && (
            <Alert bsStyle="success">
              {this.response.message}{' '}
              <a
                className="alert-link"
                href={this.response.uri}
                target="_blank"
              >
                Open in new tab
              </a>
            </Alert>
          )}
          <Grid>
            <Row>
              <Col md={8} sm={7} xs={12}>
                <div className="imageHolder">
                  <div style={{ overflow: 'auto' }}>
                    <VegaLiteImage
                      spec={this.props.spec}
                      data={this.props.data}
                      className="anyImage"
                    />
                  </div>
                </div>
              </Col>
              <Col md={4} sm={5} xs={12}>
                <FormGroup controlId="insight-agentiddatasetid">
                  <ControlLabel>Agent ID/Dataset ID</ControlLabel>
                  <DatasetSelector
                    token={this.props.store.token}
                    defaultValue={this.props.defaultId}
                    value={this.id}
                    onChange={id => (this.id = id)}
                  />
                </FormGroup>
                <FormGroup controlId="insight-filename">
                  <ControlLabel>File name</ControlLabel>
                  <FormControl
                    type="text"
                    value={this.filename}
                    placeholder="Enter filename"
                    onChange={e => (this.filename = e.target.value)}
                  />
                </FormGroup>
              </Col>
            </Row>
          </Grid>
          {this.saving && <LoadingAnimation />}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onClose} disabled={this.saving}>
            Close
          </Button>
          {!this.response && (
            <Button
              bsStyle="primary"
              onClick={this.handleSave}
              disabled={this.saving || !this.id}
            >
              Save
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    )
  }
}

export default inject('store')(observer(SaveAsFileModal))
