import AceEditor from 'react-ace'
import React from 'react'
// import projectActions from '../actions/project-actions'

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
    })
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
