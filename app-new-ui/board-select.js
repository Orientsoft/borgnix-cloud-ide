import React from 'react'
import {SelectField} from 'material-ui'
import ThemeManager from './theme'
import BAC from 'arduino-compiler/client'
import _ from 'underscore'

class BoardSelect extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      boards: []
    , selectedBoard: null
    , selectedIndex: 0
    }
  }

  componentDidMount() {
    let bac = new BAC({ host: '', prefix: '/c'})
      , self = this

    bac.getBoards(function (res) {
      let boards = _.map(res, (b, i)=>{
        b.id = i
        return b
      })

      console.log(boards)

      self.setState({
        boards: boards
      , selectedBoard: 'uno'
      })
    })
  }

  getChildContext() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    }
  }

  render() {
    return (
      <SelectField
        {...this.props}
        floatingLabelText='board'
        displayMember='name'
        valueMember='id'
        // style={{
        //   zIndex: 999
        // }}
        value={this.state.selectedBoard}
        menuItems={this.state.boards.filter((board)=>{
          return !board.menu
        })}
        onChange={this._handleSelectValueChange.bind(this, 'selectedBoard')}/>
    )
  }

  getSelectedBoard() {
    return _.find(this.state.boards, {id: this.state.selectedBoard})
  }

  _handleSelectValueChange(key, e) {
    var newState = {}
    newState[key] = e.target.value
    this.setState(newState)
  }
}

BoardSelect.childContextTypes = {
  muiTheme: React.PropTypes.object
}

BoardSelect.propTypes = {

}

BoardSelect.defaultProps = {

}

export default BoardSelect
