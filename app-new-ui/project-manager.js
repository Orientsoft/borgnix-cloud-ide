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
          <MenuItem primaryText='New File'/>
          <MenuItem primaryText='Delete'/>
        </IconMenu>

        <List style={{backgroundColor: '#757575'}}>
          {this._getFileTree()}
        </List>

        <iframe ref='downloadIframe' style={{display: 'none'}}/>
        <Snackbar
            ref='snackbar'
            message={this.state.snackbarMsg}
            autoHideDuration={1500}/>
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
                  // console.log(opts)
                  bpm.newProject(opts, (data)=>{
                    // console.log(data)
                    this.setState({
                      projects: this.state.projects.concat([data])
                    })
                  })
                }
              }
            ]}>
          <TextField ref='newProjectName' floatingLabelText='Name'/>
        </Dialog>
      </div>
    )
  }

  componentDidMount() {
    let self = this

    let opts = {
      uuid: 'uuid'
    , token: 'token'
    , type: this.props.type
    }

    bpm.listProject(opts, (data)=>{
      this.setState({
        projects: data.map((project)=>{
          project.files = project.files.map((file)=>{
            file.open=false
            return file
          })
          return project
        })
      , selectedProject: this.state.selectedProject || data[0].name
      })
      let selectedProject = this.getSelectedProject()
      if (selectedProject.type === 'arduino') {
        let mainFile = _.find(selectedProject.files, (file)=>{
          return file.name === selectedProject.name + '.ino'
        })
        pubsub.publish('show_file', mainFile)
        this._changeFileOpenStatus(selectedProject.name, mainFile.name)
      }
    })

    pubsub.subscribe('save_files', this._saveFiles.bind(this))
    pubsub.subscribe('compile', this._compileProject.bind(this))
    pubsub.subscribe('download_hex', this._downloadHex.bind(this))
    pubsub.subscribe('new_project', ()=>{this.refs.newProjectDialog.show()}.bind(this))
  }

  getSelectedProject() {
    return _.find(this.state.projects, {name: this.state.selectedProject})
  }

  _downloadHex(topic, data) {
    let project = this.getSelectedProject()
      , self = this

    let opts = {
      uuid: project.owner
    , token: 'token'
    , type: project.type
    , name: project.name
    }

    bac.findHex(opts, function (res) {
      if (res.status === 0) {
        React.findDOMNode(self.refs.downloadIframe).src = res.url
      }
      else {
        pubsub.publish('console_output_compile', '\nHex file not found\n')
      }
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
        if (data.status === 0) {
          pubsub.publish( 'console_output_compile'
                        , colors.green('\n' + data.content.stdout))
        }
        else {
          pubsub.publish( 'console_output_compile'
                        , colors.red('\n' + data.content.stderr))
        }
      })
    }
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
        if (project.name === projectName) {
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
        }
        return project
      })
    })
  }

  _getFileTree() {
    let self = this
      , project = self.getSelectedProject()
      // , files = project.files
    if (!project) return []
    return project.files.map((file)=>{
      return (
        <ListItem
            leftIcon={<FontIcon className='material-icons'
                                color='white'>description</FontIcon>}
            rightIconButton={
              <MIconButton icon={file.open ? 'chevron_left' : 'chevron_right'}
                  onTouchTap={(file)=>{
                    let projectName = this.getSelectedProject().name
                    this._changeFileOpenStatus(projectName, file.name)
                  }.bind(this, file)}/>
            }
            onTouchTap={(filename)=>{
              let file = _.find(this.getSelectedProject().files, {name: filename})
              pubsub.publish('show_file', file)
              if (!file.open)
                this._changeFileOpenStatus(this.getSelectedProject().name, filename)
            }.bind(self, file.name)}
            primaryText={file.name}/>
      )
    })
  }

  _handleSelectFieldChange(key, e) {
    let newState = {}
    newState[key] = e.target.value
    console.log(newState)
    this.setState(newState)
    pubsub.publish('clear_files')
    let count = 0
      , project = _.find(this.state.projects, {name: e.target.value})
    project.files.map((file)=>{
      if (file.open) {
        pubsub.publish('show_file', file)
        count++
      }
    })
    if (count === 0) {
      switch (project.type) {
      case 'arduino':
        pubsub.publish('show_file', _.find(project.files, {name: project.name + '.ino'}))
        break
      }
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
