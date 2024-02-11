import { Component, signal, ChangeDetectorRef, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ButtonComponent } from '@shared-kernel/components/button/button.component';
import { Host } from './host';

@Component({
  selector: 'app-host',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent],
  templateUrl: './host.component.html'
})
export class HostComponent {
  private changeDetector = inject(ChangeDetectorRef);
  private host = new Host();
  message = signal('');
  messageControl = new FormControl('');
  keyRemoteControl = new FormControl('');

  async copyKeyHost() {
    const { offer, candidate } = await this.host.createConnection({ onReceiveMessageCallback: event => this.onReceiveMessageCallback(event) });
    const key = btoa(JSON.stringify({ offer, candidate }));
    navigator.clipboard.writeText(key);
  }

  syncWithRemote() {
    const { candidate, offer } = JSON.parse(atob(this.keyRemoteControl.value || '')) as { candidate: RTCIceCandidateInit; offer: RTCSessionDescriptionInit };
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
