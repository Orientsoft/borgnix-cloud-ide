import React from 'react'
import Terminal from './terminal'
import ThemeManager from './theme'
import {
  Tab, Tabs
} from 'material-ui'

class Terminals extends React.Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  render() {
    return (
      <Tabs
          id='terms'
          tabWidth={150}
          tabItemContainerStyle={{width: 150 * 1}}>
        <Tab label='compile' >
          <Terminal ref='compileTerm' id='compile'/>
        </Tab>
      </Tabs>
    )
  }

  getChildContext() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    }
  }
}

Terminals.childContextTypes = {
  muiTheme: React.PropTypes.object
}

Terminals.propTypes = {

}

Terminals.defaultProps = {

}

export default Terminals
