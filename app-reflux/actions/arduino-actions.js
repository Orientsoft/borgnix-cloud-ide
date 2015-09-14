import Reflux from 'reflux'

let arduinoActions = Reflux.createActions([
  'compile'
, 'upload'
, 'startDebug'
, 'stopDebug'
])

export default arduinoActions
