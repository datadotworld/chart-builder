// @flow
import React, { Component } from 'react'
import debounce from 'lodash/debounce'
import MonacoEditor from 'react-monaco-editor'
import { Measure } from 'react-measure'
import vegaLiteSchema from '../util/vega-lite-schema-v5.json'
import classes from './Editor.module.css'

const monacoJsonSchema = {
  uri: 'https://vega.github.io/schema/vega-lite/v5.json',
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
  trackValueChanges: boolean,
  value: string,
  onChange: (s: string) => mixed
}

type State = {
  hasMadeLocalModifications: boolean,
  code: string
}

export default class Editor extends Component<Props, State> {
  state = {
    hasMadeLocalModifications: false,
    code: this.props.value
  }

  editor: any
  editorDidMount = (editor: any) => {
    editor.focus()
    this.editor = editor
  }

  componentDidUpdate(prevProps: Props) {
    if (
      prevProps.value !== this.props.value &&
      this.props.trackValueChanges &&
      !this.state.hasMadeLocalModifications
    ) {
      this.setState({ code: this.props.value })
    }
  }

  changedDebounced = debounce((spec: string) => {
    this.props.onChange(spec)
    this.editor.focus()
  }, 700)

  handleEditorChange = (spec: string) => {
    this.setState({ code: spec, hasMadeLocalModifications: true })
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
