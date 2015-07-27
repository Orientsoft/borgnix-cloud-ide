import React from 'react'
import pubsub from 'pubsub-js'

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
    let self = this

    // pubsub.subscribe('add_file', (topic, data)=>{
    //   self.refs.editor.addFile(data)
    // })
  }

  render() {
    return (
      <div>
      <Toolbar />
      <div className='row mid'>
        <div className='col-sm-3 no-right-padding'
             style={{height: 432, backgroundColor: '#757575'}}>
          <ProjectManager
              ref='projectManager'
              id='project-manager'
              type='arduino'/>
        </div>
        <div className='col-sm-9 no-left-padding mid'>
          <Editor ref='editor' style={{width: '100%', height: '100%'}}/>
        </div>
      </div>
      <div className='row'>
        <Terminals ref='terms'/>
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
