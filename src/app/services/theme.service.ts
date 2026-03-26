import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _dark = signal<boolean>(
    localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches),
  );

  readonly dark = this._dark.asReadonly();

  constructor() {
    this.applyTheme(this._dark());
  }

  toggle() {
    const next = !this._dark();
    this._dark.set(next);
    this.applyTheme(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  private applyTheme(dark: boolean) {
    document.documentElement.classList.toggle('dark', dark);
  }
}
