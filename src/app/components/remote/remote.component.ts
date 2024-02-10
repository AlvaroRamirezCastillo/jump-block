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
  message = signal('');
  messageControl = new FormControl('');
  hostOfferControl = new FormControl('');
  hostCandidateControl = new FormControl('');
  offer = '';
  candidate = '';

  async syncWithHost() {
    const hostOffer = JSON.parse(this.hostOfferControl.value || '') as RTCSessionDescriptionInit;
    const hostCandidate = JSON.parse(this.hostCandidateControl.value || '') as RTCIceCandidateInit;
    const remote = new Remote();
    const { candidate, offer } = await remote.createConnection({ offer: hostOffer, onReceiveMessageCallback: event => this.onReceiveMessageCallback(event) })

    this.offer = JSON.stringify(offer);
    this.candidate = JSON.stringify(candidate);
    remote.syncWithHost({ candidate: hostCandidate });
  }

  sendDataToRemote() {
  }

  private onReceiveMessageCallback(event: MessageEvent) {
    console.log('Received Message 11111', event.data);
    this.message.set(event.data);
    this.changeDetector.detectChanges();
  }
}
