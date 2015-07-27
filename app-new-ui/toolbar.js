import React from 'react'
import ThemeManager from './theme'
import { IconButton } from 'material-ui'

class Toolbar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  render() {
    return (
      <div className='toolbar'>
        <IconButton iconClassName='material-icons'>add</IconButton>
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
