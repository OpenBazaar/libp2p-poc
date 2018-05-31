
'use strict'
/* eslint-disable no-console */

const PeerInfo = require('peer-info')
const pull = require('pull-stream')
const Pushable = require('pull-pushable')
const p = Pushable()
const PeerId = require('peer-id')
const Multiaddr = require('multiaddr')
const protobuf = require("protobufjs");

var Message;
var Chat;
var Any;
protobuf.load("message.proto", function(err, root)
{
    if (err) throw err;

    // Lookup message type
    Message = root.lookup("Message");
    Chat = root.lookup("Chat");
    Any = root.lookup("Any");
})

function dial(peerinfo, node) {
    var info = {
        "id": peerinfo.id,
        "pubkey": peerinfo.pubkey
    }
    PeerId.createFromJSON(info, (err, idDialer) => {
        if (err) {
            throw err
        }

        var pi = new PeerInfo(idDialer)
        peerinfo.addrs.forEach((addrStr) => {
            pi.multiaddrs.add(new Multiaddr(addrStr))
        })

        console.log('Dialer ready,')

        node.dial(pi, '/openbazaar/app/1.0.0', (err, conn) => {
            if (err) {
              throw err
            }
            console.log('nodeA dialed to nodeB on protocol: /openbazaar/app/1.0.0')
            console.log('Type a message and see what happens')

            pull(
                p,
                conn
            )

            $('#send').click(function(e) {
                e.preventDefault();
                const chatDiv = document.getElementById('chatBox')
                const messageDiv = document.createElement('div')
                messageDiv.style.padding = "7px"
                messageDiv.style.fontSize = "20px"
                messageDiv.style.color = "red"
                messageDiv.innerHTML = $('#chatMessage').val()
                chatDiv.append(messageDiv)

                var chatMsg = Chat.create({
                    messageId: Math.random().toString(36),
                    message: $('#chatMessage').val(),
                    flag: 0
                })

                var any = Any.create({
                    type_url: "type.googleapis.com/Chat",
                    value: Chat.encode(chatMsg).finish()
                })

                var message = Message.create({
                    messageType: 1,
                    payload: any
                });

                var buffer = Message.encodeDelimited(message).finish()

                p.push(buffer)
                $('#chatMessage').val("");
            });
        })
        node.handle('/openbazaar/app/1.0.0', (protocol, conn) => {
        pull(
                conn,
                pull.map((v) => {
                    console.log(typeof v)
                    var decodedMessage;
                    try {
                        decodedMessage = Message.decode(v)
                        var decodedChat = Chat.decode(decodedMessage.payload.value)
                        if (decodedChat.message != "") {
                            console.log(decodedChat.message)
                            const chatDiv = document.getElementById('chatBox')
                            const messageDiv = document.createElement('div')
                            messageDiv.style.padding = "7px"
                            messageDiv.style.fontSize = "20px"
                            messageDiv.style.color = "green"
                            messageDiv.style.cssFloat = "right"
                            messageDiv.innerHTML = decodedChat.message
                            chatDiv.append(messageDiv)
                        }
                    } catch (e) {}
                    v.toString()
                }),
                pull.log()
            )
        })
    })
}

module.exports = {
    dial: dial
}
