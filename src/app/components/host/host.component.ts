import { Component, OnInit, signal, ChangeDetectorRef, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Host } from './host';

@Component({
  selector: 'app-host',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './host.component.html'
})
export class HostComponent implements OnInit {
  private changeDetector = inject(ChangeDetectorRef);
  private host = new Host();
  offer = '';
  candidate = '';
  message = signal('');
  messageControl = new FormControl('');
  remoteOfferControl = new FormControl('');
  remoteCandidateControl = new FormControl('');

  async ngOnInit() {
    const { offer, candidate } = await this.host.createConnection({ onReceiveMessageCallback: event => this.onReceiveMessageCallback(event) });
    this.offer = JSON.stringify(offer);
    this.candidate = JSON.stringify(candidate);
  }

  syncWithRemote() {
    const candidate = JSON.parse(this.remoteCandidateControl.value || '') as RTCIceCandidateInit;
    const offer = JSON.parse(this.remoteOfferControl.value || '') as RTCSessionDescriptionInit;
    this.host.syncWithRemote({ candidate, offer });
  }

  sendDataToRemote() {
    const message = this.messageControl.value || '';
    this.host.sendDataToRemote(message);
  }

  private onReceiveMessageCallback(event: MessageEvent) {
    this.message.set(event.data);
    this.changeDetector.detectChanges();
  }
}
