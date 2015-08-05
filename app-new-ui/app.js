import React from 'react'
// import pubsub from 'pubsub-js'

import ThemeManager from './theme'
import ProjectManager from './project-manager'
import Toolbar from './toolbar'
import Editor from './editor'
import Terminals from './terminals'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  componentDidMount() {

  }
//style={{width: '100%', height: '100%'}}
  render() {
    return (
      <div>
      <Toolbar />
      <div className='' id='main-container'>
          <div  id ='workspace'>
              <div>
              <Editor ref='editor' />
              </div>
              <div className='row'>
                    <Terminals ref='terms'/>
              </div>
          </div>
        <div  id ='sidebar'>
          <ProjectManager
              ref='projectManager'
              id='project-manager'
              type='arduino'/>
        </div>
          <div id="sidebar-separator" className="ui-draggable"></div>

      </div>
    )
  }

  getChildContext() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    }
  }
}

App.childContextTypes = {
  muiTheme: React.PropTypes.object
}

App.propTypes = {

}

App.defaultProps = {

}

export default App
