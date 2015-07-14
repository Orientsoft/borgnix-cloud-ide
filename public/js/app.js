import React from 'react'
import AceEditor from 'es6!js/views/ace'
import $ from 'jquery'
import ReactBs from 'react-bootstrap'
import Editor from 'es6!js/views/editor'
import Treeview from 'es6!js/views/tree-view'
import dot from 'dot-object'
import BPM from 'es6!bpm-client'
import FileBrowser from 'es6!js/views/file-browser'
import globalVars from 'es6!js/lib/global'
import PubSub from 'pubsub'
import ArduinoTool from 'es6!js/views/arduino-tool'



var ButtonToolbar = ReactBs.ButtonToolbar
  , Button = ReactBs.Button
  , Input = ReactBs.Input

  , bpm = new BPM({
      host: 'http://127.0.0.1:3000'
    , prefix: '/p'
    })

var onChange = function(obj) {
  console.log(obj)
};

var app = {
  init: function () {

    var opt = {
      uuid: 'uuid'
    , token: 'token'
    , type: 'arduino'
    , name: 'test'
    }


    React.render(
      <FileBrowser name='test' />
    , $('#file-browser')[0]
    )
    React.render(
      <Editor mode='javascript' theme="twilight" files={[{name: 'empty-file', content: ''}]} name='test' />
    , $('#editor')[0]
    )
    React.render(
      <ArduinoTool />
    , $('#arduino-tool')[0]
    )

    React.render(
      <ButtonToolbar>
        <Button onClick={this.save}>Save</Button>
        <Button onClick={this.compile}>Compile</Button>
        <Button onClick={this.downloadHex}>Download</Button>
      </ButtonToolbar>
    , $('#toolbar-container')[0]
    )

    // React.render(
    //   <div>
    //     <p>点击New按钮新建项目, type填写arduino</p>
    //     <p>点击项目名称以切换当前编辑的项目</p>
    //     <p>点击save保存对文件的更改</p>
    //     <p>点击compile编译当前正在编辑的项目</p>
    //     <p>点击.hex下载编译好的hex文件</p>
    //   </div>
    // , $('#toolbar-container')[0]
    // )

    bpm.listProject(opt, function (data) {
      console.log(data)
      globalVars.projects = data
      globalVars.activeProject = data[0]
      PubSub.publish('file_browser_load_test', data)
      PubSub.publish('editor_load_test', data[0])
    })

    PubSub.subscribe('save_files', function (topic, data) {
      var opt = {
        uuid: 'uuid'
      , token: 'token'
      , type: data.type
      , name: data.name
      , files: data.files
      }
      bpm.saveFiles(opt, function (data) {
        console.log(data)
      })
    })

    PubSub.subscribe('new_project', function (topic, opt) {
      bpm.newProject(opt, function (data) {
        globalVars.projects.push(data)
        PubSub.publish('file_browser_load_test', globalVars.projects)
      })
    })

    PubSub.subscribe('delete_project', function (topic, opt) {
      bpm.deleteProject(opt, function (data) {
        console.log('deleted', data)
        for (var i in globalVars.projects) {
          if (globalVars.projects[i].name === opt.name) {
            globalVars.projects.splice(i, 1)
            console.log(globalVars.projects)
            break
          }
        }
        if (globalVars.activeProject.name === opt.name) {
          globalVars.activeProject = globalVars.projects[0]
        }
        PubSub.publish('file_browser_load_test', globalVars.projects)
      })
    })

    PubSub.subscribe('create_new_file', function (topic, opt) {
      bpm.saveFiles(opt, function (data) {
        console.log(data)
      })
    })

    PubSub.subscribe('delete_file', function (topic, opt) {
      console.log('get', opt)
      bpm.deleteFiles(opt, function (data) {
        console.log(data)
      })
    })
  }

, save: function () {
    PubSub.publish('start_save_files')
  }

, compile: function () {
    PubSub.publish('compile')
  }

, downloadHex: function () {
    PubSub.publish('download-hex')
  }
}

export default app
