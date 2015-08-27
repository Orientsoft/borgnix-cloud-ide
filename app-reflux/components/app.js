import React from 'react'
import ProjectActions from '../actions/project-actions'
import Projects from './projects'

class App extends React.Component {
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
        <Projects />
      </div>
    )
  }
}

App.propTypes = {

}

App.defaultProps = {

}

export default App
