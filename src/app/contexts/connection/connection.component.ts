import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '@shared-kernel/components/button/button.component';

@Component({
  selector: 'app-connection',
  standalone: true,
  templateUrl: './connection.component.html',
  styleUrls: ['connection.component.scss'],
  imports: [ButtonComponent, RouterLink]
})
export class ConnectionComponent {}
