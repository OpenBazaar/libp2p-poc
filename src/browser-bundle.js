'use strict'

const WebSockets = require('libp2p-websockets')

const Mplex = require('libp2p-mplex')
const SPDY = require('libp2p-spdy')
const SECIO = require('libp2p-secio')

const Railing = require('libp2p-railing')
const libp2p = require('libp2p')


class Node extends libp2p {
  constructor (peerInfo, peerBook, options) {
    options = options || {}

    const modules = {
      transport: [
        new WebSockets()
      ],
      connection: {
        muxer: [
          Mplex,
          SPDY
        ],
        crypto: [SECIO]
      },
      discovery: []
    }

    super(modules, peerInfo, peerBook, options)
  }
}

module.exports = Node
