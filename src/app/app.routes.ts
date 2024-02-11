import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'connections', pathMatch: 'full' },
  { path: 'connections', loadComponent: () => import('./contexts/connection/connection.component').then(mod => mod.ConnectionComponent) },
  { path: 'host', loadComponent: () => import('./contexts/host/host.component').then(mod => mod.HostComponent) },
  { path: 'remote', loadComponent: () => import('./contexts/remote/remote.component').then(mod => mod.RemoteComponent) }
];
