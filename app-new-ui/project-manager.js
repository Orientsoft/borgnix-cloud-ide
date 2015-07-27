import React from 'react'
import _ from 'underscore'
import pubsub from 'pubsub-js'
import BPM from 'borgnix-project-manager/client'
import ThemeManager from './theme'
import {
  List, ListItem, SelectField, FontIcon
} from 'material-ui'

let bpm = new BPM({
  host: ''
, prefix: '/p'
})

class ProjectManager extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      projects: []
    , selectedProject: null
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
        <List style={{backgroundColor: '#757575'}}>
          {this._getFileTree()}
        </List>
      </div>
    )
  }

  componentDidMount() {
    let opts = {
      uuid: 'uuid'
    , token: 'token'
    , type: this.props.type
    }
    bpm.listProject(opts, (data)=>{
      console.log(data)
      this.setState({
        projects: data
      , selectedProject: this.state.selectedProject || data[0].name
      })
    })
  }

  getSelectedProject() {
    return _.find(this.state.projects, {name: this.state.selectedProject})
  }

  _getFileTree() {
    let self = this
      , project = self.getSelectedProject()
      // , files = project.files
    if (!project) return []
    console.log(project)
    return project.files.map((file)=>{
      return (
        <ListItem
            leftIcon={<FontIcon className='material-icons'
                                color='white'>description</FontIcon>}
            onTouchTap={(filename)=>{
              // console.log(e)
              let file = _.find(this.getSelectedProject().files, {name: filename})
              pubsub.publish('add_file', file)
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
