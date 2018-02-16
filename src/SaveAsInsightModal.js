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
import { observer } from 'mobx-react'
import filepicker from 'filepicker-js'
import { API_HOST } from './constants'
import LoadingAnimation from './LoadingAnimation'
import VegaLiteImage from './VegaLiteImage'
import './SaveAsInsightModal.css'

type Props = {
  onClose: Function,
  spec: Object,
  data: Array<Object>
}

function storeBlob(blob: Blob): Promise<{ url: string }> {
  return new Promise((resolve, reject) => {
    filepicker.setKey('Al0jca1QpS4iGpimTNsAqz')
    filepicker.store(blob, resolve, reject)
  })
}

class SaveAsInsightModal extends Component<Props> {
  id: string
  title: string
  comment: string

  response: ?{ message: string, uri: string }
  saving: boolean

  img: Blob

  constructor(props) {
    super(props)

    extendObservable(this, {
      id: 'rgrochowicz/test-prj-2',
      title: '',
      comment: '',
      img: null,
      response: null,
      saving: false
    })
  }

  getInsightCreateUrl() {
    return `${API_HOST}/v0/insights/${this.id}`
  }

  handleSave = async () => {
    this.saving = true
    // upload image
    const uploadRes = await storeBlob(this.img)

    // create insight
    const d = await fetch(this.getInsightCreateUrl(), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${window.localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: this.title,
        description: this.comment,
        body: {
          imageUrl: uploadRes.url
        },
        sourceLink: `https://vega-lite-explorer.data.world/?state=${encodeURIComponent(
          this.title
        )}`
      })
    }).then(r => r.json())

    this.response = d
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
                <div className="imageHolder">
                  <div style={{ overflow: 'auto' }}>
                    <VegaLiteImage
                      spec={this.props.spec}
                      data={this.props.data}
                      onRender={e => (this.img = e)}
                      className="anyImage"
                    />
                  </div>
                </div>
              </Col>
              <Col md={4} sm={5} xs={12}>
                <FormGroup controlId="insight-agentiddatasetid">
                  <ControlLabel>Agent ID/Project ID</ControlLabel>
                  <FormControl
                    type="text"
                    value={this.id}
                    placeholder="Enter text"
                    onChange={e => (this.id = e.target.value)}
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
              disabled={this.saving}
            >
              Save
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    )
  }
}

export default observer(SaveAsInsightModal)
