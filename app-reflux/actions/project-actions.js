import Reflux from 'reflux'

let ProjectActions = Reflux.createActions([
  'listProjects'
, 'createProject'
, 'removeProject'
, 'switchProject'
, 'createFile'
, 'removeFile'
, 'saveFiles'
, 'changeFile'
, 'switchFile'
, 'openFile'
, 'closeFile'
])

export default ProjectActions
