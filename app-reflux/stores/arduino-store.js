import Reflux from 'reflux'
import arduinoActions from '../actions/arduino-actions'
import mqtt from 'mqtt'
import {SerialPort} from 'mqtt-serial'
import intelHex from 'intel-hex'
import stk500 from 'stk500'
import BAC from 'arduino-compiler/client'
import _ from 'lodash'
import { MQTT_BROKER, AT_CMD } from '../lib/const'

let bac = new BAC({
  host: ''
, prefix: 'c'
})

let state = {
  uuid: '48ac25e0-1595-11e5-85e7-fb8c26f6437d'
, token: 'e29450986df2d1c6318656c52be7a96cc3da6b66'
, board: 'uno'
, debugPort: ''
, uploadPort: ''
}

function reset(sp, cb) {
  var timeout = 2000
  sp.write(AT_CMD.GPIO_1)
  setTimeout(function () {
    sp.write(AT_CMD.GPIO_0)
    setTimeout(function () {
      sp.write(AT_CMD.GPIO_1)
      if (_.isFunction(cb)) cb()
    }, timeout)
  }, timeout)
}

function upload(uuid, token, hexFile, board, cb) {
  let client = mqtt.connect(
    MQTT_BROKER
  , { username: uuid
    , password: token
    }
  )
  client.on('connect', () => {
    console.log('mqtt connected')
    // var topicIn = `/devices/${uuid}/in`
    //   , topicOut = `/devices/${uuid}/out`

    let msp = new SerialPort({
      client: client
    , transmitTopic: `/devices/${uuid}/in`
    , receiveTopic: `/devices/${uuid}/out`
    })
    let hex = intelHex.parse(hexFile).data
    let uno = require('arduino-compiler/data/boards').uno
    let param = {
      name: 'uno'
    , baud: parseInt(uno.upload.speed)
    , signature: new Buffer(uno.signature, 'hex')
    , pageSize: 128
    , timeout: 1000
    }
    var connected = false
    msp.on('data', (data) => {
      if (data.toString() === 'ESP PING_RSP' && !connected) {
        connected = true
        console.log('reseted')
        reset(msp, function () {
          stk500.bootload(msp, hex, param, function (uploadError) {
            if (uploadError)
              console.log('bootload error', uploadError)
            else {
              console.log('upload finished')
              // client.publish('upload/finished')
              msp.end()
              if (_.isFunction(cb)) cb()
            }
          })
        })
      }
    })
    msp.write(AT_CMD.PING)
  })
}

let arduinoStore = Reflux.createStore({
  listenables: arduinoActions

, onListPorts: function () {
    //
  }

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
    // add validation here
    state.board = board
  }

, onUpload: function (name, board, port, cb) {
    console.log(port)
    // let self = this
    let hexOpts = {
      name: name
    , board: board
    , type: 'arduino'
    }
    bac.getHex(hexOpts, (err, data)=>{
      if (!err)
        upload(state.uuid, state.token, data, board, cb)
      else {
        console.log(err)
        if (_.isFunction(cb)) cb(err)
      }
    })
  }

, onStartDebug() {
    console.log('start debug')
  }

, onStopDebug() {
    console.log('stop debug')
  }
})

export default arduinoStore
