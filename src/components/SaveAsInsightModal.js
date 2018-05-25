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
  comment: string = ''
  saveAsFile: boolean = true

  response: ?{ message: string, uri: string } = null
  saving: boolean = false

  img: ?Blob = null

  getFileCreateUrl() {
    const slugname = kebabCase(this.title)
    return `${API_HOST}/v0/uploads/${this.id}/files/${getDownloadName(
      slugname,
      'vl.json'
    )}`
  }

  getInsightCreateUrl() {
    return `${API_HOST}/v0/insights/${this.id}`
  }

  handleSave = async () => {
    const { data, store } = this.props

    const specWithData = store.config.getSpecWithMinimumAmountOfData(data)
    this.saving = true

    let sourceLink = `https://chart-builder.data.world/${
      window.location.search
    }`

    if (this.saveAsFile) {
      const filename = getDownloadName(kebabCase(this.title), 'vl.json')
      const fileCreateUrl = `${API_HOST}/v0/uploads/${
        this.id
      }/files/${filename}`
      await fetch(fileCreateUrl, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${store.token}`,
          'Content-Type': 'application/octet-stream'
        },
        body: JSON.stringify(specWithData)
      })
      sourceLink = `https://data.world/${
        this.id
      }/workspace/file?filename=${filename}`
    }

    // shouldn't really happen
    if (!this.img) return

    // upload image
    const uploadRes = await storeBlob(this.img)

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
        description: this.comment,
        body: {
          imageUrl: uploadRes.url
        },
        sourceLink
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
                  <ControlLabel>Agent ID/Project ID</ControlLabel>
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
                <FormGroup controlId="insight-comment">
                  <ControlLabel>
                    Add comment <small className="text-muted">(optional)</small>
                  </ControlLabel>
                  <FormControl
                    componentClass="textarea"
                    type="textarea"
                    value={this.comment}
                    placeholder="Enter text"
                    onChange={e => (this.comment = e.target.value)}
                    rows={3}
                  />
                </FormGroup>
                <Checkbox
                  checked={this.saveAsFile}
                  onChange={e => (this.saveAsFile = e.target.checked)}
                >
                  <strong>Also save as Vega-Lite source file</strong>
                </Checkbox>
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
  comment: observable,
  saveAsFile: observable,
  img: observable,
  response: observable,
  saving: observable
})

export default inject('store')(observer(SaveAsInsightModal))
