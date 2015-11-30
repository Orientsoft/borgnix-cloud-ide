import Reflux from 'reflux'
import ProjectActions from '../actions/project-actions'
// import pm from 'borgnix-project-manager/new-client'
import ProjectManager from 'borgnix-project-manager/lib/new-client'
import _ from 'lodash'
import path from 'path'

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
//
//   // do not allow changing state directly
// , set state(newState) {
//     console.warn('Please don\'t change state directly.')
//   }
, onListProjects: async function() {
    let opts = {
      type: 'arduino'
    }

    let res = await pm.listProjects(opts)
    console.log(res)
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
    return res
  }

, onCreateProject: async function (name, tpl) {
    let opts = {
      type: 'arduino'
    , name: name
    , tpl: tpl
    }
    let res = await pm.createProject(opts)
    console.log(res)
    let project = res.content
    project.files = project.files.map((file, i) => {
      file.open = (i === 0)
      return file
    })
    state.projects = state.projects.concat([project])
    state.activeProjectName = project.name
    state.activeFileName = _.get(project, 'files[0].path')
    this.trigger(state)
    return res
  }

, onRemoveProject: async function(name) {
    let opts = {
      type: 'arduino'
    , name: name
    }
    let res = await pm.deleteProject(opts)
    console.log(res)
    _.remove(state.projects, {name: opts.name})
    if (state.activeProjectName === opts.name)
      state.activeProjectName = _.get(state, 'projects[0].name')
    this.trigger(state)
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
  }

, onCreateFile: async function(filename) {
    let project = getActiveProject()
    console.log(project, filename, getFileByName(project, filename))
    if (getFileByName(project, filename))
      throw new Error('file already exists')
    let opts = {
      type: 'arduino'
    , name: state.activeProjectName
    , files: [{
        path: filename
      , content: ''
      }]
    }
    let res = await pm.createFile(opts)
    console.log(res)

    if (res.status !== 0)
      throw new Error('create file failed')
    let file = opts.files[0]
    file.open = true
    project.files.push(opts.files[0])
    state.activeFileName = file.name
    this.trigger(state)
    return res
  }
//
// , onCreateFile(filename, cb) {
//     let self = this
//     let project = getActiveProject()
//     if (_.find(project.files, {name: filename})) {
//       if (_.isFunction(cb)) cb(new Error('file already exists'))
//     }
//     else {
//       let opts = {
//         type: 'arduino'
//       , name: state.activeProjectName
//       , files: [{
//           name: path.basename(filename)
//         , content: ''
//         , root: path.dirname(filename)}
//         ]
//       }
//       pm.saveFiles(opts, (res)=>{
//         if (res.status !== 0)
//           console.error(res)
//         let file = opts.files[0]
//         file.open = true
//         project.files.push(opts.files[0])
//         state.activeFileName = file.name
//         _sortByName(project.files, ()=>{
//           self.trigger(state)
//           if (_.isFunction(cb)) cb(null)
//         })
//       })
//     }
//   }
//
// , onSaveFiles(files) {
//     let project = getActiveProject()
//     project.files = project.files.map((projectFile)=>{
//       _.assign(projectFile, _.find(files, {name: projectFile.name}) || {})
//       return projectFile
//     })
//     let opts = {
//       type: 'arduino'
//     , name: project.name
//     , files: files
//     }
//     pm.saveFiles(opts)
//     this.trigger(state)
//   }
//
// , onRemoveFile(file) {
//     let opts = {
//       type: 'arduino'
//     , name: state.activeProjectName
//     , files: [file]
//     }
//     pm.deleteFiles(opts)
//     _.remove(getProjectByName(opts.name).files, {name: file.name})
//     this.trigger(state)
//   }
//
// , onChangeFile(file) {
//     let project = getActiveProject()
//     let fileToChange = getFileByName(project, file.name)
//     _.assign(fileToChange, file)
//     this.trigger(state)
//   }
//
// , onSwitchFile(filename) {
//     if (_.find(getActiveProject().files, {name: filename})) {
//       getFileByName(getActiveProject(), filename).open = true
//       state.activeFileName = filename
//       this.trigger(state)
//     }
//   }
//
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
