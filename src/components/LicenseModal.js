// @flow
import React, { Component } from 'react'
import { Modal, Button } from 'react-bootstrap'
import { extendObservable } from 'mobx'
import { observer } from 'mobx-react'
import LoadingAnimation from './LoadingAnimation'
import classes from './LicenseModal.module.css'

// $FlowFixMe: .txt import
import licenseTextUrl from '../generated/licenses.txt'

class LicenseModal extends Component<{
  onClose: () => mixed
}> {
  licenseText: string

  constructor(props) {
    super(props)

    extendObservable(this, {
      licenseText: ''
    })
  }

  componentDidMount() {
    this.loadText()
  }

  async loadText() {
    try {
      // allow time to animate
      const [, text] = await Promise.all([
        new Promise(resolve => setTimeout(resolve, 500)),
        fetch(licenseTextUrl).then(r => r.text())
      ])

      this.licenseText = text
    } catch (e) {
      this.licenseText = `Error loading licenses: ${e.message}`
    }
  }

  render() {
    const { onClose } = this.props
    return (
      <Modal show onHide={onClose} bsSize="large" className={classes.modal}>
        <Modal.Header closeButton>
          <Modal.Title>Licenses used by this project</Modal.Title>
        </Modal.Header>
        <Modal.Body className={classes.body}>
          {this.licenseText ? (
            <div className={classes.text} data-test="license-text">
              {this.licenseText}
            </div>
          ) : (
            <LoadingAnimation />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onClose}>Close</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}

export default observer(LicenseModal)
