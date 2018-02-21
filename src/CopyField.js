// @flow
import { extendObservable } from 'mobx'
import React, { Component } from 'react'
import {
  FormGroup,
  InputGroup,
  FormControl,
  Button,
  Tooltip,
  Overlay
} from 'react-bootstrap'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { observer } from 'mobx-react'

class CopyField extends Component<{ getValue: () => string }> {
  copied: null | string
  value: string

  copyButton: ?Button

  constructor(props) {
    super(props)
    extendObservable(this, {
      copied: false,
      value: props.getValue()
    })
  }

  handleCopy = (text: string, result: boolean) => {
    this.copied = result ? 'Copied!' : 'Ctrl+C to copy'
    setTimeout(() => (this.copied = null), 700)
  }

  render() {
    const { value } = this

    const copiedTooltip = this.copied && (
      <Tooltip placement="bottom" className="in" id="tooltip-bottom">
        {this.copied}
      </Tooltip>
    )

    return (
      <FormGroup bsSize="xs" style={{ marginBottom: 0 }}>
        <InputGroup>
          <FormControl type="text" value={value} readOnly />
          <InputGroup.Button bsSize="xs">
            <CopyToClipboard text={value} onCopy={this.handleCopy}>
              <Button bsSize="xs" ref={r => (this.copyButton = r)}>
                Copy
              </Button>
            </CopyToClipboard>
          </InputGroup.Button>
          {!!this.copied && (
            <Overlay
              placement="top"
              show
              container={document.body}
              target={() => this.copyButton}
            >
              {copiedTooltip}
            </Overlay>
          )}
        </InputGroup>
      </FormGroup>
    )
  }
}
export default observer(CopyField)
