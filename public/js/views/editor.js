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

    PubSub.subscribe('start_save_files', function () {
      self.save()
    })

    PubSub.subscribe('insert_header', function (topic, header) {
      self.insertHeader(header)
    })
  }

, render() {
    var self = this

    return (
      <div>
      <TabbedArea defaultActiveKey={1} ref='editor-tabs'>
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

, insertHeader(header) {
    console.log('IN EDITOR', header)
    // var oldCursorPos = this.edi
    var tab = 'tab-' + (this.refs['editor-tabs'].state.activeKey - 1)
    var editor = this.refs[tab].editor
    var oldCursorPos = editor.getCursorPosition()
    oldCursorPos.row++
    editor.moveCursorTo(0, 0)
    editor.clearSelection()
    editor.insert('#include<'+header+'>\n')
    editor.moveCursorTo(oldCursorPos)

    // console.log(oldCursorPos)
  }
})

export default Editor
