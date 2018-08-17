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
          <div className={classes.cross}>
            <svg
              height="20"
              width="20"
              viewBox="0 0 20 20"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z" />
            </svg>
          </div>
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
