import Reflux from 'reflux'
import ProjectActions from '../actions/project-actions'
import ProjectManager from 'borgnix-project-manager/lib/new-client'
import _ from 'lodash'

let pm = new ProjectManager({
  host: ''
, prefix: '/p'
})

let state = {
  projects: []
, activeProjectName: null
, activeFileName: null
}

function getProjectByName(name) {
  return _.find(state.projects, {name: name})
}

function getActiveProject() {
  return getProjectByName(state.activeProjectName)
}

function getFileByName(project, name) {
  return project ? _.find(project.files, {path: name}) : null
}

function _sortByName(arrayToSort, cb) {
  arrayToSort = _.sortByOrder(arrayToSort, ['name'], ['asc'])
  if (_.isFunction(cb)) cb()
}

let ProjectStore = Reflux.createStore({
  listenables: ProjectActions

, get state() {
    return state
  }
  // do not allow changing state directly
, set state(newState) {
    console.warn('Please don\'t change state directly.')
  }

, onListProjects: async function() {
    let opts = {
      type: 'arduino'
    }

    let res = await pm.listProjects(opts)
    if (res.status !== 0)
      ProjectActions.listProjects.failed(res.content)

    state.projects = res.content.map((project) => {
      project.files = project.files.map((file)=>{
        let oldProject = getProjectByName(project.name)
        let oldFile = getFileByName(oldProject, file.name)
        file.open = oldFile ? oldFile.open : false
        return file
      })
      return project
    })
    state.activeProjectName
      = state.activeProjectName || _.get(state, 'projects[0].name')
    state.activeFileName
      = state.activeFileName || _.get(getActiveProject(), 'files[0].path')
    this.trigger(state)

    ProjectActions.listProjects.completed()
  }

, onCreateProject: async function(name, tpl) {
    let opts = {
      type: 'arduino'
    , name: name
    , tpl: tpl
    }
    let res = await pm.createProject(opts)
    if (res.status !== 0)
      ProjectActions.createProject.failed(res.content)

    let project = res.content
    project.files = project.files.map((file, i) => {
      file.open = (i === 0)
      return file
    })
    state.projects = state.projects.concat([project])
    state.activeProjectName = project.name
    state.activeFileName = _.get(project, 'files[0].path')

    this.trigger(state)
    ProjectActions.createProject.completed()
  }

, onRemoveProject: async function(name) {
    let opts = {
      type: 'arduino'
    , name: name
    }
    let res = await pm.deleteProject(opts)
    if (res.status !== 0)
      ProjectActions.removeProject.failed(res.content)

    _.remove(state.projects, {name: opts.name})
    if (state.activeProjectName === opts.name)
      state.activeProjectName = _.get(state, 'projects[0].name')
    this.trigger(state)
    ProjectActions.removeProject.completed()
  }

, onSwitchProject(name) {
    if (_.find(state.projects, {name: name})
        && state.activeProjectName !== name) {
      state.activeProjectName = name
      if (!_.find(getActiveProject().files, {open: true})) {
        getActiveProject().files[0].open = true
      }
      state.activeFileName = _.find(getActiveProject().files, {open: true}).path
    }
    this.trigger(state)
    ProjectActions.switchProject.completed()
  }

, onCreateFile: async function(filename) {
    let project = getActiveProject()

    if (getFileByName(project, filename))
      ProjectActions.createFile.failed('file already exists')

    let opts = {
      type: 'arduino'
    , name: state.activeProjectName
    , files: [{
        path: filename
      , content: ''
      }]
    }
    let res = await pm.createFile(opts)
    if (res.status !== 0)
      ProjectActions.createFile.failed(res.content)

    let file = opts.files[0]
    file.open = true
    project.files.push(opts.files[0])
    state.activeFileName = file.path

    this.trigger(state)
    ProjectActions.createFile.completed()
  }

, onSaveFiles: async function(files) {
    let project = getActiveProject()

    let filesToSave = project.files.filter((file) => {
      return files.indexOf(file.path) !== -1
    })

    let opts = {
      type: 'arduino'
    , name: project.name
    , files: filesToSave
    }

    let res = await pm.updateFiles(opts)
    if (res.status !== 0)
      ProjectActions.saveFiles.failed(res.content)

    this.trigger(state)
    ProjectActions.saveFiles.completed()
  }

, onRemoveFile: async function(file) {
    let opts = {
      type: 'arduino'
    , name: state.activeProjectName
    , files: [file]
    }
    let res = await pm.deleteFiles(opts)
    if (res.status !== 0)
      ProjectActions.removeFile.failed(res.content)

    _.remove(getProjectByName(opts.name).files, {path: file.path})

    this.trigger(state)
    ProjectActions.removeFile.completed()
  }

, onChangeFile(file) {
    let project = getActiveProject()
    let fileToChange = getFileByName(project, file.path)
    _.assign(fileToChange, file)

    this.trigger(state)
    ProjectActions.changeFile.completed()
  }

, onSwitchFile(filename) {
    if (getFileByName(getActiveProject(), filename)) {
      getFileByName(getActiveProject(), filename).open = true
      state.activeFileName = filename
      this.trigger(state)
    }
    ProjectActions.changeFile.completed()
  }

, onOpenFile(filename) {
    getFileByName(getActiveProject(), filename).open = true
    this.trigger(state)
    ProjectActions.openFile.completed()
  }

, onCloseFile(filename) {
    getFileByName(getActiveProject(), filename).open = false
    this.trigger(state)
    ProjectActions.closeFile.completed()
  }
})

export default ProjectStore
