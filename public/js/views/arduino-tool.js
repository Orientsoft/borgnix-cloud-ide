import $ from 'jquery'
import React from 'react'
import PubSub from 'pubsub'
import ReactBs from 'react-bootstrap'
import globalVars from 'es6!js/lib/global'
import Terminal from 'es6!js/views/terminal'
import colors from 'es6!js/lib/colors'
import Treeview from 'es6!js/views/tree-view'
import Dropzone from 'es6!js/views/dropzone'
import BAC from 'es6!bac-client'
colors.enabled = true

var bac = new BAC({
  prefix: '/c'
, host: ''
})

const ButtonToolbar = ReactBs.ButtonToolbar
    , Button = ReactBs.Button
    , Input = ReactBs.Input
    , TabbedArea = ReactBs.TabbedArea
    , TabPane = ReactBs.TabPane

function fileNode (name) {
  return {
    id: name
  , text: name
  , icon: 'glyphicon glyphicon-leaf'
  , opened: false
  , selected: false
  , children: []
  }
}

function dirNode (name) {
  return {
    id: name
  , text: name
  , icon: 'glyphicon glyphicon-folder-open'
  , opened: false
  , selected: false
  , children: []
  }
}

function libToTree (lib) {
  var libNode = dirNode(lib.name)
  for (var header of lib.headers) {
    libNode.children.push(fileNode(header))
  }
  return libNode
}

var DropzoneDemo = React.createClass({
    getInitialState: function () {
      return { files: []}
    },
    onDrop: function (files) {
      console.log('Received files: ', files)
      this.setState({files: files})
    },

    onOpenClick: function () {
      var files = this.state.files
      var data = new FormData()
      $.each(files, function(key, value){
          data.append(key, value)
      })

      var opt = {
        uuid: 'uuid'
      , token: 'token'
      , data: data
      }

      bac.uploadZipLib(opt, function (data) {
        if(typeof data.error === 'undefined'){
          console.log('good')
        }
        else{
          console.log('ERRORS: ' + data.error)
        }
      })
    },

    render: function () {
      return (
          <div>
            <Dropzone ref="dropzone" onDrop={this.onDrop} size={150} >
              <div>Try dropping some files here, or click to select files to upload.</div>
            </Dropzone>
            <button type="button" onClick={this.onOpenClick}>
                Upload
            </button>
          </div>
      )
    }
})

const ArduinoTool = React.createClass({
  render() {
    return (
      <TabbedArea defaultActiveKey={1}>
        <TabPane eventKey={1} tab='compile'>
          <Terminal id='arduino' ref='output'></Terminal>
        </TabPane>
        <TabPane eventKey={2} tab='libraries'>
          <Treeview dataSource={
                      this.state.libs.userLibs.map(function (lib) {
                        return libToTree(lib)
                      }, []).concat(this.state.libs.ideLibs.map(function (lib) {
                        return libToTree(lib)
                      }, []))
                    }
                    onTreenodeClick={this.insertHeader}></Treeview>
          <DropzoneDemo />
        </TabPane>
      </TabbedArea>
    )
  }
, getInitialState() {
    return { libs: {userLibs: [], ideLibs: []}}
  }
, print() {
    var term = this.refs.output.term
    term.writeln('asdfnqwkbhqwoen:ALISHG')
    term.writeln('asaoisef:LKJSFasdnasis:LKASF')
    term.writeln('*123456789*123456789*123456789*123456789*123456789*123456789*123456789*123456789')
  }
, componentDidMount() {
    PubSub.subscribe('compile', this.compile)
    PubSub.subscribe('download-hex', this.getHex)
    this.getLibs()
  }
, compile() {
    var project = globalVars.activeProject
    console.log(project)
    var self = this
    self.refs.output.term.writeln('compiling...')

    var opt = {
      uuid: project.owner
    , token: 'token'
    , type: project.type
    , name: project.name
    }

    bac.compile(opt, function (data) {
      var term = self.refs.output.term
      if (data.status === 1) {
        term.writeln(colors.red(data.content.stderr || data.content))
      }
      else {
        term.writeln(colors.green(data.content.stdout))
      }
    })
  }
, getHex() {
    var project = globalVars.activeProject

    var opt = {
      uuid: project.owner
    , token: 'token'
    , type: project.type
    , name: project.name
    }

    bac.findHex(opt, function (res) {
      if (res.status === 0) {
        $('#dowload-iframe').attr('src', res.url)
      }
      else {
        $('#arduino-output').append('\nHex file not found\n')
      }
    })
  }
, getLibs() {
    var self = this
    bac.listLibs('uuid', function (data) {
      self.setState({libs: data.content})
    })
  }

, insertHeader(file) {
    if (file.indexOf('.h', this.length - '.h'.length) !== -1)
      PubSub.publish('insert_header', file)
  }
})

export default ArduinoTool
