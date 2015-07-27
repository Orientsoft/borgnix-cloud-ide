import React from 'react'
import Test from './test'
import $ from 'jquery'
import Editor from './editor'
import FileBrowser from './project-manager'
import Rbs from 'react-bootstrap'
import BPM from 'borgnix-project-manager/client'
import pubsub from 'pubsub-js'
import globalVars from './global'
import Terminal from './terminal'
import ArduinoTool from './arduino-toolbar'

console.log(Rbs, Terminal, FileBrowser, Editor)

// var globalVars = {}

const Button = Rbs.Button
    , ButtonToolbar = Rbs.ButtonToolbar

console.log(Button)

var bpm = new BPM({
      host: ''
    , prefix: '/p'
    })

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
    , $('#project-manager')[0]
    )
    React.render(
      <Editor mode='javascript' theme="twilight" files={[{name: 'empty-file', content: ''}]} name='test' />
    , $('#editor')[0]
    )
    React.render(
      <ArduinoTool />
    , $('#toolbar')[0]
    )

    React.render(
      <Terminal/>
    , $('#terminal')[0]
    )

    // React.render(
    //   <ButtonToolbar>
    //     <Button onClick={this.save} bsSize='xsmall'>Save</Button>
    //     <Button onClick={this.compile} bsSize='xsmall'>Compile</Button>
    //     <Button onClick={this.downloadHex} bsSize='xsmall'>Download</Button>
    //   </ButtonToolbar>
    // , $('#toolbar')[0]
    // )



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
      globalVars.activeProject = globalVars.projects[0]
      pubsub.publish('file_browser_load_test', data)
      pubsub.publish('editor_load_test', data[0])
      pubsub.publish('console_output', 'list projects finished')
    })

    pubsub.subscribe('save_files', function (topic, data) {
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

    pubsub.subscribe('new_project', function (topic, opt) {
      bpm.newProject(opt, function (data) {
        globalVars.projects.push(data)
        pubsub.publish('file_browser_load_test', globalVars.projects)
      })
    })

    pubsub.subscribe('delete_project', function (topic, opt) {
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
        pubsub.publish('file_browser_load_test', globalVars.projects)
      })
    })

    pubsub.subscribe('create_new_file', function (topic, opt) {
      bpm.saveFiles(opt, function (data) {
        console.log(data)
      })
    })

    pubsub.subscribe('delete_file', function (topic, opt) {
      console.log('get', opt)
      bpm.deleteFiles(opt, function (data) {
        console.log(data)
      })
    })
  }

, save: function () {
    pubsub.publish('start_save_files')
  }

, compile: function () {
    pubsub.publish('compile')
  }

, downloadHex: function () {
    pubsub.publish('download-hex')
  }
}

app.init()
