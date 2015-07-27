import React from 'react'
import App from './app'
import setupTapEvent from 'react-tap-event-plugin'

setupTapEvent()

if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.slice(0, str.length) == str
  }
}

if (typeof String.prototype.endsWith != 'function') {
  String.prototype.endsWith = function (str){
    return this.slice(-str.length) == str
  }
}

React.render(
  <App />
, document.body
)
