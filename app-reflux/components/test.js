import React from 'react'
import projectActions from '../actions/project-actions'
import projectStore from '../stores/project-store'
import arduinoActions from '../actions/arduino-actions'
import arduinoStore from '../stores/arduino-store'
import _ from 'lodash'
import Editor from './editor'
// import Projects from './projects'

class TestApp extends React.Component {
  constructor(props) {
    super(props)
    let self = this
    this.state = {
      projects: []
    , activeProjectName: ''
    , activeFileName: ''
    , board: 'uno'
    , result: null
    , message: null
    }

    projectStore.listen(function (newState) {
      self.setState(newState)
    })

    arduinoStore.listen(function (newState) {
      self.setState(newState)
    })
  }

  getActiveProject() {
    let state = this.state
    return _.find(state.projects, (project)=>{
      return project.name === state.activeProjectName
    })
  }

  componentDidMount() {
    projectActions.listProjects()
  }

  render() {
    let self = this
    return (
      <div>
        {
          this.state.projects.map((project)=>{
            return (
              <div>
                <button
                    style={{
                      backgroundColor: (
                        project.name === self.state.activeProjectName
                      ? 'red'
                      : 'white'
                      )
                    }}
                    onClick={
                      projectActions.switchProject.bind(null, project.name)
                    }>
                  {project.name}
                </button>
                <ul>
                {
                  project.files.map((file)=>{
                    return <li>{file.name}</li>
                  })
                }
                </ul>
              </div>
            )
          })
        }
        <br />
        <div>
          <button
              onClick={()=>{
                projectActions.createProject('test-' + Date.now().toString())
              }}>
            create project
          </button>

          <button
              onClick={()=>{
                projectActions.removeProject(
                  projectStore.state.activeProjectName
                )
              }}>
            delete project
          </button>

          <button
              onClick={()=>{
                console.log('compile')
                arduinoActions.compile(projectStore.state.activeProjectName)
              }}>
            compile
          </button>

          <button
              onClick={()=>{
                let filename = projectStore.state.activeProjectName
                             + '-' + Date.now().toString() + '.txt'
                console.log(filename)
                projectActions.createFile(filename)
              }}>
            create file
          </button>

          <button
              onClick={()=>{
                let project = projectStore.getActiveProject()
                let fileToDelete = _.find(project.files, (file)=>{
                  return _.startsWith(file.name, project.name + '-')
                })
                if (fileToDelete) projectActions.removeFile(fileToDelete)
                else console.log('no temp file')
              }}>
            delete file
          </button>

          <button>null</button>
        </div>
        <div>
          <p>result</p>
          <p>{this.state.result}</p>
          <p>message</p>
          <p>{this.state.message}</p>
        </div>
        <div>
          <p>file</p>

          {
            function () {
              let activeProject = this.getActiveProject()
              let activeFile = activeProject ? activeProject.files[0]
                                             : {name: null, content: null}
              return (
                <div>
                  <h3>{activeFile.name}</h3>
                  <span>------------- start ---------------</span>
                  <div>
                    <Editor />
                  </div>
                  <span>-------------  end  ---------------</span>
                </div>
              )
            }.call(this)
          }

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
