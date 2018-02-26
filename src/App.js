// @flow
import React, { Fragment, Component } from 'react'
import { extendObservable, runInAction } from 'mobx'
import { observer, inject } from 'mobx-react'
import { Link } from 'react-router-dom'
import DevTools from 'mobx-react-devtools'
import {
  Grid,
  Row,
  Button,
  Col,
  Tabs,
  Tab,
  ButtonToolbar,
  Alert,
  OverlayTrigger,
  Popover,
  DropdownButton,
  MenuItem
} from 'react-bootstrap'
import { css } from 'emotion'
import DownloadButton from './DownloadButton'
import LoadingAnimation from './LoadingAnimation'
import SaveAsFileModal from './SaveAsFileModal'
import SaveAsInsightModal from './SaveAsInsightModal'
import { API_HOST } from './constants'
import Header from './Header'
import { getStateUrl } from './urlState'
import VizCard from './VizCard'
import Editor from './Editor'
import SimpleSelect from './SimpleSelect'
import Encoding from './Encoding'
import VizEmpty from './VizEmpty'
import ResizableVegaLiteEmbed from './ResizableVegaLiteEmbed'
import CopyField from './CopyField'
import SidebarFooter from './SidebarFooter'
import type { StoreType } from './Store'

const classes = {
  builderTab: css`
    padding: 0.875rem;
  `,

  editTab: css`
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;

    & .nav {
      background-color: #f7f7f7;
      background-image: none;
      transition: border-color 0.15s ease-in-out, box-shadow 0.25s ease-in-out;
      padding-left: 1.5rem;
      flex-shrink: 0;
    }

    & .tab-content {
      border-top: none;
      overflow-y: auto;
      overflow-x: hidden;
      flex: 1 1 auto;

      display: flex;
      flex-direction: column;
    }

    & #configure-tabs-pane-2 {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
    }
  `,

  manualAlert: css`
    padding: 0.5rem;
    margin-bottom: 1rem;
    & .btn {
      padding: 0;
      margin-left: 0.5rem;
      line-height: 1;
      height: auto;
      vertical-align: inherit;
    }
  `,

  title: css`
    font-family: Lato;
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 20px;
    margin: 1rem 0;
  `,

  topBar: css`
    background-color: #fff;
    box-shadow: inset 0 -1px 0 0 #dfdfdf, inset 1px 0 0 0 #dfdfdf;
    height: 3.5rem;
    position: relative;
    width: 100%;
  `,
  topBarButtons: css`
    flex-shrink: 0;
  `,
  topBarCol: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 3.5rem;
  `,
  topBarHeader: css`
    color: #4e5057;
    font-size: 1.125rem;
    font-weight: 700;
    line-height: 1.25rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex-shrink: 0;
  `,
  sidebar: css`
    width: 400px;
    background-color: rgb(255, 255, 255);
    box-shadow: rgba(0, 0, 0, 0.1) 2px 0px 4px 0px;
    flex-shrink: 0;
    z-index: 4;
    display: flex;
    flex-direction: column;
  `,
  embed: css`
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    min-width: 0px;
  `,
  main: css`
    flex-grow: 1;
    display: flex;
  `,
  dropdownButton: css`
    & + .dropdown-menu {
      min-width: 10rem;
    }
  `
}

const MARKS = [
  'area',
  'bar',
  'line',
  'point',
  'tick',
  'rect',
  'circle',
  'square'
]

class App extends Component<{
  history: Object,
  location: Object,
  store: StoreType
}> {
  data: ?Array<Object>

  loading: boolean
  errorLoading: boolean

  saveModalOpen: false | 'insight' | 'file'

  constructor(props) {
    super(props)
    extendObservable(this, {
      // data: null,
      loading: true,
      errorLoading: false,
      saveModalOpen: false
    })

    if (this.props.store.hasValidParams) {
      this.fetchQuery()
    }
  }

  getQueryUrl() {
    const { store } = this.props
    return `${API_HOST}/v0/sql/${store.agentid}/${
      store.datasetid
    }?includeTableSchema=true`
  }

  fetchQuery = async () => {
    const { store } = this.props
    runInAction(() => {
      store.setFields([])
      this.data = null
      this.loading = true
    })
    const res = await fetch(this.getQueryUrl(), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${store.token}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ query: store.query }).toString()
    })
    if (!res.ok) {
      runInAction(() => {
        this.loading = false
        this.errorLoading = true
      })
      return
    }
    const data = await res.json()
    const [dschema, ...rows] = data
    runInAction(() => {
      store.setFields([
        ...dschema.fields.map(f => ({
          name: f.name,
          rdfType: f.rdfType
        })),
        {
          name: '*',
          label: 'COUNT(*)',
          rdfType: 'http://www.w3.org/2001/XMLSchema#string'
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

  renderShareOverlay() {
    return (
      <Popover id="popover-share-url" title="Share Link">
        <CopyField getValue={() => getStateUrl(this.props.store)} />
      </Popover>
    )
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
          {process.env.NODE_ENV === 'development' && <DevTools />}
          <Header />
          <Grid style={{ marginTop: 32 }}>
            <Row>
              <Col xs={12}>
                <h3>Valid parameters required</h3>
                <Link
                  to={{
                    pathname: '/',
                    search:
                      '?agentid=data-society&datasetid=iris-species&query=SELECT+%2A%0AFROM+iris'
                  }}
                >
                  Here's an example
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
          {process.env.NODE_ENV === 'development' && <DevTools />}
          <Header />
          <Grid style={{ marginTop: 32 }}>
            {this.loading ? (
              <LoadingAnimation hideOverlay />
            ) : (
              <h4>Error loading data</h4>
            )}
          </Grid>
        </Fragment>
      )
    }

    const { fields } = store

    return (
      <Fragment>
        {process.env.NODE_ENV === 'development' && <DevTools />}
        <Header agentid={store.agentid} datasetid={store.datasetid} />
        <Grid fluid className={classes.topBar}>
          <Row>
            <Col xs={12} className={classes.topBarCol}>
              <div className={classes.topBarHeader}>
                {store.agentid}/{store.datasetid}
              </div>
              <div className={classes.topBarButtons}>
                <ButtonToolbar>
                  <OverlayTrigger
                    trigger="click"
                    rootClose
                    placement="bottom"
                    overlay={this.renderShareOverlay()}
                  >
                    <Button
                      bsSize="xs"
                      disabled={!store.config.hasPossiblyValidChart}
                    >
                      Share Link
                    </Button>
                  </OverlayTrigger>
                  <DownloadButton getVegaView={() => this.vegaView} />
                  <DropdownButton
                    bsSize="xs"
                    title="Save as..."
                    id="dropdown-save-ddw"
                    disabled={!store.config.hasPossiblyValidChart}
                    className={classes.dropdownButton}
                    pullRight
                    noCaret
                    onSelect={ek => (this.saveModalOpen = ek)}
                  >
                    <MenuItem header>data.world</MenuItem>
                    <MenuItem eventKey="file">File</MenuItem>
                    <MenuItem eventKey="insight">Insight</MenuItem>
                  </DropdownButton>
                </ButtonToolbar>
              </div>
            </Col>
          </Row>
        </Grid>
        <div className={classes.main}>
          <div className={classes.sidebar}>
            <Tabs
              defaultActiveKey={store.config.hasManualSpec ? 2 : 1}
              id="configure-tabs"
              animation={false}
              className={classes.editTab}
              unmountOnExit
            >
              <Tab
                eventKey={1}
                title="Visual Builder"
                className={classes.builderTab}
              >
                {store.config.hasManualSpec && (
                  <Alert className={classes.manualAlert}>
                    You've manually edited the spec, so you can't modify these
                    fields.
                    <Button
                      bsStyle="link"
                      onClick={() => store.config.setManualSpec(null)}
                    >
                      Undo manual modifications
                    </Button>
                  </Alert>
                )}
                <div className={classes.title}>Marks</div>
                <SimpleSelect
                  values={MARKS}
                  value={store.config.mark}
                  onChange={e => store.config.setMark(e)}
                  disabled={store.config.hasManualSpec}
                />
                <div className={classes.title}>
                  Configure Chart
                  <Button
                    bsStyle="link"
                    bsSize="xs"
                    className="pull-right"
                    style={{ paddingLeft: 0, paddingRight: 0 }}
                    onClick={() => store.config.addEncoding()}
                    disabled={store.config.hasManualSpec}
                  >
                    Add encoding
                  </Button>
                </div>
                {fields && (
                  <Fragment>
                    {store.config.encodings.map(e => {
                      return (
                        <Encoding
                          key={e._id}
                          fields={fields}
                          encoding={e}
                          disabled={store.config.hasManualSpec}
                        />
                      )
                    })}
                    <div />
                  </Fragment>
                )}
              </Tab>
              <Tab
                eventKey={2}
                title="Vega-Lite Editor"
                disabled={!store.config.hasPossiblyValidChart}
              >
                {store.config.hasPossiblyValidChart && (
                  <Editor
                    onChange={store.config.setManualSpec}
                    value={JSON.stringify(store.config.generatedSpec, null, 2)}
                  />
                )}
              </Tab>
            </Tabs>
            <SidebarFooter />
          </div>
          <div className={classes.embed}>
            <VizCard>{this.renderEmbed()}</VizCard>
          </div>
        </div>
        {this.saveModalOpen === 'insight' && (
          <SaveAsInsightModal
            onClose={() => (this.saveModalOpen = false)}
            spec={store.config.generatedSpec}
            defaultId={store.agentid + '/' + store.datasetid}
            data={this.data}
          />
        )}
        {this.saveModalOpen === 'file' && (
          <SaveAsFileModal
            onClose={() => (this.saveModalOpen = false)}
            spec={store.config.generatedSpec}
            defaultId={store.agentid + '/' + store.datasetid}
            data={this.data}
          />
        )}
      </Fragment>
    )
  }
}

export default inject('store')(observer(App))
