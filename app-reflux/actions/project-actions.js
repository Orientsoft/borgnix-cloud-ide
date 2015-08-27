import Reflux from 'reflux'

let ProjectActions = Reflux.createActions([
  'listProjects'
, 'createProject'
, 'removeProject'
, 'switchProject'
, 'createFile'
, 'removeFile'
, 'updateFile'
])

export default ProjectActions
