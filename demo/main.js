/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

let localConnection;
let remoteConnection;
let sendChannel;
let receiveChannel;
const dataChannelSend = document.querySelector('textarea#dataChannelSend');
const dataChannelReceive = document.querySelector('textarea#dataChannelReceive');
const startButton = document.querySelector('button#startButton');
const sendButton = document.querySelector('button#sendButton');
const closeButton = document.querySelector('button#closeButton');

startButton.onclick = createConnection;
sendButton.onclick = sendData;
closeButton.onclick = closeDataChannels;

function enableStartButton() {
  startButton.disabled = false;
}

function disableSendButton() {
  sendButton.disabled = true;
}

function createConnection() {
  localConnection = new RTCPeerConnection();
  sendChannel = localConnection.createDataChannel('sendDataChannel');
  localConnection.onicecandidate = e => {
    console.log(1, 'local')
    onIceCandidate(localConnection, e);
  };
  sendChannel.onopen = onSendChannelStateChange;
  sendChannel.onclose = onSendChannelStateChange;

  remoteConnection = new RTCPeerConnection();
  console.log('Created remote peer connection object remoteConnection');

  remoteConnection.onicecandidate = e => {
    console.log(1, 'remote')
    onIceCandidate(remoteConnection, e);
  };
  remoteConnection.ondatachannel = receiveChannelCallback;

  localConnection.createOffer().then(
    gotDescription1,
    onCreateSessionDescriptionError
  );
}

function onCreateSessionDescriptionError(error) {
  console.log('Failed to create session description: ' + error.toString());
}

function sendData() {
  const data = dataChannelSend.value;
  sendChannel.send('hola mundo');
  console.log('Sent Data: ' + data);
}

function closeDataChannels() {
  // console.log('Closing data channels');
  // sendChannel.close();
  // console.log('Closed data channel with label: ' + sendChannel.label);
  // receiveChannel.close();
  // console.log('Closed data channel with label: ' + receiveChannel.label);
  // localConnection.close();
  // remoteConnection.close();
  // localConnection = null;
  // remoteConnection = null;
  // console.log('Closed peer connections');
  // startButton.disabled = false;
  // sendButton.disabled = true;
  // closeButton.disabled = true;
  // dataChannelSend.value = '';
  // dataChannelReceive.value = '';
  // dataChannelSend.disabled = true;
  // disableSendButton();
  // enableStartButton();
}

function gotDescription1(desc) {
  localConnection.setLocalDescription(desc);
  // console.log(`Offer from localConnection\n${desc.sdp}`);
  remoteConnection.setRemoteDescription(desc);
  remoteConnection.createAnswer().then(
    gotDescription2,
    onCreateSessionDescriptionError
  );
}

function gotDescription2(desc) {
  remoteConnection.setLocalDescription(desc);
  // console.log(`Answer from remoteConnection\n${desc.sdp}`);
  localConnection.setRemoteDescription(desc);
}

function getOtherPc(pc) {
  return (pc === localConnection) ? remoteConnection : localConnection;
}

function getName(pc) {
  return (pc === localConnection) ? 'localPeerConnection' : 'remotePeerConnection';
}

function onIceCandidate(pc, event) {
  getOtherPc(pc)
    .addIceCandidate(event.candidate)
    .then(
      onAddIceCandidateSuccess,
      onAddIceCandidateError
    );
}

function onAddIceCandidateSuccess() {
  console.log('AddIceCandidate success.');
}

function onAddIceCandidateError(error) {
  console.log(`Failed to add Ice Candidate: ${error.toString()}`);
}

function receiveChannelCallback(event) {
  console.log('Receive Channel Callback');
  receiveChannel = event.channel;
  receiveChannel.onmessage = onReceiveMessageCallback;
  receiveChannel.onopen = onReceiveChannelStateChange;
  receiveChannel.onclose = onReceiveChannelStateChange;
}

function onReceiveMessageCallback(event) {
  console.log('Received Message', event.data);
  dataChannelReceive.value = event.data;
}

function onSendChannelStateChange() {
  const readyState = sendChannel.readyState;
  console.log('Send channel state is: ' + readyState);
}

function onReceiveChannelStateChange() {
  const readyState = receiveChannel.readyState;
  console.log(`Receive channel state is: ${readyState}`);
}
