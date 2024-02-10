import { Component, signal, ChangeDetectorRef, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Remote } from './remote';

@Component({
  selector: 'app-remote',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './remote.component.html'
})
export class RemoteComponent {
  private changeDetector = inject(ChangeDetectorRef);
  private remote = new Remote();
  message = signal('');
  messageControl = new FormControl('');
  hostOfferControl = new FormControl('');
  hostCandidateControl = new FormControl('');
  offer = '';
  candidate = '';

  async syncWithHost() {
    const hostOffer = JSON.parse(this.hostOfferControl.value || '') as RTCSessionDescriptionInit;
    const hostCandidate = JSON.parse(this.hostCandidateControl.value || '') as RTCIceCandidateInit;
    const { candidate, offer } = await this.remote.createConnection({ offer: hostOffer, onReceiveMessageCallback: event => this.onReceiveMessageCallback(event) })

    this.offer = JSON.stringify(offer);
    this.candidate = JSON.stringify(candidate);
    this.remote.syncWithHost({ candidate: hostCandidate });
  }

  sendDataToRemote() {
    const message = this.messageControl.value || '';
    this.remote.sendDataToRemote(message);
  }

  private onReceiveMessageCallback(event: MessageEvent) {
    this.message.set(event.data);
    this.changeDetector.detectChanges();
  }
}
