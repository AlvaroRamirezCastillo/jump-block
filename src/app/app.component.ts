import { Component, signal, ChangeDetectorRef, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private hostConnection!: RTCPeerConnection;
  private remoteConnection!: RTCPeerConnection;
  private sendChannel!: RTCDataChannel;
  private receiveChannel: any;
  private offer!: RTCSessionDescriptionInit;

  private dc = inject(ChangeDetectorRef);

  offerControl = new FormControl('');
  messageControl = new FormControl('');
  offerDesc = '';

  message = signal('');

  async createConnectionHost() {
    this.message.set('alvaro');
    this.hostConnection = new RTCPeerConnection();
    this.sendChannel = this.hostConnection.createDataChannel('sendDataChannel');
    this.hostConnection.onicecandidate = (e: any) => {
      this.onIceCandidate(this.hostConnection, e);
    };
    this.sendChannel.onopen = () => { this.onSendChannelStateChange() };
    this.sendChannel.onclose = () => { this.onSendChannelStateChange() };

    this.offer = await this.hostConnection.createOffer();
    this.offerDesc = JSON.stringify(this.offer);
    this.gotDescription();
  }

  createConnectionRemote() {
    this.remoteConnection = new RTCPeerConnection();
    this.remoteConnection.onicecandidate = (e: any) => {
      this.onIceCandidate(this.remoteConnection, e);
    };
    this.remoteConnection.ondatachannel = (event: any) => { this.receiveChannelCallback(event) };

    const offer: any = JSON.parse(this.offerControl.value || '{}');
    this.remoteConnection.setRemoteDescription(offer);
    this.remoteConnection.createAnswer()
      .then((desc1: RTCSessionDescriptionInit) => {
        this.remoteConnection.setLocalDescription(desc1);
        console.log(`Answer from remoteConnection`);
        this.hostConnection.setRemoteDescription(desc1);
      })
      .catch((error: any) => console.log(`Failed to add Ice Candidate: ${error.toString()}`));
  }

  private onIceCandidate(pc: RTCPeerConnection, event: RTCPeerConnectionIceEvent) {
    this.getOtherPc(pc)
      .addIceCandidate(event.candidate!)
      .then(() => console.log('AddIceCandidate success.'))
      .catch((error: any) => console.log(`Failed to add Ice Candidate: ${error.toString()}`));
  }

  private getOtherPc(pc: RTCPeerConnection) {
    return (pc === this.hostConnection) ? this.remoteConnection : this.hostConnection;
  }

  private onSendChannelStateChange() {
    const readyState = this.sendChannel.readyState;
    console.log('Send channel state is: ' + readyState);
  }

  private receiveChannelCallback(event: any) {
    this.receiveChannel = event.channel;
    this.receiveChannel.onmessage = (event: any) => { this.onReceiveMessageCallback(event) };
    this.receiveChannel.onopen = this.onReceiveChannelStateChange;
    this.receiveChannel.onclose = this.onReceiveChannelStateChange;
  }

  private onReceiveMessageCallback(event: any) {
    console.log('Received Message 11111', event.data);
    this.message.set(event.data);
    this.dc.detectChanges();
  }

  private onReceiveChannelStateChange() {
    const readyState = this.receiveChannel?.readyState;
    console.log(`Receive channel state is: ${readyState}`);
  }

  private gotDescription() {
    this.hostConnection.setLocalDescription(this.offer);
  }

  sendData() {
    this.sendChannel.send(this.messageControl.value || '');
  }

  closeDataChannels() {

  }
}
