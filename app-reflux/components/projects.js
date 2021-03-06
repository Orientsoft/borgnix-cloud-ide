import React from 'react'
import ProjectStore from '../stores/project-store'
import _ from 'lodash'

class Projects extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      projects: []
    , activeProjectName: null
    }
  }

  componentDidMount() {
    this.unsubscribe = ProjectStore.listen(function (state) {
      console.log('component get', state)
      this.setState(state)
    }.bind(this))
  }

  componentWillUnmount() {
    if (_.isFunction(this.unsubscribe)) this.unsubscribe()
  }

  render() {
    return (
      <div>
        <h2>Projects</h2>
        <ul>
        {
          this.state.projects.map((project)=>{
            return (
              <li>{project.name}</li>
            )
          })
        }
        </ul>
      </div>
    )
  }
}

Projects.propTypes = {

}

Projects.defaultProps = {

}

export default Projects
