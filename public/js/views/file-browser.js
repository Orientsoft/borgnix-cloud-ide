import React from 'react'
import Treeview from 'es6!js/views/tree-view'
import ReactBs from 'react-bootstrap'
import PubSub from 'pubsub'
import dot from 'dot-object'
import BPM from 'es6!bpm-client'
// import Menu from 'react-menus'
import globalVars from 'es6!js/lib/global'

import 'bootstrap-contextmenu'

var bpm = new BPM({
  host: 'http://127.0.0.1:3000'
, prefix: '/p'
})

const ButtonToolbar = ReactBs.ButtonToolbar
    , Button = ReactBs.Button
    , Modal = ReactBs.Modal
    , Input = ReactBs.Input

function log(e) {
  e.preventDefault()
  console.log(e, this)
}

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

function fillPath (dir) {
  return dir.children.map(function (child) {
    child.id = dir.id + '/' + child.id
    if (child.children.length > 0)
      fillPath(child)
  })
}

function projectToTree (project) {
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

function switchProject () {
  // temprary lazy fix
  if (this.props.data.children.length === 0) return

  var name = this.props.data.text
  PubSub.publish('editor_load_test', globalVars.projects.filter(function (project) {
    return project.name === name
  })[0])
}


const FileBrowser = React.createClass({
  render() {
    return (
      <div>
        <ButtonToolbar>
          <Button onClick={this.showNewProjectModal}>New</Button>
        </ButtonToolbar>
        <Treeview dataSource={this.state.dataSource}
                  onTreenodeClick={switchProject}
                  onTreenodeContextMenu={this.showTreenodeEditModal}></Treeview>
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
    , showNewProjectModal: false
    , showTreenodeEditModal: false
    }
  }
, componentDidMount() {
    var self = this

    PubSub.subscribe('file_browser_load_'+this.props.name, function (topic, data) {
      self.setState({dataSource: data.map(function (project) {
        return projectToTree(project)
      }, [])})
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
    PubSub.publish('new_project', opt)
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
    PubSub.publish('delete_project', opt)
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
    PubSub.publish('create_new_file', opt)
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
    PubSub.publish('delete_file', opt)
  }
})

export default FileBrowser
