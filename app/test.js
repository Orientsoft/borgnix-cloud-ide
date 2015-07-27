import React from 'react'
import Rbs from 'react-bootstrap'
import AceEditor from 'react-ace'

import 'brace/mode/c_cpp'
import 'brace/theme/twilight'

const Button = Rbs.Button

class Test extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    return (
      <div>
        <h1>Hello React</h1>
        <p>Rock N Roll, baby</p>
        <Button>Am I</Button>
      </div>
    )
  }
}

export default Test
