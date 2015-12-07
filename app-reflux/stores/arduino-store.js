import Reflux from 'reflux'
import arduinoActions from '../actions/arduino-actions'
import mqtt from 'mqtt'
import {SerialPort} from 'mqtt-serial'
import intelHex from 'intel-hex'
import stk500 from 'stk500'
import BAC from 'arduino-compiler/client'
import _ from 'lodash'
import { MQTT_BROKER, AT_CMD } from '../lib/const'
import utils from '../lib/util'
import promisify from 'es6-promisify'

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

let reset = async function (sp) {
  let t = 1000
  sp.write(AT_CMD.GPIO_1)
  await utils.sleep(t)
  sp.write(AT_CMD.GPIO_0)
  await utils.sleep(t)
  sp.write(AT_CMD.GPIO_1)
}

let _client, _msp

let topicOut = '/devices/UUID/out'
  , topicIn = '/devices/UUID/in'

let getMqttSerial = async function () {
  if (_msp) {
    console.log('direct')
    return _msp
  }

  if (!_client)
    _client = mqtt.connect(MQTT_BROKER, {
      qos: 1
    })

  await new Promise(function (resolve, reject) {
    _client.once('connect', resolve)
    _client.once('error', reject)
  })

  _msp = new SerialPort({
    client: _client
  , transmitTopic: topicOut
  , receiveTopic: topicIn
  })

  return _msp
}

let pingESP = async function (sp) {
  sp.write(AT_CMD.PING)
  await new Promise(function (resolve, reject) {
    sp.once('data', (data) => {
      if (data.toString() === 'ESP PING_RSP\r\n') {
        console.log('yes')
        resolve()
      }
      else {
        console.log('no', data.toString())
        reject()
      }
    })
  })
}

let bootload = promisify(stk500.bootload.bind(stk500))

let uploadHex = async function (hexFile, board) {
  let msp = await getMqttSerial()
  let hex = intelHex.parse(hexFile).data
  let uno = require('arduino-compiler/data/boards').uno
  let param = {
    name: 'uno'
  , baud: parseInt(uno.upload.speed)
  , signature: new Buffer(uno.signature, 'hex')
  , pageSize: 128
  , timeout: 2000
  }
  await pingESP(msp)
  console.log('PONG')
  await reset(msp)
  console.log('RESETED')
  await bootload(msp, hex, param)
  console.log('UPLOAD FINISH')
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
    bac.getHex(hexOpts, async (err, data)=>{
      if (!err)
        await uploadHex(data, 'uno')
      else {
        console.log(err)
      }
      if (_.isFunction(cb)) cb(err)
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
