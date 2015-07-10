import React from 'react'
import Terminal from 'term'
import $ from 'jquery'

const TerminalComponent = React.createClass({
  render() {
    return (
      <div id={this.props.id}>
      </div>
    )
  }
, componentDidMount() {

    var self = this
    this.term = new Terminal({
      convertEol: true
    , screenKeys: true
    })

    this.term.open(React.findDOMNode(this))
    this.resize()

    $(window).resize(function () {
      self.resize()
    })
  }
, resize() {
    var $elem = $(React.findDOMNode(this))
    var width = parseInt($elem.css('width').replace(/px/g, ''))
    var cols = Math.ceil(width / 8)
    this.term.resize(cols, 24)
  }
})

export default TerminalComponent
