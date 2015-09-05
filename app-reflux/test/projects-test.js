import ProjectActions from '../actions/project-actions'
import ProjectStore from '../stores/project-store'
import arduinoStore from '../stores/arduino-store'
import arduinoActions from '../actions/arduino-actions'

let projectTests = {}

let projectState = {}
  , arduinoState = {}

ProjectStore.listen((newState)=>{
  console.log('update', newState)
  projectState = newState
})

arduinoStore.listen((newState)=>{
  console.log('update', newState)
  arduinoState = newState
})

projectTests.createProject = function () {
  ProjectActions.createProject({
    name: 'test' + Date.now()
  , tpl: 'default'
  })
}

projectTests.removeProject = function () {
  // console.log(ProjectStore.state.projects)
  console.log('remove', projectState)
  ProjectActions.removeProject(ProjectStore.state.activeProjectName)
}

projectTests.upload = function () {
  console.log('upload test started')
  arduinoActions.upload('t2', 'uno', 'port')
}

projectTests.compile = function () {
  console.log('compile test started', arduinoState)
  arduinoActions.compile({
    name: 't2'
  , type: 'arduino'
  , board: 'uno'
  })
}

export default projectTests
