import Reflux from 'reflux'

let arduinoActions = Reflux.createActions([
  'compile'
, 'upload'
, 'setBoard'
, 'listPorts'
, 'startDebug'
, 'stopDebug'
])

export default arduinoActions
