import $ from 'jquery'
import React from 'react'
import PubSub from 'pubsub'
import ReactBs from 'react-bootstrap'
import globalVars from 'es6!js/lib/global'
import Terminal from 'es6!js/views/terminal'
import colors from 'es6!js/lib/colors'
import Treeview from 'es6!js/views/tree-view'
import Dropzone from 'es6!js/views/dropzone'
colors.enabled = true

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
      console.log('Received files: ', files);
      this.setState({files: files})
    },

    onOpenClick: function () {
      // this.refs.dropzone.open();
      // console.log(this.refs.dropzone.refs.fileInput)
      console.log(this.state.files)
      var files = this.state.files
      var data = new FormData();
      $.each(files, function(key, value){
          data.append(key, value);
      });

      $.ajax({
          url: 'c/upload-zip-lib?uuid=uuid&token=token',
          type: 'POST',
          data: data,
          cache: false,
          dataType: 'json',
          processData: false, // Don't process the files
          contentType: false, // Set content type to false as jQuery will tell the server its a query string request
          success: function(data, textStatus, jqXHR){
              if(typeof data.error === 'undefined'){
                  // Success so call function to process the form
                  // submitForm(event, data);
                  console.log('good')
              }
              else{
                  // Handle errors here
                  console.log('ERRORS: ' + data.error);
              }
          },
          error: function(jqXHR, textStatus, errorThrown){
              // Handle errors here
              console.log('ERRORS: ' + textStatus);
              // STOP LOADING SPINNER
          }
      });
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
      );
    }
});

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
    term.writeln('asaoisef:LKJSFasdnas;is:LKASF')
    term.writeln('*123456789*123456789*123456789*123456789*123456789*123456789*123456789*123456789')
  }
, componentDidMount() {
    // console.log(this.refs.output.term)
    // this.refs.output.editor.getSession().setUseWrapMode(true)

    PubSub.subscribe('compile', this.compile)
    PubSub.subscribe('download-hex', this.getHex)
    this.getLibs()
  }
, compile() {
    var project = globalVars.activeProject
    console.log(project)
    var self = this
    self.refs.output.term.writeln('compiling...')
    $.ajax({
      url: 'http://127.0.0.1:3000/c/compile'
    , method: 'POST'
    , data: {
        uuid: project.owner
      , token: 'token'
      , type: project.type
      , name: project.name
      }
    , success: function (data) {
        var term = self.refs.output.term
        // console.log(data)
        if (data.status === 1) {
          // console.log(data.content)
          term.writeln(colors.red(data.content.stderr || data.content))
        }
        else {
          term.writeln(colors.green(data.content.stdout))
        }
      }
    })
  }
, getHex() {
    var project = globalVars.activeProject
    $.ajax({
      url: 'http://127.0.0.1:3000/c/findhex'
    , method: 'GET'
    , data: {
        uuid: project.owner
      , token: 'token'
      , type: project.type
      , name: project.name
      }
    , success: function (data) {
        // $('#arduino-output').append(data)
        if (data === 'yes') {
          var url = 'http://127.0.0.1:3000/c/hex/'+project.name+'.hex'+'?' + $.param({
              uuid: project.owner
            , token: 'token'
            , type: project.type
            , name: project.name
            })
          $('#dowload-iframe').attr('src', url)
        }
        else {
          $('#arduino-output').append('\nHex file not found\n')
        }
      }
    })
  }
, getLibs() {
    var self = this
    $.ajax({
      url: 'http://127.0.0.1:3000/c/libs'
    , method: 'GET'
    , data: {
        uuid: 'uuid'
      }
    , success: function (data) {
        self.setState({libs: data.content})
      }
    })
  }
, insertHeader(file) {
    // console.log(a, b, c)
    if (file.indexOf('.h', this.length - '.h'.length) !== -1)
      // console.log('INSERT', file)
      PubSub.publish('insert_header', file)
  }
})

export default ArduinoTool
