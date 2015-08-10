import React from 'react'
import _ from 'underscore'
import AceEditor from 'react-ace'
import $ from 'jquery'
import pubsub from 'pubsub-js'

import 'brace/theme/tomorrow'
import 'brace/mode/c_cpp'

import ThemeManager from './theme'
import {
  Tab, Tabs
} from 'material-ui'

let modes = {
  'c_cpp': [ '.ino', '.cpp', '.cc', '.c', '.h']
}

let tabStyle = {height: 26, color: '#515667'}

function getMode (filename) {
  var ext = filename.slice(filename.lastIndexOf('.'))
  for (var mode in modes) {
    if (_.contains(modes[mode], ext)) return mode
  }
  return 'text'
}

class Editor extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      files: []
    }
  }

  render() {
    return (
      <div {...this.props}>
        <Tabs
            tabWidth={150}
            ref='tabs'
            style={{height: '100%'}}
            inkBarStyle={{backgroundColor: '#4684df'}}
            contentContainerStyle={{backgroundColor: 'rgb(246, 246, 246)', height: 'calc(100% - 26px)'}}
            tabItemContainerStyle={{width: 150 * this.state.files.length, height: 26}}>
          {
            this._getTabs()
          }
        </Tabs>
      </div>
    )
  }

  componentDidMount() {
    let self = this

    this.resize(true)


    $(window).resize(()=>{
      self.resize(true)
    })

    pubsub.subscribe('editor_save_all_files', ()=>{
      this.saveAllFiles()
    })

    pubsub.subscribe('show_file', (topic, file)=>{
      let idx = _.findIndex(this.state.files, {name: file.name})
      if (idx !== -1)
        this.refs.tabs.setState({
          selectedIndex: idx
        })

      else
        this.addFile(file)
    })

    pubsub.subscribe('delete_current_file', ()=>{
      let currentFile = this.state.files[this.refs.tabs.state.selectedIndex]
      this.removeFile(null, currentFile)
      this.setState({
        files: this.state.files.filter((file)=>{
          return file.name !== currentFile.name || file.root !== currentFile.root
        })
      })
      pubsub.publish('delete_file', currentFile)
    })

    pubsub.subscribe('remove_file', this.removeFile.bind(this))

    pubsub.subscribe('clear_files', ()=> {
      this.setState({
        files: []
      })
    })

    pubsub.subscribe('insert_header', (topic, filename)=>{
      this.insertHeader(filename)
    })
  }

  componentDidUpdate() {
    this.resize(true)
    // this.setMaxLines(24)
  }

  componentWillUnmount() {
    $(window).unbind('resize')
  }

  insertHeader(filename) {
    let editor = this.refs['tab-' + this.refs.tabs.state.selectedIndex].editor
      , oldCursorPos = editor.getCursorPosition()
    oldCursorPos.row++
    editor.moveCursorTo(0, 0)
    editor.clearSelection()
    editor.insert('#include<' + filename + '>\n')
    editor.moveCursorTo(oldCursorPos)
  }

  addFile(file) {
    this.setState({
      files: this.state.files.concat([file])
    })
    let idx = _.findIndex(this.state.files, {name: file.name})
    if (idx !== -1)
      this.refs.tabs.setState({
        selectedIndex: idx
      })
  }

  removeFile(topic, target) {
    this.setState({
      files: this.state.files.filter((file)=>{
        return (target.root !== file.root || target.name !== file.name)
      })
    })
    this.refs.tabs.setState({
      selectedIndex: 0
    })
  }

  saveAllFiles() {
    let self = this
    let filesToSave = _.keys(this.refs)
          .filter((name)=>{
            return name.startsWith('tab-')
          })
          .reduce((files, name)=>{
            let file = _.clone(self.refs[name].props.file)
              , newContent = self.refs[name].editor.getValue()

            if (newContent !== file.content) {
              file.content = self.refs[name].editor.getValue()
              files.push(file)
            }
            return files
          }, [])
    // console.log(filesToSave)
    pubsub.publish('save_files', filesToSave)
  }

  resize() {
    let height = $('#editor').height() - 26
    for (var com in this.refs) {
      if (com.indexOf('tab-') !== 0) continue
      $('#' + com).css('width', $(React.findDOMNode(this)).css('width'))
      // let height = $(React.findDOMNode(this)).height() - 50
      // console.log(Math.floor(height / 16))
      this.setMaxLines(Math.floor(height / 16))
      this.refs[com].editor.resize()
    }
  }

  setMaxLines(lines) {
    for (var com in this.refs) {
      if (com.indexOf('tab-') !== 0) continue
      this.refs[com].editor.setOptions({
        maxLines: lines
      , minLines: lines
      })
    }
  }

  _getTabs() {
    // show a default file when no file is loaded, so it doesn't look wiered
    if (this.state.files.length === 0)
      return (
          <Tab label='Untitled'
            style={tabStyle}
            onContextMenu={(e)=>{
              e.preventDefault()
              console.log(this, e)
            }}>
          <AceEditor
              mode='text'
              style={{width: '100%', height: 200}}
              theme='tomorrow'
              name='tab-0'
              value={
               '\n\nClick files on the left to show and edit them.'
              + '\n\nPlease create a new project if you don\'t have one'
              }
              ref='tab-0'
              file={null}/>
        </Tab>
      )

    let tabs = this.state.files.map((file, i)=>{
      return (
        <Tab label={file.name}
            style={tabStyle}
            onContextMenu={(e)=>{
              e.preventDefault()
              console.log(this, e)
            }}>
          <AceEditor mode={getMode(file.name)}
                     style={{width: '100%', height: 200}}
                     theme='tomorrow'
                     name={'tab-' + i}
                     value={file.content}
                     ref={'tab-' + i}
                     file={file}/>
        </Tab>
      )
    })
    return tabs
  }

  getChildContext() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    }
  }
}

Editor.childContextTypes = {
  muiTheme: React.PropTypes.object
}

Editor.propTypes = {

}

Editor.defaultProps = {

}

export default Editor
