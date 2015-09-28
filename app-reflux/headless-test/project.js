import actions from '../actions/project-actions'
import store from '../stores/project-store'
import {expect} from 'chai'
import _ from 'lodash'

let state = {}

let newProjectName = `test-${Date.now()}`
  , newFileName

let listenCallback = console.log

/*
  when the state of store changes, listenCallback will be invoked.
  because there's no API to remove listeners from the store, in order to
  prevent previous registered from being called multiple time, you have to
  change the callback for every test.
*/

store.listen((newState) => {
  if (_.isFunction(listenCallback)) listenCallback(newState)
})

function getTmpFiles(tmpState) {
  return _.chain(tmpState.projects)
      .find({name: tmpState.activeProjectName})
      .get('files')
      .filter((file) => {
         return /^file-[0-9]+.txt$/.test(file.name)
       })
      .value()
}

function getActiveProject(tmpState) {
  return _.find(tmpState.projects, {name: tmpState.activeProjectName})
}

describe('Project Store', () => {

  describe('list projects', () => {
    it('should update the store state', (done) => {
      listenCallback = (newState) => {
        state = newState
        expect(state).to.have.property('projects')
        done()
      }
      actions.listProjects()
    })
  })

  describe('create projects', () => {
    it(`should create a project named ${newProjectName}`, (done) => {
      let projectCount = state.projects.length
      listenCallback = (newState) => {
        expect(newState.projects.length).to.equal(projectCount + 1)
        expect(newState.activeProjectName).to.equal(newProjectName)
        state = newState
        done()
      }
      actions.createProject(newProjectName)
    })

    it('should create another projects', (done) => {
      let projectCount = state.projects.length
        , tempName = `test-${Date.now()}`
      listenCallback = (newState) => {
        expect(newState.projects.length).to.equal(projectCount + 1)
        expect(newState.activeProjectName).to.equal(tempName)
        state = newState
        done()
      }
      actions.createProject(tempName)
    })
  })

  describe('switchProject', () => {
    it('should switch active project', (done) => {
      listenCallback = (newState) => {
        expect(newState.activeProjectName).to.equal(newProjectName)
        state = newState
        done()
      }
      actions.switchProject(newProjectName)
    })
  })

  describe('create file', () => {
    newFileName = `file-${Date.now()}.txt`
    it('should create a file named ' + newFileName, (done) => {
      let fileCount = getActiveProject(state).files.length
      listenCallback = (newState) => {
        let activeProject = getActiveProject(newState)
        expect(activeProject.files.length).to.equal(fileCount + 1)
        expect(_.find(activeProject.files, {name: newFileName})).to.exists
        expect(_.find(activeProject.files, {name: newFileName}).open).to.be.true
        expect(newState.activeFileName).to.equal(newFileName)
        state = newState
        done()
      }
      actions.createFile(newFileName)
    })

    it('should create anoter file', (done) => {
      let fileCount = getActiveProject(state).files.length
        , tmpFilename = `file-${Date.now()}.txt`
      listenCallback = (newState) => {
        let activeProject = getActiveProject(newState)
        expect(activeProject.files.length).to.equal(fileCount + 1)
        expect(_.find(activeProject.files, {name: tmpFilename})).to.exists
        state = newState
        done()
      }
      actions.createFile(tmpFilename)
    })
  })

  describe('close file', () => {
    it('should close an opened file in the active project', (done) => {
      let fileToClose = _.find(getActiveProject(state).files, {open: true})
      expect(fileToClose).to.exists
      listenCallback = (newState) => {
        expect(
          _.find(getActiveProject(newState).files, {name: fileToClose.name}).open
        ).to.be.false
        state = newState
        done()
      }
      actions.closeFile(fileToClose.name)
    })
  })

  describe('open file', () => {
    it('should open a closed file in the active project', (done) => {
      let fileToOpen = _.find(getActiveProject(state).files, {open: false})
      listenCallback = (newState) => {
        expect(
          _.find(getActiveProject(newState).files, {name: fileToOpen.name}).open
        ).to.be.true
        state = newState
        done()
      }
      actions.openFile(fileToOpen.name)
    })
  })

  describe('change file', () => {
    it(`should update the content of file ${newFileName}`, (done) => {
      let fileToChange = getTmpFiles(state)[0]
      fileToChange.content += "changed"

      listenCallback = (newState) => {
        expect(getTmpFiles(newState)[0].content).to.equal(fileToChange.content)
        state = newState
        done()
      }

      actions.changeFile(fileToChange)
    })
  })

  describe('save files', () => {
    let files = getTmpFiles(_.cloneDeep(state))
    it('should update content of 2 files', (done) => {
      listenCallback = (newState) => {
        expect(files).to.not.deep.equal(getTmpFiles(newState))
        state = newState
        done()
      }

      actions.saveFiles(files.map((file) => {
        return _.set(_.cloneDeep(file), 'content', Date.now().toString())
      }))
    })
  })

  describe('remove project', () => {
    it(`should remove the projects named ${newProjectName}`, (done) => {
      listenCallback = (newState) => {
        expect(_.find(newState.projects, {name: newProjectName})).to.not.exists
        expect(newState.activeProjectName).to.not.equal(newProjectName)
        state = newState
        done()
      }
      actions.removeProject(newProjectName)
    })


    it('should remove all projects', (done) => {
      listenCallback = (newState) => {
        state = newState
        if (state.projects.length == 0) done()
        else actions.removeProject(state.projects[0].name)
        done()
      }
      actions.removeProject(newProjectName)
    })
  })
})
