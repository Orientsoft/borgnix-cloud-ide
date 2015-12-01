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

function _dirExists(files, dirname) {
  let dirs = files.filter((file) => {
    return file.type === 'directory'
  })
  if (dirs.length === 0) return false

  for (var dir of dirs)
    if (dir.path === dirname)
      return true

  return dirs.reduce((pv, cv) => {
    return pv || _dirExists(cv.children)
  }, false)
}

function dirExists(project, dirname) {
  return _dirExists(project.layout.children, dirname)
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
      return ProjectActions.listProjects.failed(res.content)

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

    return ProjectActions.listProjects.completed()
  }

, onCreateProject: async function(name, tpl) {
    let opts = {
      type: 'arduino'
    , name: name
    , tpl: tpl
    }
    let res = await pm.createProject(opts)
    if (res.status !== 0)
      return ProjectActions.createProject.failed(res.content)

    let project = res.content
    project.files = project.files.map((file, i) => {
      file.open = (i === 0)
      return file
    })
    state.projects = state.projects.concat([project])
    state.activeProjectName = project.name
    state.activeFileName = _.get(project, 'files[0].path')

    this.trigger(state)
    return ProjectActions.createProject.completed()
  }

, onRemoveProject: async function(name) {
    if (!getProjectByName(name))
      return ProjectActions.removeProject.failed('Project Not Found')
    let opts = {
      type: 'arduino'
    , name: name
    }
    let res = await pm.deleteProject(opts)
    if (res.status !== 0)
      return ProjectActions.removeProject.failed(res.content)

    _.remove(state.projects, {name: opts.name})
    if (state.activeProjectName === opts.name)
      state.activeProjectName = _.get(state, 'projects[0].name')
    this.trigger(state)
    return ProjectActions.removeProject.completed()
  }

, onSwitchProject(name) {
    let project = getActiveProject()
    if (project && state.activeProjectName !== name) {
      state.activeProjectName = name
      if (!_.find(project.files, {open: true})) {
        project.files[0].open = true
      }
      state.activeFileName = _.find(project.files, {open: true}).path
    }
    this.trigger(state)
    return ProjectActions.switchProject.completed()
  }

, onCreateFile: async function(filename) {
    let project = getActiveProject()

    if (getFileByName(project, filename))
      return ProjectActions.createFile.failed('file already exists')

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
      return ProjectActions.createFile.failed(res.content)

    getProjectByName(opts.name).layout = res.content

    let file = opts.files[0]
    file.open = true
    project.files.push(opts.files[0])
    state.activeFileName = file.path

    this.trigger(state)
    return ProjectActions.createFile.completed()
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
      return ProjectActions.saveFiles.failed(res.content)

    this.trigger(state)
    return ProjectActions.saveFiles.completed()
  }

, onRemoveFile: async function(file) {
    let opts = {
      type: 'arduino'
    , name: state.activeProjectName
    , files: [file]
    }
    let res = await pm.deleteFiles(opts)
    if (res.status !== 0)
      return ProjectActions.removeFile.failed(res.content)

    let project = getProjectByName(opts.name)
    project.layout = res.content

    _.remove(project.files, {path: file.path})

    this.trigger(state)
    return ProjectActions.removeFile.completed()
  }

, onChangeFile(file) {
    let project = getActiveProject()
    let fileToChange = getFileByName(project, file.path)
    _.assign(fileToChange, file)

    this.trigger(state)
    return ProjectActions.changeFile.completed()
  }

, onSwitchFile(filename) {
    let project = getActiveProject()
    if (getFileByName(project, filename)) {
      getFileByName(project, filename).open = true
      state.activeFileName = filename
      this.trigger(state)
    }
    return ProjectActions.changeFile.completed()
  }

, onOpenFile(filename) {
    getFileByName(getActiveProject(), filename).open = true
    this.trigger(state)
    return ProjectActions.openFile.completed()
  }

, onCloseFile(filename) {
    getFileByName(getActiveProject(), filename).open = false
    this.trigger(state)
    return ProjectActions.closeFile.completed()
  }

, onCreateDir: async function(dirname) {
    let opts = {
      type: 'arduino'
    , name: state.activeProjectName
    , dirs: [dirname]
    }
    if (dirExists(getProjectByName(opts.name), dirname))
      ProjectActions.createDir.failed('Directory already exists')
    let res = await pm.createDirs(opts)
    if (res.status !== 0)
      ProjectActions.createDir.failed(res.content)

    getProjectByName(opts.name).layout = res.content
    this.trigger(state)
    return ProjectActions.createDir.completed()
  }

, onRemoveDir: async function(dir) {
    let opts = {
      type: 'arduino'
    , name: state.activeProjectName
    , files: [dir]
    }
    let res = await pm.deleteFiles(opts)
    if (res.status !== 0)
      return ProjectActions.removeDir.failed(res.content)

    let project = getProjectByName(opts.name)
    project.layout = res.content

    _.remove(project.files, (file) => {
      return file.path.indexOf(dir) === 0
    })

    this.trigger(state)
    return ProjectActions.removeDir.completed()
  }
})

export default ProjectStore
