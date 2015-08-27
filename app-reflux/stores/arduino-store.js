import Reflux from 'reflux'
import arduinoActions from '../actions/arduino-actions'
// import _ from 'lodash'
import BAC from 'arduino-compiler/client'

let bac = new BAC({
  host: ''
, prefix: 'c'
})

let arduinoStore = Reflux.createStore({
  listenables: arduinoActions
, state: {
  }
, onCompile: function (opts) {
    bac.compile(opts, (data)=>{
      this.state.result = data.status
      this.state.message = data.content[data.status === 0 ? 'stdout' : 'stderr']
      this.trigger(this.state)
    })
  }

})

export default arduinoStore
