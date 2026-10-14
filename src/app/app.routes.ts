import { Routes } from '@angular/router';
import { HomePage } from './pages/home-page';
import { SongPage } from './pages/song-page';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'song/:id', component: SongPage },
  { path: '**', redirectTo: '' },
];
