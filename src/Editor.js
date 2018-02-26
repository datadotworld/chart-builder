// @flow
import React, { Component } from 'react'
import { css } from 'emotion'
import debounce from 'lodash/debounce'
import MonacoEditor from 'react-monaco-editor'
import { Measure } from 'react-measure'

const classes = {
  container: css`
    overflow: hidden;
    flex: 1 1 auto;
  `
}

const vegaLiteSchema = require('./vega-lite-schema-v2.json')

const monacoJsonSchema = {
  uri: 'https://vega.github.io/schema/vega-lite/v2.json',
  schema: vegaLiteSchema,
  fileMatch: ['*']
}

const requireConfig = {
  url: 'https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.1/require.min.js',
  paths: {
    vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.10.1/min/vs'
  }
}

const MONACO_OPTIONS = {
  folding: true,
  scrollBeyondLastLine: true,
  wordWrap: true,
  wrappingIndent: 'same',
  automaticLayout: true,
  autoIndent: true,
  cursorBlinking: 'smooth',
  lineNumbersMinChars: 4
}

type Props = {
  value: string,
  onChange: (s: string) => mixed
}

type State = {
  code: string
}

export default class Editor extends Component<Props, State> {
  state = {
    code: this.props.value
  }

  editor: any
  editorDidMount = (editor: any) => {
    editor.focus()
    this.editor = editor
  }

  changedDebounced = debounce((spec: string) => {
    this.props.onChange(spec)
    this.editor.focus()
  }, 700)

  handleEditorChange = (spec: string) => {
    this.setState({ code: spec })
    this.changedDebounced(spec)
  }

  editorWillMount = (monaco: any) => {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: true,
      schemas: [monacoJsonSchema]
    })
  }

  render() {
    const { code } = this.state

    return (
      <Measure bounds>
        {({ bind, measurements }) => (
          <div {...bind('container')} className={classes.container}>
            {measurements && measurements.container.height ? (
              <MonacoEditor
                width={measurements.container.width}
                height={measurements.container.height}
                language="json"
                options={MONACO_OPTIONS}
                value={code}
                onChange={this.handleEditorChange}
                requireConfig={requireConfig}
                editorWillMount={this.editorWillMount}
                editorDidMount={this.editorDidMount}
              />
            ) : null}
          </div>
        )}
      </Measure>
    )
  }
}
