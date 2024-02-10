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
  candidateControl = new FormControl('');
  offerRemoteControl = new FormControl('');
  offerDesc = '';
  offerRemote = '';
  candidate: any;
  message = signal('');

  async createConnectionHost() {
    this.hostConnection = new RTCPeerConnection();
    this.sendChannel = this.hostConnection.createDataChannel('sendDataChannel');
    this.hostConnection.onicecandidate = (e: any) => {
      this.remoteConnection.addIceCandidate(e.candidate!);
    };
    this.sendChannel.onopen = () => { this.onSendChannelStateChange() };
    this.sendChannel.onclose = () => { this.onSendChannelStateChange() };

    this.offer = await this.hostConnection.createOffer();
    this.offerDesc = JSON.stringify(this.offer);
    this.gotDescription();
  }

  syncHost() {
    this.hostConnection.setRemoteDescription(JSON.parse(this.offerRemoteControl.value!));
    this.hostConnection.addIceCandidate(JSON.parse(this.candidateControl.value!));
  }

  async createConnectionRemote() {
    this.remoteConnection = new RTCPeerConnection();
    this.remoteConnection.ondatachannel = (event: any) => { this.receiveChannelCallback(event) };
    const offer: any = JSON.parse(this.offerControl.value || '{}');
    this.remoteConnection.setRemoteDescription(offer);
    const desc = await this.remoteConnection.createAnswer();
    this.remoteConnection.setLocalDescription(desc);
    console.log(`Answer from remoteConnection`);
    this.offerRemote = JSON.stringify(desc);

    this.remoteConnection.onicecandidate = e => {
      if(e.candidate) {
        // this.hostConnection.addIceCandidate(e.candidate);
        this.candidate = JSON.stringify(e.candidate);
        this.dc.detectChanges();
      }
    };
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
