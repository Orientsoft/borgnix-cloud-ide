import React from 'react'
import _ from 'underscore'
import pubsub from 'pubsub-js'
import BPM from 'borgnix-project-manager/client'
import BAC from 'arduino-compiler/client'
import colors from 'colors/safe'
import ThemeManager from './theme'
import {
  List, ListItem, SelectField, FontIcon, Dialog, TextField, IconMenu, Snackbar
} from 'material-ui'
import MenuItem from 'material-ui/lib/menus/menu-item'
import MIconButton from './material-icon-button'

colors.enabled = true

let bpm = new BPM({
  host: ''
, prefix: 'p'
})

let bac = new BAC({
  host: ''
, prefix: 'c'
})

function newProjectDialog() {
  return (
    <Dialog
        ref='newProjectDialog'
        title='New Project'
        actions={[
          { text: 'Cancel'}
        , { text: 'Create'
          , onTouchTap: ()=>{
              let opts = {
                uuid: 'uuid'
              , token: 'token'
              , type: this.props.type
              , name: this.refs.newProjectName.getValue()
              , tpl: this.state.selectedTpl
              }
              this._createNewProject(opts)
            }
          }
        ]}>
      <TextField ref='newProjectName' floatingLabelText='Name'/>
      <br/>
      <SelectField
          ref='newProjectTpl'
          floatingLabelText='Template'
          value={this.state.selectedTpl}
          valueMember='name'
          displayMember='name'
          onChange={this._handleSelectFieldChange.bind(this, 'selectedTpl')}
          menuItems={this.state.projectTpls}
          />
    </Dialog>
  )
}

function newFileDialog() {
  return (
    <Dialog
        title='New File'
        ref='newFileDialog'
        actions={[
          { text: 'Cancel' }
        , { text: 'Create'
          , onTouchTap: ()=>{
              let filename = this.refs.newFileName.getValue()
              this._createNewFile([filename], ()=>{
                this.refs.newFileDialog.dismiss()
              })
            }
          }
        ]}>
      <TextField
          ref='newFileName'
          floatingLabelText='File Name'/>
    </Dialog>
  )
}

function deleteProjectDialog() {
  return (
    <Dialog
        title='Comfirm Delete'
        ref='deleteProjectDialog'
        actions={[
          { text: 'Cancel' }
        , { text: 'Delete'
          , onTouchTap: ()=>{
              let opt = {
                uuid: 'uuid'
              , token: 'token'
              , type: this.props.type
              , name: this.getSelectedProject().name
              }
              this._deleteProject(opt)
            }
          }
        ]}>
      Are you sure to delete the project?
    </Dialog>
  )
}

function libsDialog() {
  this._getLibTree('user')
  this._getLibTree('ide')
  return (
    <Dialog
        ref='libsDialog'
        contentStyle={{height: 500}}
        // autoDetectWindowHeight={true}
        autoScrollBodyContent={true}
        title='Libraries'
        actions={[
          {text: 'Close'}
        ]}>
      <List>
        <ListItem primaryText='IDE Libs'>
          { this._getLibTree('ide') }
        </ListItem>
        <ListItem primaryText='User Libs'>
          { this._getLibTree('user') }
        </ListItem>
      </List>
    </Dialog>
  )
}

class ProjectManager extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      projects: []
    , selectedProject: null
    , snackbarMsg: 'File Saved'
    , selectedTpl: 'default'
    , projectTpls: [
        {name: 'default'}
      ]
    , libs: {
        userLibs: []
      , ideLibs: []
      }
    }
  }

  render() {
    return (
      <div {...this.props}>
        <div className='row'>
          <div className='col-sm-10' style={{paddingLeft: 25, paddingRight: 0}}>
          <SelectField
              ref='project'
              floatingLabelText='project'
              value={this.state.selectedProject}
              valueMember='name'
              displayMember='name'
              onChange={this._handleSelectFieldChange.bind(this, 'selectedProject')}
              menuItems={this.state.projects}/>
          </div>
          <div className='col-sm-2' style={{padding: 0, paddingTop: 15}}>
          <IconMenu iconButtonElement={<MIconButton icon='more_vert'/>}>
            <MenuItem
                primaryText='New File'
                onTouchTap={()=>{this.refs.newFileDialog.show()}}/>
            <MenuItem
                primaryText='Delete'
                onTouchTap={()=>{this.refs.deleteProjectDialog.show()}}/>
          </IconMenu>
          </div>
        </div>

        <List
            // style={{backgroundColor: '#757575'}}
            style={{backgroundColor: '#efeff7'}}
            >
          {this._getFileTree()}
        </List>

        <iframe ref='downloadIframe' style={{display: 'none'}}/>
        <Snackbar
            ref='snackbar'
            message={this.state.snackbarMsg}
            autoHideDuration={1500}/>
        { newProjectDialog.bind(this)() }
        { newFileDialog.bind(this)() }
        { deleteProjectDialog.bind(this)() }
        { libsDialog.bind(this)() }
      </div>
    )
  }

  componentDidMount() {
    this._updateProjects()

    bac.listLibs('uuid', (data)=>{
      // console.log('libs', data)
      this.setState({
        libs: data.content
      })
    })

    bpm.listTpls(this.props.type, (tpls)=>{
      console.log(tpls)
      this.setState({
        projectTpls: tpls
      })
    })

    let handlers = {
      'save_files': this._saveFiles.bind(this)
    , 'compile': this._compileProject.bind(this)
    , 'download_hex': this._downloadHex.bind(this)
    , 'new_project': this.refs.newProjectDialog.show.bind(this)
    , 'new_file': this._createNewFile.bind(this)
    , 'delete_file': this._deleteFile.bind(this)
    , 'open_libs_dialog': this.refs.libsDialog.show.bind(this)
    }

    _.map(handlers, (cb, topic)=>{
      pubsub.subscribe(topic, cb)
    })
  }

  getSelectedProject() {
    return _.find(this.state.projects, {name: this.state.selectedProject})
  }

  _updateProjects() {
    let opts = {
      uuid: 'uuid'
    , token: 'token'
    , type: this.props.type
    }
    bpm.listProject(opts, (data)=>{
      this.setState({
        projects: data.map((project)=>{
          project.files = project.files.map((file)=>{
            file.open = false
            return file
          })
          return project
        })
      , selectedProject: this.state.selectedProject || (data[0] ? data[0].name : null)
      })

      this._showProject(this.getSelectedProject())
    })
  }

  _showProject(project) {
    let count = 0

    if (!project) return null

    project.files.map((file)=>{
      if (file.open) {
        pubsub.publish('show_file', file)
        count++
      }
    })

    if (count === 0)
      switch (project.type) {
      case 'arduino':
        pubsub.publish('show_file', _.find(project.files, {name: project.name + '.ino'}))
        this._changeFileOpenStatus(project.name, project.name + '.ino')
        break
      }
  }

  _deleteProject(opt) {
    bpm.deleteProject(opt, ()=>{
      console.log('deleted', opt.name)
      let nextProject = _.find(this.state.projects, (project)=>{
        return project.name !== opt.name
      })
      this.setState({
        projects: this.state.projects.filter((project)=>{
          return project.name !== opt.name
        })
      , selectedProject: nextProject.name
      })
      pubsub.publish('clear_files')
      this._showProject(nextProject)
      this.refs.deleteProjectDialog.dismiss()
    })
  }

  _downloadHex(topic, board) {
    let project = this.getSelectedProject()
      , self = this

    let opts = {
      uuid: project.owner
    , token: 'token'
    , type: project.type
    , name: project.name
    , board: board
    }

    bac.findHex(opts, function (res) {
      if (res.status === 0)
        React.findDOMNode(self.refs.downloadIframe).src = res.url
      else
        pubsub.publish('console_output_compile', '\nHex file not found\n')
    })
  }

  _createNewProject(opts) {
    bpm.newProject(opts, (data)=>{
      this.setState({
        projects: this.state.projects.concat([data])
      , selectedProject: data.name
      })
      pubsub.publish('clear_files')
      this._showProject(data)
      this.refs.newProjectDialog.dismiss()
    })
  }

  _compileProject(topic, board) {
    console.log('inside compile')
    switch (this.props.type) {
    case 'arduino':
      let opts = {
        uuid: 'uuid'
      , token: 'token'
      , type: 'arduino'
      , name: this.getSelectedProject().name
      , board: board
      }
      bac.compile(opts, (data)=>{
        if (data.status === 0)
          pubsub.publish( 'console_output_compile'
                        , colors.green('\n' + data.content.stdout))
        else
          pubsub.publish( 'console_output_compile'
                        , colors.red('\n' + data.content.stderr))
      })
    }
  }

  _deleteFile(topic, currentFile) {
    let opt = {
      uuid: 'uuid'
    , token: 'token'
    , type: this.props.type
    , name: this.state.selectedProject
    , files: [currentFile]
    }

    this.setState({
      projects: this.state.projects.map((project)=>{
        if (project.name === opt.name)
          project.files = project.files.filter((file)=>{
            return _.findIndex(opt.files, {root: file.root, name: file.name}) === -1
          })
        return project
      })
    })

    bpm.deleteFiles(opt)
  }

  _createNewFile(files, cb) {
    let currentProject = this.getSelectedProject()
      , opt = {
          uuid: 'uuid'
        , token: 'token'
        , type: this.props.type
        , name: currentProject.name
        , files: files.map((file)=>{
            return {name: file, content: '', root: ''}
          })
        }
    bpm.saveFiles(opt, (res)=>{
      console.log(res)
      this.setState({
        projects: this.state.projects.map((project)=>{
          if (project.name === opt.name)
            project.files = project.files.concat(opt.files)
          return project
        })
      })
      if (_.isFunction(cb)) cb(null)
    })
  }

  _saveFiles(topic, files) {
    let param = {
      uuid: 'uuid'
    , token: 'token'
    , type: this.props.type
    , name: this.state.selectedProject
    , files: files
    }
    bpm.saveFiles(param, (data)=>{
      console.log(data)
      if (data.status === 0) {
        this.setState({
          snackbarMsg: 'File Saved'
        })
        this.refs.snackbar.show()
      }
    })
  }

  _changeFileOpenStatus(projectName, fileName) {
    this.setState({
      projects: this.state.projects.map((project)=>{
        if (project.name === projectName)
          project.files = project.files.map((file)=>{
            if (file.name === fileName) {
              if (file.open)
                pubsub.publish('remove_file', file)
              else
                pubsub.publish('show_file', file)
              file.open = !file.open
            }
            return file
          })
        return project
      })
    })
  }

  _getFileTree() {
    let self = this
      , project = self.getSelectedProject()
      // , files = project.files
    if (!project) return []
    // console.log('getting file tree')
    return project.files.map((file)=>{
      return (
        <ListItem
            // style={{backgroundColor: '#efeff7'}}
            leftIcon={<FontIcon className='material-icons'>description</FontIcon>}
            rightIconButton={
              <MIconButton icon={file.open ? 'chevron_left' : 'chevron_right'}
                  onTouchTap={function (thisFile) {
                    let projectName = this.getSelectedProject().name
                    this._changeFileOpenStatus(projectName, thisFile.name)
                  }.bind(this, file)}/>
            }
            onTouchTap={function (filename) {
              let thisFile = _.find(this.getSelectedProject().files, {name: filename})
              pubsub.publish('show_file', thisFile)
              if (!thisFile.open)
                this._changeFileOpenStatus(this.getSelectedProject().name, filename)
            }.bind(self, file.name)}
            primaryText={file.name}/>
      )
    })
  }

  _getLibTree(type) {
    let libs = (type === 'user' ? this.state.libs.userLibs : this.state.libs.ideLibs)
    // console.log(libs)
    return libs.map((lib)=>{
      return (
        <ListItem primaryText={lib.name}>
          {lib.headers.map((header)=>{
            return (
              <ListItem
                  primaryText={header}
                  leftIcon={<FontIcon className='material-icons'>description</FontIcon>}
                  onTouchTap={this._insertHeader.bind(this, header)}/>
            )
          })}
        </ListItem>
      )
    })
  }

  _insertHeader(filename) {
    pubsub.publish('insert_header', filename)
  }

  _handleSelectFieldChange(key, e) {
    let newState = {}
    newState[key] = e.target.value
    this.setState(newState)

    if (key === 'selectedProject') {
      pubsub.publish('clear_files')
      this._showProject(_.find(this.state.projects, {name: e.target.value}))
    }
  }

  getChildContext() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    }
  }
}

ProjectManager.childContextTypes = {
  muiTheme: React.PropTypes.object
}

ProjectManager.propTypes = {
  type: React.PropTypes.string
}

ProjectManager.defaultProps = {
  type: 'arduino'
}

export default ProjectManager
