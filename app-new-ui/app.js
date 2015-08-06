import React from 'react'

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

  render() {
    return (
      <div style={{height: '100%'}}>
        <Toolbar/>
        <div id='main-container'>
          <div id='project-manager'>
            <ProjectManager
                ref='projectManager'
                // id='project-manager'
                type='arduino'/>
          </div>

          <div id='main-edit' style={{height: '100%'}}>
            <Editor ref='editor' style={{width: '100%'}} id='editor'/>
            <Terminals ref='terms' id='terms'/>
          </div>
        </div>
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
