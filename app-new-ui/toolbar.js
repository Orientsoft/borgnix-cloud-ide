import React from 'react'
import pubsub from 'pubsub-js'

import ThemeManager from './theme'
import BoardSelect from './board-select'
// import { SelectField } from 'material-ui'
import {Dialog} from 'material-ui'
import MIconButton from './material-icon-button'

class Toolbar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      board: 'uno'
    }
  }

  componentDidMount() {
    pubsub.subscribe('select_board', (topic, board)=>{
      this.setState({
        board: board
      })
    })
  }

  render() {
    let tooltipStyles = {
      zIndex: 9999
    , postion: 'absolute'
    }
    return (
      <div className='toolbar'>
        <div className='buttons'>
        <MIconButton icon='add'
            tooltipPosition='bottom-right'
            tooltipStyles={tooltipStyles}
            iconCssClass='toolbar-icon'
            tooltip='New Project'
            onTouchTap={()=>{
              pubsub.publish('new_project')
            }}/>
        <MIconButton
            icon='save'
            tooltipPosition='bottom-right'
            tooltipStyles={tooltipStyles}
            iconCssClass='toolbar-icon'
            tooltip='Save'
            onTouchTap={()=>{
              pubsub.publish('editor_save_all_files')
            }}/>
        <MIconButton
            icon='delete'
            tooltipPosition='bottom-right'
            tooltipStyles={tooltipStyles}
            iconCssClass='toolbar-icon'
            tooltip='Delete Current File'
            onTouchTap={()=>{
              pubsub.publish('delete_current_file')
            }}/>
        <MIconButton
            icon='library_books'
            tooltipPosition='bottom-right'
            tooltipStyles={tooltipStyles}
            iconCssClass='toolbar-icon'
            tooltip='Add Library'
            onTouchTap={()=>{
              pubsub.publish('open_libs_dialog')
            }}/>
        <MIconButton icon='build'
            tooltipPosition='bottom-right'
            tooltipStyles={tooltipStyles}
            iconCssClass='toolbar-icon'
            tooltip='Compile'
            onTouchTap={()=>{
              console.log(this)
              console.log('board', this.state.board)
              pubsub.publish('compile', this.state.board)
            }}/>
        <MIconButton icon='file_download'
            tooltipPosition='bottom-right'
            tooltipStyles={tooltipStyles}
            iconCssClass='toolbar-icon'
            tooltip='Download Hex File'
            onTouchTap={()=>{
              pubsub.publish('download_hex', this.state.board)
            }}/>
        <MIconButton icon='settings'
            tooltipPosition='bottom-right'
            tooltipStyles={tooltipStyles}
            iconCssClass='toolbar-icon'
            tooltip='Settings'
            onTouchTap={()=>{
              this.refs.settings.show()
            }}/>

        <MIconButton
            icon='exit_to_app'
            tooltipPosition='bottom-left'
            tooltipStyles={tooltipStyles}
            iconCssClass='toolbar-icon'
            tooltip='exit'
            style={{float: 'right'}}
            onTouchTap={()=>{
              // this.refs.settings.show()
              window.history.back()
            }}/>
        </div>



        <Dialog ref='settings'>
          <BoardSelect ref='boardSelect' style={{paddingLeft: 20, zIndex: 9999}} board={this.state.board}/>
        </Dialog>

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
