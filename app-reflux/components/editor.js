import AceEditor from 'react-ace'
import React from 'react'
import projectActions from '../actions/project-actions'
import 'brace/mode/c_cpp'
import 'brace/theme/tomorrow'

class Editor extends React.Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  componentDidMount() {
    this.refs.ace.editor.on('change', function (e) {
      // projectActions.changeFile()

      console.log(e.data)
      console.log(this.getValue())
      projectActions.saveFiles()
    }.bind(this.refs.ace.editor))
  }

  render() {
    return (
      <div>
        <AceEditor
            mode='c_cpp'
            ref='ace'
            theme='tomorrow'/>
      </div>
    )
  }
}

Editor.propTypes = {

}

Editor.defaultProps = {

}

export default Editor
