import { Component, signal, ChangeDetectorRef, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Remote } from './remote';
import copy from 'copy-to-clipboard';

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
  keyHostControl = new FormControl('');
  offer = '';
  candidate = '';

  async syncWithHost() {
    const keyHost = JSON.parse(atob(this.keyHostControl.value || '')) as { candidate: RTCIceCandidateInit; offer: RTCSessionDescriptionInit };
    const { candidate, offer } = await this.remote.createConnection({ offer: keyHost.offer, onReceiveMessageCallback: event => this.onReceiveMessageCallback(event) })

    const key = btoa(JSON.stringify({ offer, candidate }));
    copy(key);

    this.remote.syncWithHost({ candidate: keyHost.candidate });
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
