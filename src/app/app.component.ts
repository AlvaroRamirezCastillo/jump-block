import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RemoteComponent } from './components/remote/remote.component';
import { HostComponent } from './components/host/host.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RemoteComponent, HostComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  visibleHost = false;
  visibleRemote = false;

  showHost() {
    this.visibleHost = true;
  }

  showRemote() {
    this.visibleRemote = true;
  }
}
