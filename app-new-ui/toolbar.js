import React from 'react'
import pubsub from 'pubsub-js'

import ThemeManager from './theme'
import BoardSelect from './board-select'
// import { SelectField } from 'material-ui'
import MIconButton from './material-icon-button'

class Toolbar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  render() {
    let tooltipStyles = {
      zIndex: 9999
    , postion: 'absolute'
    }
    return (
      <div className='toolbar' >
        <BoardSelect ref='boardSelect' className='topboardselect'/>
          <div className='navtop'>
              <div className='navbnt'>
                  <MIconButton icon='add'
                  tooltipPosition='bottom-right'
                  tooltipStyles={tooltipStyles}
                  tooltip='New Project'
                  onTouchTap={()=>{
                      pubsub.publish('new_project')
                      }}/>
                  <MIconButton
                  icon='save'
                  tooltipPosition='bottom-right'
                  tooltipStyles={tooltipStyles}
                  tooltip='Save'
                  onTouchTap={()=>{
                      pubsub.publish('editor_save_all_files')
                      }}/>
                  <MIconButton
                  icon='delete'
                  tooltipPosition='bottom-right'
                  tooltipStyles={tooltipStyles}
                  tooltip='Delete Current File'
                  onTouchTap={()=>{
                      pubsub.publish('delete_current_file')
                      }}/>
                  <MIconButton
                  icon='library_books'
                  tooltipPosition='bottom-right'
                  tooltipStyles={tooltipStyles}
                  tooltip='Add Library'
                  onTouchTap={()=>{
                      pubsub.publish('open_libs_dialog')
                      }}/>
                  <MIconButton icon='build'
                  tooltipPosition='bottom-right'
                  tooltipStyles={tooltipStyles}
                  tooltip='Compile'
                  onTouchTap={()=>{
                      console.log('board', this.refs.boardSelect.state.selectedBoard)
                      pubsub.publish('compile', this.refs.boardSelect.state.selectedBoard)
                      }}/>
                  <MIconButton icon='file_download'
                  tooltipPosition='bottom-right'
                  tooltipStyles={tooltipStyles}
                  tooltip='Download Hex File'
                  onTouchTap={()=>{
                      pubsub.publish('download_hex', this.refs.boardSelect.state.selectedBoard)
                      }}/>
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

Toolbar.childContextTypes = {
  muiTheme: React.PropTypes.object
}


Toolbar.propTypes = {

}

Toolbar.defaultProps = {

}

export default Toolbar
