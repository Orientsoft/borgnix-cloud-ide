import React from 'react'
import projectStore from '../stores/project-store'
import arduinoStore from '../stores/arduino-store'
import projectActions from '../actions/project-actions'
import Highlight from 'react-highlight'
import _ from 'lodash'

class ApiDemo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      projects: []
    , openFiles: []
    , activeProjectName: ''
    , activeFileName: ''
    , board: 'uno'
    , result: null
    , message: null
    }

    projectStore.listen((newState) => {
      console.log('project store changed')
      // _.assign(newState, {openFiles: self.getOpenFiles()})
      this.setState(newState)
    })

    arduinoStore.listen((newState) => {
      console.log('arduino store changed')
      this.setState(newState)
    })
  }

  componentDidMount() {
    // projectActions.listProjects()
  }

  render() {
    return (
      <div>
      <div className='col-sm-9'>
        <h2 >ProjectStore</h2>
        <h3 >listProjects()</h3>
        <p >Get a list of projects from the server</p>
        <button onClick={projectActions.listProjects.bind(null, () => {
          alert('Projects listed!')
        })}>
            List projects
        </button>
        <Highlight className='javascript'>
        {
          'projectActions.listProjects(() => {\n' +
              '\talert(\'Project listed\')\n' +
          '})'
        }
        </Highlight>

        <h3 >createProject(name)</h3>
        <p ></p>
        <button
            onClick={
              projectActions.createProject.bind(this, 'test-' + Date.now())
            }>
          Create Project
        </button>


      </div>
      <div className='col-sm-3'>
        <h3 >{'project store state'}</h3>
        <textarea
            style={{height: '50%', width: '100%', display: 'hidden'}}
            rows={20}
            value={JSON.stringify(this.state, null, 2)}>
        </textarea>
        <div >
        <h3 >{'project list'}</h3>
        <ul >
        {
          this.state.projects.map((project) => {
            return <li >{project.name}</li>
          })
        }
        </ul>
        </div>
      </div>
      </div>

    )
  }
}

ApiDemo.propTypes = {

}

ApiDemo.defaultProps = {

}

export default ApiDemo
