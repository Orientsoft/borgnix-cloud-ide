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
      <div {...this.props}>
        <Tabs tabWidth={150}
            inkBarStyle={{backgroundColor: '#4684df'}}
            tabItemContainerStyle={{width: 150 * 1, height: 26}}>
          <Tab label='compile' style={{height: 26, color: '#515667'}}>
            <div style={{width: '100%', height: '100%'}} className='terminal-container'>
              <Terminal ref='compileTerm' id='compile'/>
            </div>
          </Tab>
        </Tabs>
      </div>

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
