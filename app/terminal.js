import React from 'react'
import Terminal from 'term.js'
import $ from 'jquery'
import pubsub from 'pubsub-js'

class TerminalComponent extends React.Component {
  constructor(props) {
    super(props)

  }

  render() {
    return (
      <div id={this.props.id}>
      </div>
    )
  }

  componentDidMount() {
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

    pubsub.subscribe('console_output', function (topic, data) {
      self.term.writeln(data)
    })
  }

  resize() {
    var $elem = $(React.findDOMNode(this)).parent()
    var width = parseInt($elem.css('width').replace(/px/g, ''))
    var cols = Math.ceil(width / 8)
    var height = parseInt($elem.css('height').replace(/px/g, ''))
    var rows = Math.ceil(height / 10)

    this.term.resize(cols, rows)
  }
}

export default TerminalComponent
