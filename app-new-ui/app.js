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
            <div className='main-container'>
                <div className='sidebar'style={{}}>
                    <ProjectManager
                    ref='projectManager'
                    id='project-manager'
                    type='arduino'/>
                </div>
                <div className='sidebar-separator'></div>
                <div className='workspace'>
                    <div className='main-edit'>
                        <div className='editor'>
                    <Editor ref='editor'/>
                        </div>
                    <div className='terms-edit'>
                        <Terminals ref='terms'/>
                    </div>
                    </div>
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
