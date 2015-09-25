import React from 'react'
import TestEditor from './test-editor'
import projectStore from '../stores/project-store'
import arduinoStore from '../stores/arduino-store'
import projectActions from '../actions/project-actions'
import TestPM from './test-pm'
import _ from 'lodash'

class TestApp extends React.Component {
  constructor(props) {
    super(props)
    let self = this
    this.state = {
      projects: []
    , openFiles: []
    , activeProjectName: ''
    , activeFileName: ''
    , board: 'uno'
    , result: null
    , message: null
    }

    projectStore.listen(function (newState) {
      console.log('project store changed')
      _.assign(newState, {openFiles: self.getOpenFiles()})
      self.setState(newState)
    })

    arduinoStore.listen(function (newState) {
      self.setState(newState)
    })
  }

  getActiveProject(state) {
    state = state || this.state
    return _.find(state.projects, (project)=>{
      return project.name === state.activeProjectName
    })
  }

  getOpenFiles(state) {
    state = state || this.state
    let project = this.getActiveProject(state)

    if (project) {
      if (!_.find(project.files, {open: true})) {
        project.files[0].open = true
      }
      return _.filter(project.files, {open: true})
    }
    else
      return []
  }

  componentDidMount() {
    projectActions.listProjects()
  }

  render() {
    console.log(this.state.openFiles)
    return (
      <div>
        <div className='col-sm-3'>
          <TestPM
              projects={this.state.projects}
              activeFileName={this.state.activeFileName}
              activeProjectName={this.state.activeProjectName}/>
        </div>
        <div className='col-sm-9'>
          <TestEditor
              files={this.state.openFiles}/>
        </div>

      </div>
    )
  }
}

TestApp.propTypes = {

}

TestApp.defaultProps = {

}

export default TestApp
