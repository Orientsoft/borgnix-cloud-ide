import React from 'react'
import _ from 'underscore'
import AceEditor from 'react-ace'
import $ from 'jquery'


import 'brace/theme/twilight'
import 'brace/mode/c_cpp'

import ThemeManager from './theme'
import {
  Tab, Tabs, FontIcon
} from 'material-ui'

class Editor extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      files: [{name: 'a', content:''}]
    }
  }

  render() {
    return (
      <div {...this.props}>
        <Tabs tabWidth={150}  tabItemContainerStyle={{width: 150 * this.state.files.length}}>
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
    this.setMaxLines(24)

    $(window).resize(()=>{
      self.resize(true)
    })
  }

  componentDidUpdate() {
    this.resize(true)
    this.setMaxLines(24)
  }

  componentWillUnmount() {
    $(window).unbind('resize')
  }

  addFile(file) {
    this.setState({
      files: this.state.files.concat([file])
    })
  }

  resize() {
    for (var com in this.refs) {
      if (com.indexOf('tab-') !== 0) continue
      $('#'+com).css('width', $(React.findDOMNode(this)).css('width'))
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
    console.log('getting tabs')
    let tabs = this.state.files.map((file, i)=>{
      return (
        <Tab label={file.name}>
          <AceEditor mode={getMode(file.name)}
                     style={{width: '100%', height: 200}}
                     theme='twilight'
                     name={'tab-'+i}
                     value={file.content}
                     ref={'tab-'+i}
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

let modes = {
  'c_cpp': [ '.ino', '.cpp', '.cc', '.c', '.h']
}

function getMode (filename) {
  var ext = filename.slice(filename.lastIndexOf('.'))
  for (var mode in modes) {
    if (_.contains(modes[mode], ext)) return mode
  }
  return 'text'
}

export default Editor
