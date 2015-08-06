import {IconButton, FontIcon} from 'material-ui'
import React from 'react'

class MIconButton extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    let iconClass = 'material-icons'
    if (this.props.iconCssClass)
      if (this.props.iconCssClass.length > 0)
        iconClass += ' ' + this.props.iconCssClass
    return (
      <IconButton {...this.props}>
        <FontIcon
            className={iconClass}>
          {this.props.icon}
        </FontIcon>
      </IconButton>
    )
  }
}

MIconButton.propTypes = {
  icon: React.PropTypes.string
, iconCssClass: React.PropTypes.string
}

MIconButton.defaultProps = {
  iconCssClass: ''
}

export default MIconButton
