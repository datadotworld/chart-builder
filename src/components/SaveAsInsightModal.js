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
  Grid,
  Checkbox
} from 'react-bootstrap'
import { decorate, observable } from 'mobx'
import { observer, inject } from 'mobx-react'
import kebabCase from 'lodash/kebabCase'
import { API_HOST } from '../util/constants'
import DatasetSelector from './DatasetSelector'
import LoadingAnimation from './LoadingAnimation'
import { getDownloadName } from '../util/util'
import VegaLiteImage from './VegaLiteImage'
import classes from './Modals.module.css'
import { getStateUrl } from '../util/urlState'
import type { StoreType } from '../util/Store'

type Props = {
  initialTitle: null | string,
  onClose: Function,
  data: Array<Object>,
  defaultId: string,
  store: StoreType
}

function storeBlob(blob: Blob): Promise<{ url: string }> {
  const filepicker = require('filepicker-js')
  return new Promise((resolve, reject) => {
    filepicker.setKey('Al0jca1QpS4iGpimTNsAqz')
    filepicker.store(blob, resolve, reject)
  })
}

class SaveAsInsightModal extends Component<Props> {
  id: string = ''
  title: string = this.props.store.config.title || ''
  description: string = ''

  response: ?{ message: string, uri: string } = null
  saving: boolean = false

  img: ?Blob = null

  getInsightCreateUrl() {
    return `${API_HOST}/v0/insights/${this.id}`
  }

  handleSave = async () => {
    const { data, store } = this.props

    const specWithData = store.config.getSpecWithMinimumAmountOfData(data)
    this.saving = true

    const filename = getDownloadName(kebabCase(this.title), 'vl.json')
    const linkToVLFile = `https://data.world/${
      this.id
    }/workspace/file?filename=${filename}`

    const fileCreateUrl = `${API_HOST}/v0/uploads/${this.id}/files/${filename}`
    await fetch(fileCreateUrl, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${store.token}`,
        'Content-Type': 'application/octet-stream'
      },
      body: JSON.stringify(specWithData)
    })

    // shouldn't really happen
    if (!this.img) return

    const chartURL = getStateUrl(store)
    const queryResults =
      store.savedQueryId &&
      `https://data.world/${this.id}/workspace/query?queryid=${
        store.savedQueryId
      }`

    // create insight
    const d = await fetch(this.getInsightCreateUrl(), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${store.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: this.title,
        body: {
          markdownBody:
            `\`\`\`vega-lite\n ${JSON.stringify(specWithData)} \n\`\`\`\n` +
            this.description +
            `\n\n Click [here](${chartURL}) to edit this chart` +
            (queryResults
              ? `\n\n Here is the query that generated this chart \n @(${queryResults})`
              : '')
        },
        sourceLink: linkToVLFile
      })
    }).then(r => r.json())

    this.response = d
    this.saving = false
  }

  render() {
    const { onClose, data, defaultId, store } = this.props

    return (
      <Modal show onHide={onClose} backdrop="static" className={classes.modal}>
        <Modal.Header closeButton>
          <Modal.Title>Save as insight</Modal.Title>
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
                      onRender={e => (this.img = e)}
                      className={classes.anyImage}
                    />
                  </div>
                </div>
              </Col>
              <Col md={4} sm={5} xs={12}>
                <FormGroup controlId="insight-agentiddatasetid">
                  <ControlLabel>Project</ControlLabel>
                  <DatasetSelector
                    token={store.token}
                    defaultValue={defaultId}
                    value={this.id}
                    limitToProjects
                    onChange={id => (this.id = id)}
                  />
                </FormGroup>
                <FormGroup controlId="insight-title">
                  <ControlLabel>Title</ControlLabel>
                  <FormControl
                    type="text"
                    value={this.title}
                    placeholder="Enter title"
                    onChange={e => (this.title = e.target.value)}
                  />
                </FormGroup>
                <FormGroup controlId="insight-description">
                  <ControlLabel>
                    Add description
                    <small className="text-muted">(optional)</small>
                  </ControlLabel>
                  <FormControl
                    componentClass="textarea"
                    type="textarea"
                    value={this.description}
                    placeholder="Enter text"
                    onChange={e => (this.description = e.target.value)}
                    rows={3}
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
              disabled={this.saving || !this.id || !this.title}
            >
              Save
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    )
  }
}

decorate(SaveAsInsightModal, {
  id: observable,
  title: observable,
  description: observable,
  img: observable,
  response: observable,
  saving: observable
})

export default inject('store')(observer(SaveAsInsightModal))
