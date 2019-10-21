// @flow
import React, { Component } from 'react'
import {
  Tabs,
  Tab,
  Alert,
  Button,
  Tooltip,
  OverlayTrigger
} from 'react-bootstrap'
import { observer, inject } from 'mobx-react'
import Editor from './Editor'
import Encoding from './Encoding'
import GlobalOptions from './GlobalOptions'
import SidebarFooter from './SidebarFooter'
import SimpleSelect from './SimpleSelect'
import classes from './Sidebar.module.css'
import infoIcon from './infoIcon.svg'

import type { StoreType } from '../util/Store'

type Props = {
  store: StoreType
}

const overlayDescriptions = {
  marks:
    'Marks provide basic shapes whose properties (such as position, size, and color) can be used to visually encode data',
  addEncoding:
    'Encodings represent the mapping between encoding channels (such as x, y, or color) and data fields'
}

class Sidebar extends Component<Props> {
  render() {
    const { store } = this.props
    const { fields } = store

    return (
      <div className={classes.sidebar}>
        <Tabs
          defaultActiveKey={store.config.hasManualSpec ? 'editor' : 'builder'}
          id="configure-tabs"
          animation={false}
          className={classes.editTab}
          unmountOnExit
        >
          <Tab
            eventKey="builder"
            title="Visual Builder"
            className={classes.builderTab}
          >
            {store.config.hasManualSpec && (
              <Alert className={classes.manualAlert}>
                Visual Builder editing has been disabled because of manual
                changes made in the Vega-Lite Editor.
                <Button
                  bsStyle="link"
                  onClick={() => store.config.setManualSpec(null)}
                >
                  Undo manual changes
                </Button>
              </Alert>
            )}
            <span className={classes.titleContainer}>
              <div className={classes.title}>Marks</div>
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="sidebar-marks">
                    {overlayDescriptions.marks}
                  </Tooltip>
                }
              >
                <img
                  alt="data.world info icon"
                  src={infoIcon}
                  style={{
                    height: 12,
                    width: 12,
                    marginLeft: '0.2rem'
                  }}
                />
              </OverlayTrigger>
            </span>
            <div data-test="chart-type-selector">
              <SimpleSelect
                values={[
                  'area',
                  'bar',
                  'line',
                  'point',
                  'tick',
                  'rect',
                  'circle',
                  'square'
                ]}
                labels={[
                  'Area',
                  'Bar',
                  'Line',
                  'Point',
                  'Tick',
                  'Rect',
                  'Circle',
                  'Square'
                ]}
                value={store.config.mark}
                onChange={store.config.setMark}
                disabled={store.config.hasManualSpec}
              />
            </div>
            <div className={classes.title}>
              Configuration
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="sidebar-add-encoding">
                    {overlayDescriptions.addEncoding}
                  </Tooltip>
                }
              >
                <Button
                  data-test="add-encoding"
                  bsStyle="link"
                  bsSize="xs"
                  className="pull-right"
                  style={{ paddingLeft: 0, paddingRight: 0 }}
                  onClick={store.config.addEncoding}
                  disabled={store.config.hasManualSpec}
                >
                  Add encoding
                </Button>
              </OverlayTrigger>
            </div>
            {fields && (
              <div data-test="encodings-list">
                {store.config.encodings.map((e, index) => {
                  return (
                    <Encoding
                      data-test={`encoding-container-${index}`}
                      key={e._id}
                      fields={fields}
                      encodings={store.config.encodings}
                      encoding={e}
                      disabled={store.config.hasManualSpec}
                    />
                  )
                })}
                <div />
              </div>
            )}
            <div className={classes.title}>Set chart size</div>
            <GlobalOptions />
          </Tab>
          <Tab eventKey="editor" title="Vega-Lite Editor">
            <Editor
              trackValueChanges={!store.config.hasManualSpec}
              onChange={store.config.setManualSpec}
              value={JSON.stringify(store.config.generatedSpec, null, 2)}
            />
          </Tab>
        </Tabs>
        <SidebarFooter />
      </div>
    )
  }
}

export default inject('store')(observer(Sidebar))
