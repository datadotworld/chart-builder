// @flow
/* eslint no-unused-vars: ["warn", { "args": "after-used" }] */
import React, { Component } from 'react'
import {
  FormGroup,
  InputGroup,
  FormControl,
  Button,
  Tooltip,
  Overlay
} from 'react-bootstrap'
import { decorate, observable } from 'mobx'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { observer } from 'mobx-react'

class CopyField extends Component<{ getValue: () => string }> {
  copied: null | string = null
  value: string = this.props.getValue()

  copyButton: ?Button

  handleCopy = (text: string, result: boolean) => {
    this.copied = result ? 'Copied!' : 'Ctrl+C to copy'
    this.input && this.input.select()
    setTimeout(() => (this.copied = null), 700)
  }

  input: ?HTMLInputElement
  handleInputRef = (r: HTMLInputElement) => {
    this.input = r
    if (r) {
      r.select()
    }
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
          <FormControl
            type="text"
            value={value}
            readOnly
            inputRef={this.handleInputRef}
          />
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

decorate(CopyField, {
  copied: observable,
  value: observable
})

export default observer(CopyField)
