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
import { decorate, observable } from 'mobx'
import { observer, inject } from 'mobx-react'
import { API_HOST } from '../util/constants'
import DatasetSelector from './DatasetSelector'
import LoadingAnimation from './LoadingAnimation'
import VegaLiteImage from './VegaLiteImage'
import classes from './Modals.module.css'
import type { StoreType } from '../util/Store'
import kebabCase from 'lodash/kebabCase'

type Props = {
  onClose: Function,
  data: Array<Object>,
  defaultId: string,
  store: StoreType
}

class SaveAsFileModal extends Component<Props> {
  id: string = ''
  filename: string =
    kebabCase(this.props.store.config.title || 'untitled') + '.vl.json'
  response: ?{ message: string, uri: string } = null
  saving: boolean = false

  getFileCreateUrl() {
    return `${API_HOST}/v0/uploads/${this.id}/files/${this.filename}`
  }

  handleSave = async () => {
    const { data, store } = this.props
    this.saving = true

    const specWithData = store.config.getSpecWithMinimumAmountOfData(data)

    const d = await fetch(this.getFileCreateUrl(), {
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
    const { onClose, data, defaultId, store } = this.props

    return (
      <Modal show onHide={onClose} backdrop="static" className={classes.modal}>
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
                <div className={classes.imageHolder}>
                  <div style={{ overflow: 'auto' }}>
                    <VegaLiteImage
                      spec={store.config.generatedSpec}
                      data={data}
                      className={classes.anyImage}
                    />
                  </div>
                </div>
              </Col>
              <Col md={4} sm={5} xs={12}>
                <FormGroup controlId="insight-agentiddatasetid">
                  <ControlLabel>Dataset/Project</ControlLabel>
                  <DatasetSelector
                    token={store.token}
                    defaultValue={defaultId}
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
          <Button onClick={onClose} disabled={this.saving}>
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

decorate(SaveAsFileModal, {
  id: observable,
  filename: observable,
  response: observable,
  saving: observable
})

export default inject('store')(observer(SaveAsFileModal))
