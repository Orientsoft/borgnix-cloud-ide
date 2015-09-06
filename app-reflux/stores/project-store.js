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

, getActiveProject() {
    return this.getProjectByName(state.activeProjectName)
  }

, getProjectByName(name) {
    return _.find(state.projects, (project)=>{
      return project.name === name
    })
  }

, onListProjects: function () {
    console.log('start listing projects')
    let opts = {
      uuid: 'uuid'
    , token: 'token'
    , type: 'arduino'
    }
    bpm.listProject(opts, (data) => {
      state.projects = data.map((project)=>{
        project.files = project.files.map((file)=>{
          file.open = false
          return file
        })
        return project
      })
      state.activeProjectName = state.activeProjectName
                                || state.projects[0].name
      console.log(state)
      this.trigger(state)
    })
  }

, onCreateProject(name) {
    let opts = {
      type: 'arduino'
    , name: name
    }
    bpm.newProject(opts, (data)=>{
      state.projects = state.projects.concat([data])
      state.activeProjectIdx = state.projects.length - 1
      this.trigger(state)
    })
  }

, onRemoveProject(name) {
    let opts = {
      type: 'arduino'
    , name: name
    }
    console.log(this)
    bpm.deleteProject(opts, ()=>{
      console.log('deleted', opts)
      console.log(this)
      _.remove(state.projects, (project)=>{
        return opts.name === project.name
      })
      if (state.projects.length === 0)
        state.activeProjectName = null
      else if (state.activeProjectName === opts.name)
        state.activeProjectName = state.projects[0].name
      this.trigger(state)
    })
  }

, onSwitchProject(name) {
    if (_.find(state.projects, (project)=>{return project.name === name}))
      state.activeProjectName = name
    this.trigger(state)
  }

, onCreateFile(filename, cb) {
    console.log(filename)
    let self = this
    let project = this.getActiveProject()
    console.log(project)
    if (_.find(project.files, (file)=>{return file.name === filename})) {
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
        project.files.push(opts.files[0])
        self._sortByName(project.files, ()=>{
          self.trigger(state)
          if (_.isFunction(cb)) cb(null)
        })
      })
    }
  }

, onSaveFiles(files) {
    console.log(files)
    let project = this.getActiveProject()
    project.files = project.files.map((projectFile)=>{
      return _.find(files, (file)=>{
        return file.name === projectFile.name
      }) || projectFile
    })
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
    _.remove(this.getProjectByName(opts.name).files, (projectFile)=>{
      return projectFile.name === file.name
    })
    this.trigger(state)
  }

, _sortByName(arrayToSort, cb) {
    arrayToSort = _.sortByOrder(arrayToSort, ['name'], ['asc'])
    if (_.isFunction(cb)) cb()
  }

})

export default ProjectStore
