// @flow
// @flow
import React, { Fragment, Component } from 'react'
import { decorate, observable, runInAction } from 'mobx'
import { observer, inject } from 'mobx-react'
import { Link } from 'react-router-dom'
import {
  Grid,
  Row,
  Button,
  Col,
  ButtonToolbar,
  DropdownButton,
  MenuItem,
  Modal
} from 'react-bootstrap'
import filesize from 'filesize'
import DownloadButton from '../components/DownloadButton'
import LoadingAnimation from '../components/LoadingAnimation'
import SaveAsFileModal from '../components/SaveAsFileModal'
import SaveAsInsightModal from '../components/SaveAsInsightModal'
import { API_HOST } from '../util/constants'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import { getStateUrl } from '../util/urlState'
import VizCard from '../components/VizCard'
import VizEmpty from '../components/VizEmpty'
import ResizableVegaLiteEmbed from '../components/ResizableVegaLiteEmbed'
import CopyField from '../components/CopyField'
import { fixupJsonFields } from '../util/util'
import classes from './App.module.css'
import type { StoreType } from '../util/Store'

type AppP = {
  history: Object,
  location: Object,
  store: StoreType
}

type SparqlResults = {
  head: {
    vars: Array<string>
  },
  results: {
    bindings: Array<{
      [key: string]: {
        type: string,
        value: string
      }
    }>
  }
}

class App extends Component<AppP> {
  data: ?Array<Object> = null

  loading: boolean = true
  errorLoading: boolean = false
  bytesDownloaded: number = 0

  saveModalOpen: false | 'insight' | 'file' | 'shareurl' | 'ddwembed' = false

  componentDidMount() {
    const { store } = this.props

    if (store.hasValidParams) {
      this.fetchQuery()
    } else {
      console.warn('No valid parameters found.')
    }
  }

  getQueryHeaders() {
    const { store } = this.props
    return {
      Accept:
        store.queryType === 'sql'
          ? 'application/json'
          : 'application/sparql-results+json',
      Authorization: `Bearer ${store.token}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  fetchQuery = async () => {
    const { store } = this.props
    runInAction(() => {
      store.setFields([])
      this.data = null
      this.loading = true
    })

    let res
    try {
      // Determine URL and method based on savedQueryId
      const queryURL = store.savedQueryId
        ? `${API_HOST}/v0/queries/${
            store.savedQueryId
          }/results?includeTableSchema=true`
        : `${API_HOST}/v0/${store.queryType}/${store.dataset}`

      const fetchOptions = store.savedQueryId
        ? { method: 'GET', headers: this.getQueryHeaders() }
        : {
            method: 'POST',
            headers: {
              ...this.getQueryHeaders(),
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              query: store.query,
              includeTableSchema: true
            })
          }

      res = await fetch(queryURL, fetchOptions)

      // Check for response success
      if (!res.ok) {
        const errorText = await res.text()
        console.error('Error Response:', errorText)
        throw new Error('Network response was not ok')
      }

      // Process response data
      const data = await res.json()
      this.handleData(data)
    } catch (error) {
      console.error('Fetch error:', error)
      this.errorLoading = true
    } finally {
      runInAction(() => {
        this.loading = false
      })
    }
  }

  processData(data: Array<Object> | SparqlResults) {
    if (Array.isArray(data)) {
      // we're processing application/json
      const [dschema, ...rows] = data
      return {
        fields: fixupJsonFields(dschema.fields),
        rows
      }
    }

    const sparqlFields: any = data.head.vars.map(v => ({
      name: v,
      rdfType: 'http://www.w3.org/2001/XMLSchema#string'
    }))

    const sparqlRows = data.results.bindings.map(b => {
      const obj = {}
      for (let k in b) {
        obj[k] = b[k].value
      }
      return obj
    })

    return {
      fields: sparqlFields,
      rows: sparqlRows
    }
  }

  handleData = (data: Array<Object>) => {
    const { store } = this.props

    const { fields, rows } = this.processData(data)

    runInAction(() => {
      store.setFields([
        ...(fields: any).map(f => ({
          name: f.name,
          rdfType: f.rdfType
        })),
        {
          name: '*',
          label: 'COUNT(*)',
          rdfType: 'http://www.w3.org/2001/XMLSchema#integer'
        }
      ])
      this.data = rows
      this.loading = false
      if (this.props.store.config.encodings.length === 0) {
        this.props.store.reset()
      }
    })
  }

  vegaView: Object
  handleViewRender = v => {
    this.vegaView = v
  }

  renderEmbed() {
    const { data } = this
    const { store } = this.props
    return (
      (data &&
        store.fields &&
        store.config.hasPossiblyValidChart && (
          <ResizableVegaLiteEmbed
            spec={store.config.generatedSpec}
            data={data}
            onViewRender={this.handleViewRender}
            setDimensions={store.config.setDimensions}
            showResize={
              !store.config.hasManualSpec && !store.config.hasFacetField
            }
          />
        )) || <VizEmpty />
    )
  }

  render() {
    const { store } = this.props

    if (!store.hasValidParams) {
      return (
        <Fragment>
          <Header />
          <Grid style={{ marginTop: 32 }}>
            <Row>
              <Col xs={12}>
                <h3>Valid parameters required</h3>
                <Link
                  data-test="example-link"
                  to={{
                    pathname: '/',
                    search:
                      '?dataset=data-society/iris-species&query=SELECT+%2A%0AFROM+iris'
                  }}
                >
                  Here's an example (with a link to a query)
                </Link>
                <br />
                <Link
                  data-test="example-link-2"
                  onClick={this.forceUpdate}
                  to={{
                    pathname: '/',
                    search:
                      '?s=N4IgbgpgTgzglgewHYgFwEYA0IA2CDGAhgC6IqqgwSFT4AWaIA-ACYmFXEC8AVsngE8ISGAFIATADE4SYtAC2EFnBIQAtG2KE1AdwRQcLAGQBHAK7QBXKjgj5iEgAwSAgk4BmUBPKcw6CBFIkAHMYfDhiARgtOQkAYVFHF2D5ZAgBADpRADZHMxg1cMi1OXkABzUoQhCIMVys3LiIgScAFQhypwAlauCIDIAPHBgBiUkAETh3d2hhfAgnGTaOsrrnJJ06Wd9-QJlQoqiY-sPo1VEAZnGcxybI5c7xRx6aweHRqUnp2aR5xaQHqsbhk7gJTBYoAIAPqRMoQLgAZQAigAZEAAX2w+GQ7jgwTQoFIxFsaCQZhwOGw8hoAGtGAAjGggbBzBDKEIwNAAbVAULgLDQjmwuIghkYZzkUKQhEUzJA9GqSFFjAGcthEEYhDMxAQcvpMjQ7kIwwg2EIwWCUAgwVUpPJlJAAC9oLrUMQoBZsGFjRrULgZNQoHKYPpiJqwsJ2fjsKRFABVJARO0Ur2h6SigWoMkUzG8-loLAgEViv0AKjlCqQSpwjAEaoEcM12t12H15CNJrNFqtNrkjGxZlkcudXjQ7s9IG9JL9OADTNTUDDfo48yQUbVcHjiaX2YdIcX6ZLu9zID5mfEwrgGeTDsr1f7CDwQZjDd9IC1Or1BtQHaoXct1q2lm9rYCOrrjqak5ENO-pKvOk6huGq7rjGm4QAmSbASmCEHleR72uiAC6VLVGYxoInC+A3tgOj8sQDBYQ6Wx4nQO4EeiQA'
                  }}
                >
                  Here's another example (with a preconfigured chart)
                </Link>
              </Col>
            </Row>
          </Grid>
        </Fragment>
      )
    }

    if (this.loading || this.errorLoading) {
      return (
        <Fragment>
          <Header />
          <Grid style={{ marginTop: 32 }}>
            {this.loading ? (
              <LoadingAnimation
                hideOverlay
                label={
                  'Downloading: ' +
                  (this.bytesDownloaded === 0
                    ? '...'
                    : filesize(this.bytesDownloaded, { round: 1 }))
                }
              />
            ) : (
              <h4>Error loading data</h4>
            )}
          </Grid>
        </Fragment>
      )
    }

    return (
      <Fragment>
        <Header />

        <div className={classes.main}>
          <Sidebar />
          <div className={classes.embed}>
            <Grid fluid className={classes.topBar}>
              <Row>
                <Col xs={12} className={classes.topBarCol}>
                  <div className={classes.topBarHeader}>
                    <input
                      data-test="chart-title"
                      className={classes.topBarTitle}
                      placeholder="Untitled chart"
                      value={store.config.title || ''}
                      onChange={e => {
                        store.config.setTitle(e.target.value)
                      }}
                    />
                  </div>
                  <div className={classes.topBarButtons}>
                    <ButtonToolbar>
                      <DownloadButton
                        getVegaView={() => this.vegaView}
                        getData={() => this.data}
                      />
                      <DropdownButton
                        bsSize="xs"
                        title="Share"
                        id="dropdown-save-ddw"
                        disabled={!store.config.hasPossiblyValidChart}
                        className={classes.dropdownButton}
                        pullRight
                        noCaret
                        onSelect={ek => (this.saveModalOpen = ek)}
                      >
                        <MenuItem header>Share to data.world as...</MenuItem>
                        <MenuItem data-test="share-insight" eventKey="insight">
                          Insight
                        </MenuItem>
                        <MenuItem data-test="share-file" eventKey="file">
                          File
                        </MenuItem>
                        <MenuItem
                          data-test="share-markdown"
                          eventKey="ddwembed"
                        >
                          Markdown Embed (Comment)
                        </MenuItem>
                        <MenuItem header>Other</MenuItem>
                        <MenuItem data-test="share-url" eventKey="shareurl">
                          Share URL
                        </MenuItem>
                      </DropdownButton>
                    </ButtonToolbar>
                  </div>
                </Col>
              </Row>
            </Grid>
            <VizCard>{this.renderEmbed()}</VizCard>
          </div>
        </div>
        {this.saveModalOpen === 'insight' && (
          <SaveAsInsightModal
            onClose={() => (this.saveModalOpen = false)}
            defaultId={store.dataset}
            data={this.data}
          />
        )}
        {this.saveModalOpen === 'file' && (
          <SaveAsFileModal
            onClose={() => (this.saveModalOpen = false)}
            defaultId={store.dataset}
            data={this.data}
          />
        )}
        {this.saveModalOpen === 'shareurl' && (
          <Modal
            onHide={() => (this.saveModalOpen = false)}
            show
            backdrop="static"
            className={classes.modal}
          >
            <Modal.Header closeButton>
              <Modal.Title>Share URL</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Grid>
                <Row>
                  <Col md={12}>
                    Use this URL to share this chart so other people can
                    view/edit it in Chart Builder:
                  </Col>
                </Row>
                <Row>
                  <Col md={12} data-test="share-url-text">
                    <CopyField getValue={() => getStateUrl(this.props.store)} />
                  </Col>
                </Row>
              </Grid>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={() => (this.saveModalOpen = false)}>Done</Button>
            </Modal.Footer>
          </Modal>
        )}
        {this.saveModalOpen === 'ddwembed' && (
          <Modal
            onHide={() => (this.saveModalOpen = false)}
            show
            backdrop="static"
            className={classes.modal}
          >
            <Modal.Header closeButton>
              <Modal.Title>Share URL</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Grid>
                <Row>
                  <Col md={12}>
                    Copy and paste this into any Markdown (Comments, Summaries,
                    Insights) on data.world to render this chart:
                  </Col>
                </Row>
                <Row>
                  <Col md={12} data-test="share-markdown-embed">
                    <CopyField
                      getValue={() => {
                        const storeConfig = this.props.store.config
                        const data = this.data || []
                        let spec = storeConfig.getSpecWithMinimumAmountOfData(
                          data
                        )
                        return '```vega-lite\n' + JSON.stringify(spec)
                      }}
                    />
                  </Col>
                </Row>
              </Grid>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={() => (this.saveModalOpen = false)}>Done</Button>
            </Modal.Footer>
          </Modal>
        )}
      </Fragment>
    )
  }
}

decorate(App, {
  // data: null,
  loading: observable,
  errorLoading: observable,
  saveModalOpen: observable,
  bytesDownloaded: observable
})

export default inject('store')(observer(App))
