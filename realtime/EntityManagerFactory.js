'use strict';

const EntityManagerFactory = require('../lib/EntityManagerFactory');
const WebSocketConnector = require('./connector/WebSocketConnector');

Object.defineProperty(EntityManagerFactory.prototype, 'websocket', {
  get() {
    if (!this._websocket) {
      const secure = this.connector.secure;
      let url;
      if (this._connectData.websocket) {
        url = (secure ? 'wss:' : 'ws:') + this._connectData.websocket;
      } else {
        url = this.connector.origin.replace(/^http/, 'ws') + this.connector.basePath + '/events';
      }
      this._websocket = WebSocketConnector.create(url);
    }
    return this._websocket;
  },
});

module.exports = EntityManagerFactory;
