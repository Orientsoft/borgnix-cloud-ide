import Reflux from 'reflux'
import arduinoActions from '../actions/arduino-actions'
// import _ from 'lodash'
import mqtt from 'mqtt'
import {SerialPort} from 'mqtt-serial'
import intelHex from 'intel-hex'
import stk500 from 'stk500'
import BAC from 'arduino-compiler/client'

let bac = new BAC({
  host: ''
, prefix: 'c'
})

let state = {
  uuid: '48ac25e0-1595-11e5-85e7-fb8c26f6437d'
, token: 'e29450986df2d1c6318656c52be7a96cc3da6b66'
, board: 'uno'
}

let arduinoStore = Reflux.createStore({
  listenables: arduinoActions

, onCompile: function (projectName) {
    let opts = {
      type: 'arduino'
    , name: projectName
    , board: state.board
    }
    bac.compile(opts, (data)=>{
      state.result = data.status
      state.message = data.content[data.status === 0 ? 'stdout' : 'stderr']
      this.trigger(state)
    })
  }

, onSetBoard: function (board) {
    state.board = board
  }

, onUpload: function (name, board, port) {
    console.log(port)
    // let self = this
    let hexOpts = {
      name: name
    , board: board
    , type: 'arduino'
    }
    bac.getHex(hexOpts, (err, data)=>{
      if (err) console.log(err)
      console.log('get hex:', data)
      let client = mqtt.connect(
        'ws://z.borgnix.com:2883'
      , { username: state.uuid
        , password: state.token
        }
      )
      client.on('connect', function () {
        console.log('mqtt connected')
        var msp = new SerialPort({
          client: client
        , transmitTopic: 'upload/in'
        , receiveTopic: 'upload/out'
        })
        let hex = intelHex.parse(data).data
        var uno = require('arduino-compiler/data/boards').uno
        let param = {
          name: 'uno'
        , baud: parseInt(uno.upload.speed)
        , signature: new Buffer(uno.signature, 'hex')
        , pageSize: 128
        , timeout: 1000
        }
        client.on('message', function (topic) {
          if (topic === 'upload/ready') {
            console.log('reseted')
            stk500.bootload(msp, hex, param, function (uploadError) {
              if (uploadError)
                console.log('bootload error', uploadError)
              else {
                console.log('upload finished')
                client.publish('upload/finished')
              }
            })
          }
        })
        client.subscribe('upload/ready')
        client.publish('upload/start')
      })
    })
  }
})

export default arduinoStore
