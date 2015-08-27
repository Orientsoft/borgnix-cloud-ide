import Reflux from 'reflux'
import ProjectActions from '../actions/project-actions'
import BPM from 'borgnix-project-manager/client'
import _ from 'lodash'

let bpm = new BPM({
  host: ''
, prefix: '/p'
})

let ProjectStore = Reflux.createStore({
  listenables: ProjectActions
, state: {
    projects: []
  , activeProjectName: null
  }

, onListProjects: function () {
    console.log('start listing projects')
    let opts = {
      uuid: 'uuid'
    , token: 'token'
    , type: 'arduino'
    }
    bpm.listProject(opts, (data) => {
      this.state.projects = data.map((project)=>{
        project.files = project.files.map((file)=>{
          file.open = false
          return file
        })
        return project
      })
      this.state.activeProjectName = this.state.activeProjectName
                                     || this.state.projects[0].name
      console.log(this.state)
      this.trigger(this.state)
    })
  }

, onCreateProject(opts) {
    opts.type = 'arduino'
    bpm.newProject(opts, (data)=>{
      this.state.projects = this.state.projects.concat([data])
      this.state.activeProjectIdx = this.state.projects.length - 1
      this.trigger(this.state)
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
      _.remove(this.state.projects, (project)=>{
        return opts.name === project.name
      })
      if (this.state.projects.length === 0)
        this.state.activeProjectName = null
      else if (this.state.activeProjectName === opts.name)
        this.state.activeProjectName = this.state.projects[0].name
      this.trigger(this.state)
    })
  }

, onSwitchProject(name) {
    if (_.find(this.state.projects, (project)=>{return project.name === name}))
      this.state.activeProjectName = name
    this.trigger(this.state)
  }
})

export default ProjectStore
