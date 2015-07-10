# Rest API

## SKETCHES

- ### Get all sketches

  **Endpoint**

  ```
  GET /sketches
  ```

  **Parameters**

  ```js
  {
    id: 'user_uuid'
  }
  ```

  **Response**

  ```js
  [
    {
      sketch: 'sketch_name',
      files: [
        {
          filename: 'filename',
          content: 'content'
        }
      ]
    }
  ]
  ```

- ### New sketch

  **Endpoint**

  ```
  PUT /sketch
  ```

- ### Delete sketch

  DELETE /sketch

- ### Save sketch

  POST /sketch

## COMPILE

- ### Get boards

  GET /boards

- ### Compile

  POST /compile

## DOWNLOAD

- ### Download hex file

  GET /hex

- ### Download ino file

  GET /ino
