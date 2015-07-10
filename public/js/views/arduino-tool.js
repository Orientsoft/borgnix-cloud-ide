import $ from 'jquery'
import React from 'react'
import PubSub from 'pubsub'
import ReactBs from 'react-bootstrap'
import globalVars from 'es6!js/lib/global'
import Terminal from 'es6!js/views/terminal'
import colors from 'es6!js/lib/colors'
// import AceEditor from 'es6!js/views/ace'



colors.enabled = true

const ButtonToolbar = ReactBs.ButtonToolbar
    , Button = ReactBs.Button
    , Input = ReactBs.Input

const ArduinoTool = React.createClass({
  render() {
    return (
      <div>
        <ButtonToolbar>
          <Button onClick={this.compile}>Compile</Button>
          <Button onClick={this.getHex}>.hex</Button>
          <Button onClick={this.print}>test</Button>
        </ButtonToolbar>
        <Terminal id='arduino' ref='output'></Terminal>
      </div>
    )
  }
, print() {
    var term = this.refs.output.term
    term.writeln('asdfnqwkbhqwoen:ALISHG')
    term.writeln('asaoisef:LKJSFasdnas;is:LKASF')
    term.writeln('*123456789*123456789*123456789*123456789*123456789*123456789*123456789*123456789')
  }
, componentDidMount() {
    // console.log(this.refs.output.term)
    // this.refs.output.editor.getSession().setUseWrapMode(true)
  }
, compile() {
    var project = globalVars.activeProject
    console.log(project)
    var self = this
    self.refs.output.term.writeln('compiling...')
    $.ajax({
      url: 'http://127.0.0.1:3000/c/compile'
    , method: 'POST'
    , data: {
        uuid: project.owner
      , token: 'token'
      , type: project.type
      , name: project.name
      }
    , success: function (data) {
        var term = self.refs.output.term
        // console.log(data)
        if (data.status === 1) {
          // console.log(data.content)
          term.writeln(colors.red(data.content.stderr || data.content))
        }
        else {
          term.writeln(colors.green(data.content.stdout))
        }
      }
    })
  }
, getHex() {
    var project = globalVars.activeProject
    $.ajax({
      url: 'http://127.0.0.1:3000/c/findhex'
    , method: 'GET'
    , data: {
        uuid: project.owner
      , token: 'token'
      , type: project.type
      , name: project.name
      }
    , success: function (data) {
        // $('#arduino-output').append(data)
        if (data === 'yes') {
          var url = 'http://127.0.0.1:3000/c/hex/'+project.name+'.hex'+'?' + $.param({
              uuid: project.owner
            , token: 'token'
            , type: project.type
            , name: project.name
            })
          $('#dowload-iframe').attr('src', url)
        }
        else {
          $('#arduino-output').append('\nHex file not found\n')
        }
      }
    })


  }
})

export default ArduinoTool
