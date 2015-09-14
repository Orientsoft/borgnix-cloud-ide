# Reflux API

## Stores

> Stores keep track of variables for the application

You can use `StoreObject.state` to get a state object of the store. Though the preferred way is to listen to the changes of the store using  `StoreObject.listen(yourCallbackFunction)`, and you're not able to change the state directly. The first parameter for the function is the new state of the store.

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

- listProjects

  Get a full list of projects from the server, will trigger a state change.

- createProject

- removeProject

- switchProject

- createFile

- removeFile

- saveFiles

- changeFile

- switchFile

- changeFile

- openFile

- closeFile

### ArduinoActions

- compile

- upload

- startDebug

- stopDebug
