import React from 'react'
import ProjectActions from '../actions/project-actions'
// import Projects from './projects'

class TestApp extends React.Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  componentDidMount() {
    ProjectActions.listProjects()
  }

  render() {
    return (
      <div>

      </div>
    )
  }
}

TestApp.propTypes = {

}

TestApp.defaultProps = {

}

export default TestApp
