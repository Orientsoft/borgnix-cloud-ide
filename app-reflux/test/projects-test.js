import ProjectActions from '../actions/project-actions'
import ProjectStore from '../stores/project-store'

let projectTests = {}

let state = {}

ProjectStore.listen((newState)=>{
  console.log('update', newState)
  state = newState
})

projectTests.createProject = function () {
  ProjectActions.createProject({
    name: 'test' + Date.now()
  , tpl: 'default'
  })
}

projectTests.removeProject = function () {
  // console.log(ProjectStore.state.projects)
  console.log('remove', state)
  ProjectActions.removeProject(ProjectStore.state.activeProjectName)
}

export default projectTests
