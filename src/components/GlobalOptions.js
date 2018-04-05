// @flow
import React, { Component } from 'react'
import { FormControl, FormGroup, InputGroup, HelpBlock } from 'react-bootstrap'
import { observer, inject } from 'mobx-react'
import classes from './GlobalOptions.module.css'

import type { StoreType } from '../util/Store'

type Props = {
  store: StoreType
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
                value={store.config.width || ''}
                onChange={e => {
                  const val = parseInt(e.target.value)
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
                value={store.config.height || ''}
                onChange={e => {
                  const val = parseInt(e.target.value)
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
