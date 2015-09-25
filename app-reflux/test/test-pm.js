import React from 'react'
import projectActions from '../actions/project-actions'

class TestPM extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      projects: this.props.projects
    , activeProjectName: this.props.activeProjectName
    , activeFileName: this.props.activeFileName
    }
  }

  componentWillUpdate() {
    console.log('will update')
    // console.log(this.state)
  }

  componentWillReceiveProps(props) {
    // console.log(a)
    this.setState(props)
  }

  _getProjectsTree() {
    let self = this
    return this.state.projects.map((project)=>{
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
              return (
                <li>
                <button
                    style={{
                      backgroundColor:
                        this.state.activeFileName === file.name
                      ? 'red'
                      : 'white'
                    }}
                    onClick={
                        projectActions.switchFile.bind(null, file.name)
                    }>
                  {file.name}
                </button>
                </li>
              )
            })
          }
          </ul>
        </div>
      )
    })
  }

  render() {
    return (
      <div>
        {this._getProjectsTree()}
      </div>
    )
  }
}

TestPM.propTypes = {
  activeFileName: React.PropTypes.String
, activeProjectName: React.PropTypes.String
, projects: React.PropTypes.Array
}

TestPM.defaultProps = {
  activeFileName: ''
, activeProjectName: ''
, projects: []
}

export default TestPM
