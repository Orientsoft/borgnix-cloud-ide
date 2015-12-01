import Reflux from 'reflux'

let ProjectActions = Reflux.createActions({
  'listProjects': {asyncResult: true}
, 'createProject': {asyncResult: true}
, 'removeProject': {asyncResult: true}
, 'switchProject': {asyncResult: true}
, 'createFile': {asyncResult: true}
, 'removeFile': {asyncResult: true}
, 'saveFiles': {asyncResult: true}
, 'changeFile': {asyncResult: true}
, 'switchFile': {asyncResult: true}
, 'openFile': {asyncResult: true}
, 'closeFile': {asyncResult: true}
})

export default ProjectActions
