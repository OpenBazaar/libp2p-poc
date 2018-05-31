'use strict'

const domReady = require('detect-dom-ready')
const createNode = require('./create-node')
const Dialer = require('./dialer')
const pull = require('pull-stream')

var myNode;

domReady(() => {
  const myPeerDiv = document.getElementById('my-peer')
  const swarmDiv = document.getElementById('swarm')
  const chatDiv = document.getElementById('chat')

  createNode((err, node) => {
    if (err) {
      return console.log('Could not create the Node, check if your browser has WebRTC Support', err)
    }
    myNode = node

    node.on('peer:connect', (peerInfo) => {
      const idStr = peerInfo.id.toB58String()
      console.log('Got connection to: ' + idStr)
      const connDiv = document.createElement('div')
      connDiv.innerHTML = 'Connected to: ' + idStr
      connDiv.id = idStr
      swarmDiv.append(connDiv)
      chatDiv.style.display = "block"
    })

    node.on('peer:disconnect', (peerInfo) => {
      const idStr = peerInfo.id.toB58String()
      console.log('Lost connection to: ' + idStr)
      document.getElementById(idStr).remove()
    })

    node.start((err) => {
      if (err) {
        return console.log('WebRTC not supported')
      }

      const idStr = node.peerInfo.id.toB58String()

      const idDiv = document
        .createTextNode('Node is ready. ID: ' + idStr)

      myPeerDiv.append(idDiv)

      // NOTE: to stop the node
      // node.stop((err) => {})
    })
  })
})

$(function() {
    $('#submitForm').submit(function(e) {
        e.preventDefault();
        $.ajax({
            type: "GET",
            url: "http://localhost:4002/ob/peerinfo/" + $('#peerID').val(),
            success: function(data){
                Dialer.dial(data, myNode);
            },
            error: function(result) {
               alert("Peerinfo not found");
            },
            dataType: "json"
        });
    });
    $('#chatMessage').keypress(function (e) {
        if (e.which == 13) {
            $('#send').click();
            return false;
        }
    });
});
