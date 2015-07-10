import AceEditor from 'es6!js/views/ace'
import ReactBs from 'react-bootstrap'
import React from 'react'
import PubSub from 'pubsub'
import _ from 'underscore'
import globalVars from 'es6!js/lib/global'

var TabbedArea = ReactBs.TabbedArea
  , TabPane = ReactBs.TabPane
  , ButtonToolbar = ReactBs.ButtonToolbar
  , Button = ReactBs.Button

var modes = {
  'c_cpp': [ '.ino', '.cpp', '.cc', '.c', '.h']
}

function getMode (filename) {
  // var ext = path.extname(filename)
  var ext = filename.slice(filename.lastIndexOf('.'))
  for (var mode in modes) {
    if (_.contains(modes[mode], ext)) return mode
  }
  return 'text'
}

var Editor = React.createClass ({
  getInitialState() {
    return {
      project: {
        name: ''
      , files: [{name: 'empty-file', content: ''}]
      }
    }
  }

, componentDidMount() {
    var self = this
    PubSub.subscribe('editor_load_'+this.props.name, function (topic, project) {
      console.log(topic, project)
      self.setState({project: project})
      globalVars.activeProject = project
    })
  }

, render() {
    var self = this

    return (
      <div>
      <TabbedArea defaultActiveKey={1}>
        {this.state.project.files.map(function (file, i) {
          return (
            <TabPane eventKey={i+1} tab={file.name}>
              <AceEditor mode={getMode(file.name)}
                         theme='twilight'
                         name={file.name}
                         value={file.content}
                         ref={'tab-'+i}
                         file={file}></AceEditor>
            </TabPane>
          )
        }, [])}
      </TabbedArea>
      <ButtonToolbar>
        <Button onClick={this.save}>Save</Button>
      </ButtonToolbar>
      </div>
    )
  }

, save() {
    for (var i in this.refs) {
      this.state.project.files[i.slice(4)].content = this.refs[i].editor.getValue()
    }
    // console.log(this.state.project)
    PubSub.publish('save_files', this.state.project)

  }

, getCode() {
    console.log(this.props.children)
  }
})

export default Editor
