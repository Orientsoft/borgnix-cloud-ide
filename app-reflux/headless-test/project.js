import actions from '../actions/project-actions'
import store from '../stores/project-store'
import {expect} from 'chai'
import _ from 'lodash'

let state = {}

let newProjectName = `test-${Date.now()}`
  , newFileName

store.listen((newState) => {
  state = newState
})

function getTmpFiles(tmpState) {
  return _.chain(tmpState.projects)
      .find({name: tmpState.activeProjectName})
      .get('files')
      .filter((file) => {
         return /^file-[0-9]+.txt$/.test(file.path)
       })
      .value()
}

function getActiveProject(tmpState) {
  return _.find(tmpState.projects, {name: tmpState.activeProjectName})
}

describe('Project Store', () => {

  describe('list projects', () => {
    it('should update the store state', async () => {
      await actions.listProjects()
    })
  })

  describe('create projects', () => {
    it(`should create a project named ${newProjectName}`, async () => {
      let projectCount = state.projects.length

      await actions.createProject(newProjectName)
      expect(state.projects.length).to.equal(projectCount + 1)
      expect(state.activeProjectName).to.equal(newProjectName)
    })

    it(`should failed to create ${newProjectName} again`, async () => {
      let err
      try {
        await actions.createProject(newProjectName)
      } catch (e) {
        err = e
      } finally {
        expect(err).to.not.be.undefined
      }
    })

    it('should create another projects', async () => {
      let projectCount = state.projects.length
        , tempName = `test-${Date.now()}`

      await actions.createProject(tempName)
      expect(state.projects.length).to.equal(projectCount + 1)
      expect(state.activeProjectName).to.equal(tempName)
    })
  })

  describe('switch project', () => {
    it('should switch active project', async () => {
      await actions.switchProject(newProjectName)
      expect(state.activeProjectName).to.equal(newProjectName)
    })
  })

  describe('create file', () => {
    newFileName = `file-${Date.now()}.txt`
    it('should create a file named ' + newFileName, async() => {
      let fileCount = getActiveProject(state).files.length
      let oldLayout = getActiveProject(state).layout

      let res = await actions.createFile(newFileName)
      let activeProject = getActiveProject(state)
      expect(activeProject.files.length).to.equal(fileCount + 1)
      expect(_.find(activeProject.files, {path: newFileName})).to.exists
      expect(_.find(activeProject.files, {path: newFileName}).open).to.be.true
      expect(state.activeFileName).to.equal(newFileName)
      expect(oldLayout).to.not.deep.equal(activeProject.layout)
    })

    it(`should failed to create ${newFileName} again`, async () => {
      let err
      try {
        await actions.createFile(newFileName)
      } catch (e) {
        err = e
      } finally {
        expect(err).to.not.be.undefined
      }
    })

    it('should create anoter file', async () => {
      let fileCount = getActiveProject(state).files.length
        , tmpFilename = `file-${Date.now()}.txt`
        , oldLayout = getActiveProject(state).layout

      await actions.createFile(tmpFilename)
      let activeProject = getActiveProject(state)
      expect(activeProject.files.length).to.equal(fileCount + 1)
      expect(_.find(activeProject.files, {path: tmpFilename})).to.exists
      expect(oldLayout).to.not.deep.equal(activeProject.layout)
    })

    let dirname = `dir-${Date.now()}`

    it(`should create dir ${dirname}`, async () => {
      let oldLayout = getActiveProject(state).layout
      await actions.createDir(dirname)
      expect(oldLayout).to.not.deep.equal(getActiveProject(state).layout)
    })

    it(`should failed to create dir ${dirname} again`, async () => {
      let err
      try {
        await actions.createDir(dirname)
      } catch (e) {
        err = e
      } finally {
        expect(err).to.not.be.undefined
      }
    })

    it(`should create file insub.txt in ${dirname}`, async () => {
      await actions.createFile(`${dirname}/insub.txt`)
      expect( _.find(getActiveProject(state).files
            , {path: `${dirname}/insub.txt`})).to.exists
    })
  })

  describe('close file/directory', () => {
    it('should close an opened file in the active project', async () => {
      let fileToClose = _.find(getActiveProject(state).files, {open: true})
      expect(fileToClose).to.exists

      await actions.closeFile(fileToClose.path)
      expect(
        _.find(getActiveProject(state).files, {path: fileToClose.path}).open
      ).to.be.false
    })
  })

  describe('open file', () => {
    it('should open a closed file in the active project', async () => {
      let fileToOpen = _.find(getActiveProject(state).files, {open: false})
      await actions.openFile(fileToOpen.path)
      expect(
        _.find(getActiveProject(state).files, {path: fileToOpen.path}).open
      ).to.be.true
    })
  })

  describe('change file', () => {
    it(`should update the content of file ${newFileName}`, async () => {
      let fileToChange = getTmpFiles(state)[0]
      fileToChange.content += 'changed'

      await actions.changeFile(fileToChange)
      expect(getTmpFiles(state)[0].content).to.equal(fileToChange.content)
    })
  })

  describe('save files', () => {
    it('should save files', async () => {
      let files = getTmpFiles(state)
      await actions.saveFiles(_.collect(files, 'path'))
    })
  })

  describe('delete files/directory', () => {
    it(`should delete file ${newFileName}`, async () => {
      await actions.removeFile(newFileName)
      expect(_.find( getActiveProject(state).files
                   , {path: newFileName})).to.not.exists
    })

    it('should delete a directory with content', async () => {
      let dirs = getActiveProject(state).layout.children.filter((item) => {
        return item.type === 'directory' && item.children.length > 0
      })
      expect(dirs).to.not.be.empty
      await actions.removeDir(dirs[0].path)
      let subFiles = getActiveProject(state).files.filter((file) => {
        return file.path.indexOf(dirs[0].path) === 0
      })
      expect(subFiles).to.be.empty
    })
  })

  describe('remove project', () => {
    it(`should remove the projects named ${newProjectName}`, async () => {
      await actions.removeProject(newProjectName)
      expect(_.find(state.projects, {name: newProjectName})).to.not.exists
      expect(state.activeProjectName).to.not.equal(newProjectName)
    })

    it('should failed to remove a project which does not exists', async () => {
      let err
      try {
        await actions.removeProject('IDONTEXITST')
      } catch (e) {
        err = e
      } finally {
        expect(err).to.not.be.undefined
      }
    })

    it('should remove all remaining projects', async () => {
      await Promise.all(state.projects.map((project) => {
        return actions.removeProject(project.name)
      }))
      expect(state.projects).to.have.length(0)
    })
  })
})
