import AceEditor from 'react-ace'
import ReactBs from 'react-bootstrap'
import React from 'react'
import pubsub from 'pubsub-js'
import _ from 'underscore'
import $ from 'jquery'
// import globalVars from 'es6!js/lib/global'

var TabbedArea = ReactBs.TabbedArea
  , TabPane = ReactBs.TabPane
  , ButtonToolbar = ReactBs.ButtonToolbar
  , Button = ReactBs.Button

class Editor extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      project: {
        name: ''
      , files: [{name: 'empty-file', content: ''}]
      }
    }
  }

  get modes() {
    return {
      'c_cpp': [ '.ino', '.cpp', '.cc', '.c', '.h']
    }
  }

  componentDidMount() {
    var self = this

    console.log(this.mode)

    self.resize()

    $(window).resize(function () {
      self.resize()
    })

    pubsub.subscribe('editor_load_'+this.props.name, function (topic, project) {
      console.log(topic, project)
      self.setState({project: project})
      // globalVars.activeProject = project
    })

    pubsub.subscribe('start_save_files', function () {
      self.save()
    })

    pubsub.subscribe('insert_header', function (topic, header) {
      self.insertHeader(header)
    })
  }

  render() {
    var self = this

    return (
      <div>
      <TabbedArea defaultActiveKey={1} ref='editor-tabs'>
        {this.state.project.files.map(function (file, i) {
          return (
            <TabPane eventKey={i+1} tab={file.name}>
              <AceEditor mode={self.getMode(file.name)}
                         theme='twilight'
                         name={'tab-'+i}
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

  save() {
    console.log(this)
    for (var i in this.refs) {
      if (i.indexOf('tab-') === 0)
        this.state.project.files[i.slice(4)].content = this.refs[i].editor.getValue()
    }
    // console.log(this.state.project)
    pubsub.publish('save_files', this.state.project)
  }

  insertHeader(header) {
    var tab = 'tab-' + (this.refs['editor-tabs'].state.activeKey - 1)
    var editor = this.refs[tab].editor
    var oldCursorPos = editor.getCursorPosition()
    oldCursorPos.row++
    editor.moveCursorTo(0, 0)
    editor.clearSelection()
    editor.insert('#include<'+header+'>\n')
    editor.moveCursorTo(oldCursorPos)
  }

  resize() {
    for (var com in this.refs) {
      if (com.indexOf('tab-') !== 0) continue
      $('#'+com).css('width', $(React.findDOMNode(this)).css('width'))
      this.refs[com].editor.resize()
    }
  }

  getMode (filename) {
    var ext = filename.slice(filename.lastIndexOf('.'))
    for (var mode in this.modes) {
      if (_.contains(this.modes[mode], ext)) return mode
    }
    return 'text'
  }
}

export default Editor
