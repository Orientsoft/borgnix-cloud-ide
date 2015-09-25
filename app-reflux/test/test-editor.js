import React from 'react'
import { Tabs, Tab } from 'react-bootstrap'
import AceEditor from 'react-ace'
import projectActions from '../actions/project-actions'
import 'brace/mode/c_cpp'
import 'brace/theme/tomorrow'

class TestEditor extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      key: 0
    , files: this.props.files
    }
  }

  componentWillReceiveProps(props) {
    console.log('receive', props)
    this.setState(props)
  }

  _handleSelect(key) {
    this.setState({
      key: key
    })
    projectActions.switchFile(this.state.files[this.state.key].name)
  }

  render() {
    console.log(this.state.files)
    return (
      <Tabs activeKey={this.state.key} onSelect={this._handleSelect.bind(this)}>
      {
        this.state.files.length > 0

        // show open files if any
        ? this.state.files.map(function (file, i) {
            return (
              <Tab eventKey={i} title={file.name}>
                <AceEditor
                  ref={'editor-' + i}
                  value={file.content}
                  mode='c_cpp'
                  theme='tomorrow'/>
              </Tab>
            )
          })

        // an empty tab if no file is opened
        : <Tab eventKey={0} title='untitled'>No File Openned</Tab>
      }
      </Tabs>
    )
  }
}

TestEditor.propTypes = {
  files: React.PropTypes.Array
}

TestEditor.defaultProps = {
  files: []
}

export default TestEditor
