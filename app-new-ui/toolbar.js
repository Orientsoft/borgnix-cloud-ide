import React from 'react'
import pubsub from 'pubsub-js'


import ThemeManager from './theme'
import { IconButton } from 'material-ui'
import MIconButton from './material-icon-button'

class Toolbar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  render() {
    return (
      <div className='toolbar'>
        <MIconButton icon='add'
            onTouchTap={()=>{
              pubsub.publish('new_project')
            }}/>
        <MIconButton
            icon='save'
            onTouchTap={()=>{
              pubsub.publish('editor_save_all_files')
            }}/>
        <MIconButton icon='build'
            onTouchTap={()=>{
              pubsub.publish('compile')
            }}/>
        <MIconButton icon='file_download'
            onTouchTap={()=>{
              pubsub.publish('download_hex')
            }}/>
      </div>
    )
  }

  getChildContext() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    }
  }
}

Toolbar.childContextTypes = {
  muiTheme: React.PropTypes.object
}


Toolbar.propTypes = {

}

Toolbar.defaultProps = {

}

export default Toolbar
