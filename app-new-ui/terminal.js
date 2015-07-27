import React from 'react'
import Terminal from 'term.js'
import $ from 'jquery'
import pubsub from 'pubsub-js'
import colors from 'colors/safe'

class TerminalComponent extends React.Component {
  constructor(props) {
    super(props)
    this.input = null
  }

  render() {
    return (
      <div {...this.props}>
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
    // this.term.convertEol = true
    this.resize()
    $(window).resize(function () {
      self.resize()
    })
    this.term.write('terminal id: '+this.props.id.toString())

    pubsub.subscribe('console_output_'+this.props.id, function (topic, data) {
      self.term.writeln(data)
    })
  }

  componentWillUnmount() {
    // unbind dom event that will access the component when it's unmounted
    $(window).unbind('resize')
  }

  resize() {
    let $elem = $(React.findDOMNode(this))
      , width = parseInt($elem.width())
      , cols = Math.floor(width / 8)
      , height = parseInt($elem.height())
      , rows = Math.floor(height / this.props.lineHeight)

    this.term.resize(cols, rows)
  }

  bind(stream) {
    let self = this
    self.input = stream
    self.input.on('data', function (data) {
      self.write(data)
    })
    self.input.on('error', function (err) {
      self.write(colors.red(err.toString()))
    })
  }

  unbind() {
    if (self.input)
      self.input.removeAllListener()
    self.input = null
  }
}

TerminalComponent.defaultProps = {
  lineHeight: 14
}

export default TerminalComponent
