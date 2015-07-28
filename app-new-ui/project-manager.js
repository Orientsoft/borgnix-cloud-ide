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
, prefix: '/p'
})

let bac = new BAC({
  host: ''
, prefix: '/c'
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
              }
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
          }
        ]}>
      <TextField ref='newProjectName' floatingLabelText='Name'/>
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
              // console.log(this)
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

class ProjectManager extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      projects: []
    , selectedProject: null
    , snackbarMsg: 'File Saved'
    }
  }

  render() {
    return (
      <div {...this.props}>
        <SelectField
            ref='project'
            floatingLabelText='project'
            value={this.state.selectedProject}
            valueMember='name'
            displayMember='name'
            onChange={this._handleSelectFieldChange.bind(this, 'selectedProject')}
            menuItems={this.state.projects}/>
        <IconMenu iconButtonElement={<MIconButton icon='more_vert'/>}>
          <MenuItem
              primaryText='New File'
              onTouchTap={()=>{this.refs.newFileDialog.show()}}/>
          <MenuItem
              primaryText='Delete'
              onTouchTap={()=>{this.refs.deleteProjectDialog.show()}}/>
        </IconMenu>

        <List style={{backgroundColor: '#757575'}}>
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
      </div>
    )
  }

  componentDidMount() {
    this._updateProjects()

    let handlers = {
      'save_files': this._saveFiles.bind(this)
    , 'compile': this._compileProject.bind(this)
    , 'download_hex': this._downloadHex.bind(this)
    , 'new_project': this.refs.newProjectDialog.show.bind(this)
    , 'new_file': this._createNewFile.bind(this)
    , 'delete_file': this._deleteFile.bind(this)
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
      , selectedProject: this.state.selectedProject || data[0].name
      })

      this._showProject(this.getSelectedProject())
    })
  }

  _showProject(project) {
    let count = 0

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
      this.setState({
        projects: this.state.projects.filter((project)=>{
          return project.name !== opt.name
        })
      , selectedProject: _.find(this.state.projects, (project)=>{
          return project.name !== opt.name
        }).name
      })
      pubsub.publish('clear_files')
      this._showProject(_.find(this.state.projects, (project)=>{
        return project.name !== opt.name
      }))
      this.refs.deleteProjectDialog.dismiss()
    })
  }

  _downloadHex() {
    let project = this.getSelectedProject()
      , self = this

    let opts = {
      uuid: project.owner
    , token: 'token'
    , type: project.type
    , name: project.name
    }

    bac.findHex(opts, function (res) {
      if (res.status === 0)
        React.findDOMNode(self.refs.downloadIframe).src = res.url
      else
        pubsub.publish('console_output_compile', '\nHex file not found\n')
    })
  }

  _createNewProject(topic, opts) {
    bpm.newProject(opts, (res)=>{
      this.setState({
        projects: this.state.projects.concat([res])
      })
      this.refs.newProjectDialog.dismiss()
    })
  }

  _compileProject() {
    switch (this.props.type) {
    case 'arduino':
      let opts = {
        uuid: 'uuid'
      , token: 'token'
      , type: 'arduino'
      , name: this.getSelectedProject().name
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
    console.log('getting file tree')
    return project.files.map((file)=>{
      return (
        <ListItem
            leftIcon={<FontIcon className='material-icons'
                                color='white'>description</FontIcon>}
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

  _handleSelectFieldChange(key, e) {
    let newState = {}
    newState[key] = e.target.value
    this.setState(newState)
    pubsub.publish('clear_files')
    this._showProject(_.find(this.state.projects, {name: e.target.value}))
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
