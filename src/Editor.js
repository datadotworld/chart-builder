// @flow
import React, { Component } from 'react'
import MonacoEditor from 'react-monaco-editor'

const vegaLiteSchema = require('./vega-lite-schema-v2.json')

const monacoJsonSchema = {
  uri: 'https://vega.github.io/schema/vega-lite/v2.json',
  schema: vegaLiteSchema,
  fileMatch: ['*']
}

function debounce(func, wait, immediate) {
  let timeout
  return function() {
    const context = this,
      args = arguments
    const later = () => {
      timeout = null
      if (!immediate) func.apply(context, args)
    }
    const callNow = immediate && !timeout
    timeout && clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(context, args)
  }
}

const requireConfig = {
  url: 'https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.1/require.min.js',
  paths: {
    vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.10.1/min/vs'
  }
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

  editorDidMount(editor: any) {
    editor.focus()
  }

  handleEditorChange = (spec: string) => {
    // if (this.props.autoParse) {
    //   this.updateSpec(spec)
    // } else {
    //   this.props.updateEditorString(spec)
    // }
  }

  editorWillMount = (monaco: any) => {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: true,
      schemas: [monacoJsonSchema]
    })
  }

  render() {
    const code = this.state.code

    return (
      <div style={{ height: 600 }}>
        <MonacoEditor
          language="json"
          options={{
            folding: true,
            scrollBeyondLastLine: true,
            wordWrap: true,
            wrappingIndent: 'same',
            automaticLayout: true,
            autoIndent: true,
            cursorBlinking: 'smooth',
            lineNumbersMinChars: 4
          }}
          value={code}
          onChange={debounce(this.handleEditorChange, 700)}
          requireConfig={requireConfig}
          editorWillMount={this.editorWillMount}
          editorDidMount={this.editorDidMount}
        />
      </div>
    )
  }
}
