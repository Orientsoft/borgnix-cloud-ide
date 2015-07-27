import {IconButton} from 'material-ui'
import React from 'react'

class MIconButton extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <IconButton iconClassName='material-icons' {...this.props}>
        {this.props.icon}
      </IconButton>
    )
  }
}

MIconButton.propTypes = {
  icon: React.PropTypes.string
}

MIconButton.defaultProps = {

}

export default MIconButton
