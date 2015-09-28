import Reflux from 'reflux'
import ProjectActions from '../actions/project-actions'
import BPM from 'borgnix-project-manager/client'
import _ from 'lodash'
import path from 'path'

let bpm = new BPM({
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
  return project ? _.find(project.files, {name: name}) : null
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

, onListProjects: function (cb) {
    console.log('start listing projects')
    // let self = this
    let opts = {
      uuid: 'uuid'
    , token: 'token'
    , type: 'arduino'
    }
    bpm.listProject(opts, (projects) => {
      console.log('check', projects)
      state.projects = projects.map((project)=>{
        let oldProject = getProjectByName(project.name)
        console.log(project)
        project.files = project.files.map((file)=>{
          let oldFile = getFileByName(oldProject, file.name)
          file.open = oldFile ? oldFile.open : false
          return file
        })
        return project
      })
      state.activeProjectName =
          state.activeProjectName
          || (state.projects[0] ? state.projects[0].name : null)

      state.activeFileName =
          state.activeFileName
          || getActiveProject() ? getActiveProject().files[0].name : null

      this.trigger(state)
      if (_.isFunction(cb)) cb()
    })
  }

, onCreateProject(name) {
    let opts = {
      type: 'arduino'
    , name: name
    }
    bpm.newProject(opts, (newProject)=>{
      newProject.files = newProject.files.map((file, i) => {
        file.open = (i === 0)
        return file
      })
      state.projects = state.projects.concat([newProject])
      console.log('see me', state.projects)
      state.activeProjectIdx = state.projects.length - 1
      state.activeProjectName = newProject.name
      state.activeFileName = newProject.files[0].name

      this.trigger(state)
    })
  }

, onRemoveProject(name) {
    let opts = {
      type: 'arduino'
    , name: name
    }
    bpm.deleteProject(opts, ()=>{
      console.log('deleted', opts)
      console.log(this)
      _.remove(state.projects, {name: opts.name})
      if (state.projects.length === 0)
        state.activeProjectName = null
      else if (state.activeProjectName === opts.name)
        state.activeProjectName = state.projects[0].name
      this.trigger(state)
    })
  }

, onSwitchProject(name) {
    if (_.find(state.projects, {name: name})
        && state.activeProjectName !== name) {
      state.activeProjectName = name
      if (!_.find(getActiveProject().files, {open: true})) {
        getActiveProject().files[0].open = true
      }
      state.activeFileName = _.find(getActiveProject().files, {open: true}).name
    }
    this.trigger(state)
  }

, onCreateFile(filename, cb) {
    console.log(filename)
    let self = this
    let project = getActiveProject()
    console.log(project)
    if (_.find(project.files, {name: filename})) {
      if (_.isFunction(cb)) cb(new Error('file already exists'))
    }
    else {
      let opts = {
        type: 'arduino'
      , name: state.activeProjectName
      , files: [{
          name: path.basename(filename)
        , content: ''
        , root: path.dirname(filename)}
        ]
      }
      console.log(opts)
      bpm.saveFiles(opts, (res)=>{
        console.log(res)
        let file = opts.files[0]
        file.open = true
        project.files.push(opts.files[0])
        state.activeFileName = file.name
        _sortByName(project.files, ()=>{
          self.trigger(state)
          if (_.isFunction(cb)) cb(null)
        })
      })
    }
  }

, onSaveFiles(files) {
    console.log(files)
    let project = getActiveProject()
    project.files = project.files.map((projectFile)=>{
      // return _.find(files, {name: projectFile.name}) || projectFile
      _.assign(projectFile, _.find(files, {name: projectFile.name}) || {})
      return projectFile
    })
    let opts = {
      type: 'arduino'
    , name: project.name
    , files: files
    }
    bpm.saveFiles(opts)
    this.trigger(state)
  }

, onRemoveFile(file) {
    let opts = {
      type: 'arduino'
    , name: state.activeProjectName
    , files: [file]
    }
    console.log(opts)
    bpm.deleteFiles(opts)
    _.remove(getProjectByName(opts.name).files, {name: file.name})
    this.trigger(state)
  }

, onChangeFile(file) {
    let project = getActiveProject()
    let fileToChange = getFileByName(project, file.name)
    _.assign(fileToChange, file)
    this.trigger(state)
  }

, onSwitchFile(filename) {
    if (_.find(getActiveProject().files, {name: filename})) {
      getFileByName(getActiveProject(), filename).open = true
      state.activeFileName = filename
      this.trigger(state)
    }
  }

, onOpenFile(filename) {
    getFileByName(getActiveProject(), filename).open = true
    this.trigger(state)
  }

, onCloseFile(filename) {
    getFileByName(getActiveProject(), filename).open = false
    this.trigger(state)
  }
})

export default ProjectStore
