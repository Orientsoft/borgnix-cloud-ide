# Reflux API

## Stores

> Stores keep track of variables for the application

You can use `StoreObject.state` to get a state object of the store. Though the preferred way is to listen to the changes of the store using  `StoreObject.listen(yourCallbackFunction)`, and you're not able to change the state directly. The callback function will get the new state of the store as the first parameter.

Structures for each store are described below.

### ProjectStore

```js
{
  projects: [
    {
      name: 'project name',
      type: 'project type',
      files: [
        {
          name: 'file name',
          root: '/parent/path',
          content: 'file content',
          open: true // whether the file is opened in the editor
        }
      ]
    }
  ],
  activeProjectName: 'active project name',
  activeFileName: 'name of the file currently shown'
}
```

### ArduinoStore

```js
{
  board: 'arduino board type to build against',
  debugPort: 'port name for debugging',
  uploadPort: 'port name for uploading'
}
```

## Actions

### ProjectActions

> Actions about project user project management

- **listProjects()**

  Get a full list of projects from the server

- **createProject(projectName, projectTemplateName)**

  create a new project

- **removeProject(projectName)**

  remove a project

- **switchProject(proejctName)**

  change the currently active project

- **createFile(fileName)**

  create a new file in the active project

- **removeFile(fileName)**

  remove a file in the active project

- **saveFiles(files)**

  save files in the active project

- **changeFile(file)**

  save change to one file in the active project

- **switchFile(filename)**

  change the active file in current project

- **openFile(filename)**

  open a file in the current project, add it to the editor and make it the active file

- **closeFile(fileName)**

  close a file in the current project, discard it from the editor

### ArduinoActions

- **compile()**

  compile the current project

- **setBoard(boardName)**

  set the board to compile against

- **listPorts()**

  get a list of ports on a remote machine

- **upload(projectName, board, port)**

  upload the compiled hex file

- **startDebug(port, baudrate)**

  start debugging on a port with the given baud rate

- **stopDebug(port)**

  stops debugging on a port
