// @flow
import React, { Component } from 'react'
import { FormControl, FormGroup, InputGroup, HelpBlock } from 'react-bootstrap'
import { observer, inject } from 'mobx-react'
import classes from './GlobalOptions.module.css'

import type { StoreType } from '../util/Store'

type Props = {
  store: StoreType
}

function getVal(val: string): null | number {
  // allow backspace to reset to auto
  if (val === '') return null
  return parseInt(val, 10)
}

class GlobalOptions extends Component<Props> {
  render() {
    const { store } = this.props
    return (
      <div>
        <div className={classes.dimensions}>
          <FormGroup bsSize="sm" className={classes.formGroup}>
            <InputGroup>
              <FormControl
                type="number"
                placeholder="Auto"
                disabled={store.config.hasManualSpec}
                value={store.config.width != null ? store.config.width : ''}
                onChange={e => {
                  const val = getVal(e.target.value)
                  if (!isNaN(val)) {
                    store.config.setDimensions(val, store.config.height)
                  }
                }}
              />
              <HelpBlock>Width</HelpBlock>
            </InputGroup>
          </FormGroup>
          <div className={classes.cross}>×</div>
          <FormGroup bsSize="sm" className={classes.formGroup}>
            <InputGroup>
              <FormControl
                type="number"
                placeholder="Auto"
                disabled={store.config.hasManualSpec}
                value={store.config.height != null ? store.config.height : ''}
                onChange={e => {
                  const val = getVal(e.target.value)
                  if (!isNaN(val)) {
                    store.config.setDimensions(store.config.width, val)
                  }
                }}
              />
              <HelpBlock>Height</HelpBlock>
            </InputGroup>
          </FormGroup>
        </div>
      </div>
    )
  }
}

export default inject('store')(observer(GlobalOptions))
