import React from 'react'
import Treeview from './treeview'
import ReactBs from 'react-bootstrap'
import pubsub from 'pubsub-js'
import dot from 'dot-object'
import BPM from 'borgnix-project-manager/client'
import $ from 'jquery'
import _ from 'underscore'
import globalVars from './global'
import Select from 'react-select'

var bpm = new BPM({
  host: ''
, prefix: '/p'
})

const ButtonToolbar = ReactBs.ButtonToolbar
    , Button = ReactBs.Button
    , Modal = ReactBs.Modal
    , Input = ReactBs.Input
    , Glyphicon = ReactBs.Glyphicon

const FileBrowser = React.createClass({
  render() {
    return (
      <div>
        <div className='row'>
          <Select name="form-field-name"
                  value={this.state.activeProject.name}
                  ref='project-select'
                  className='col-xs-10'
                  onChange={this.switchProject}
                  options={this.state.projects.map(function (project) {
                    return {
                      value: project.name
                    , label: project.name
                    }
                  })}
                  />

          <Button onClick={this.showNewProjectModal}>
            <Glyphicon glyph='plus'></Glyphicon>
          </Button>
        </div>

        <div className='row' style={{marginTop: '10px'}}>
          <Treeview dataSource={ this.state.dataSource}
                    // onTreenodeClick={switchProject}
                    onTreenodeContextMenu={this.showTreenodeEditModal}></Treeview>
        </div>

        <div className='row' style={{marginTop: '10px'}}>
          <Treeview dataSource={this.state.libsDataSource}
                    onTreenodeClick={this.insertHeader}></Treeview>
        </div>

        <Modal show={this.state.showNewProjectModal} onHide={this.closeNewProjectModal}>
          <Modal.Header closeButton>
            <Modal.Title>New Project</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form>
              <Input type='text' label='name' id='new-project-name'></Input>
              <Input type='text' label='type' id='new-project-type'></Input>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.closeNewProjectModal}>Cancle</Button>
            <Button onClick={this.newProject}>Create</Button>
          </Modal.Footer>
        </Modal>

        <Modal show={this.state.showTreenodeEditModal} onHide={this.closeTreenodeEditModal}>
          <Modal.Header closeButton>
            <Modal.Title>Project: {this.state.selectedNode ? this.state.selectedNode.id : ''}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {function (self) {
              if (!self.state.selectedNode) return ''
              if (self.state.selectedNode.children.length > 0)
                return (
                  <Input type='text'
                       label='file name'
                       id='new-file-name'
                       buttonAfter={
                         <Button onClick={self.createNewFile}>Create</Button>
                       }></Input>
                 )
            }(this)}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.closeTreenodeEditModal}>Cancle</Button>
            <Button onClick={function(self) { return function () {
              if (self.state.selectedNode) {
                if (self.state.selectedNode.children.length > 0)
                  self.deleteProject()
                else
                  self.deleteFile(self.state.selectedNode.id)
              }
            }}(this)}>Delete</Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
, getInitialState() {
    return {
      dataSource: []
    , libsDataSource: []
    , projects: []
    , activeProject: {}
    , showNewProjectModal: false
    , showTreenodeEditModal: false
    }
  }
, switchProject(newValue) {
    var newActiveProject = globalVars.projects.reduce(function (pv, cv) {
      if (cv.name === newValue) pv = cv
      return pv
    })

    this.setState({activeProject: newActiveProject, dataSource: [projectToTree(newActiveProject)]})
    globalVars.activeProject = newActiveProject
    pubsub.publish('editor_load_test', newActiveProject)
  }
, componentDidMount() {
    var self = this

    pubsub.subscribe('file_browser_load_'+this.props.name, function (topic, data) {
      self.setState({projects: data, activeProject: data[0]})
    })

    pubsub.subscribe('libs_update', function (topic, data) {
      console.log(data)
      var ideLibNodes = data.ideLibs.map(function (lib) {
        return libToTree(lib)
      })

      var userLibNodes = data.userLibs.map(function (lib) {
        return libToTree(lib)
      })

      var libTree = dirNode('libs')
        , userLibTree = dirNode('user libs')
        , ideLibTree = dirNode('ide libs')

      userLibTree.children = userLibNodes
      ideLibTree.children = ideLibNodes
      libTree.children.push(userLibTree)
      libTree.children.push(ideLibTree)

      console.log(libTree)

      self.setState({libsDataSource: [libTree]})
    })
  }
, showNewProjectModal() {
    this.setState({showNewProjectModal: true})
  }
, closeNewProjectModal() {
    this.setState({showNewProjectModal: false})
  }
, newProject() {
    var self = this
    var opt = {
      uuid: 'uuid'
    , token: 'token'
    , type: $('#new-project-type').val()
    , name: $('#new-project-name').val()
    }
    pubsub.publish('new_project', opt)
    self.closeNewProjectModal()
  }
, showTreenodeEditModal(e, rid, node) {
    e.preventDefault()
    this.setState({showTreenodeEditModal: true, selectedNode: node})
  }
, closeTreenodeEditModal() {
    this.setState({showTreenodeEditModal: false})
  }
, deleteProject() {
    console.log(globalVars.activeProject)
    var opt = {
      uuid: 'uuid'
    , token: 'token'
    , type: globalVars.activeProject.type
    , name: globalVars.activeProject.name
    }
    pubsub.publish('delete_project', opt)
  }
, createNewFile() {
    var filename = $('#new-file-name').val()
    console.log(filename)
    var opt = {
      uuid: 'uuid'
    , token: 'token'
    , type: globalVars.activeProject.type
    , name: globalVars.activeProject.name
    , files: [
        { name: filename, content: ''}
      ]
    }
    globalVars.activeProject.files.push({name: filename, content: ''})
    pubsub.publish('create_new_file', opt)
  }
, deleteFile(filename) {
    console.log(filename)
    var opt = {
      uuid: 'uuid'
    , token: 'token'
    , type: 'arduino'
    , name: filename.split('/')[0]
    }

    var root = filename.slice(filename.indexOf('/'), filename.lastIndexOf('/'))
    opt.files = [
      {name: filename.slice(filename.lastIndexOf('/')+1), root: root}
    ]
    console.log(opt)
    pubsub.publish('delete_file', opt)
  }

, insertHeader(nodeText) {
    // console.log('headers', this)
    // console.log(arguments)
    if (nodeText.indexOf('.h', nodeText.length - '.h'.length) !== -1)
      pubsub.publish('insert_header', nodeText)
  }
})

function fileNode (name) {
  return {
    id: name
  , text: name
  , icon: 'glyphicon glyphicon-file'
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

function fillPath (dir) {
  return dir.children.map(function (child) {
    child.id = dir.id + '/' + child.id
    if (child.children.length > 0)
      fillPath(child)
  })
}

function projectToTree (project) {
  if (!project.files) return null
  var dirs = {}
  for (var file of project.files) {
    if (!_.has(dirs, file.root))
      dirs[file.root] = dirNode(file.root)
    dirs[file.root].children.push(fileNode(file.name))
  }

  _.map(dirs, function (dir) {
    dot.move(dir.text, project.name + (dir.text === ''?'':'/') + dir.text, dirs)
  })

  _.map(dirs, function (dir, path) {
    var last = path.lastIndexOf('/')
    if (last === -1) return
    else {
      var parent = path.slice(0, last)
      dot.pick(parent, dirs).children.push(dir)
    }
  })

  var tree = dot.pick(project.name, dirs)
  tree.text = project.name
  tree.id = tree.text
  fillPath(tree)
  return tree
}

function libToTree (lib) {
  var libNode = dirNode(lib.name)
  for (var header of lib.headers) {
    libNode.children.push(fileNode(header))
  }
  return libNode
}


export default FileBrowser
