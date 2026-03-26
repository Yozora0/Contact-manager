import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AvatarService } from '../../services/avatar.service';

@Component({
  selector: 'app-avatar-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center gap-3">
      <div class="relative w-20 h-20 rounded-full cursor-pointer group" (click)="fileInput.click()">
        <img
          *ngIf="preview"
          [src]="preview"
          alt="Avatar"
          class="w-20 h-20 rounded-full object-cover border-2 border-indigo-200 dark:border-indigo-700"
        />
        <div
          *ngIf="!preview"
          class="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-500 dark:text-indigo-300 text-2xl font-semibold border-2 border-dashed border-indigo-300 dark:border-indigo-600"
        >
          {{ initials }}
        </div>

        <div
          class="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        >
          <span class="text-white text-xs font-medium">Changer</span>
        </div>
      </div>

      <input #fileInput type="file" accept="image/*" class="hidden" (change)="handleFile($event)" />

      <button
        *ngIf="preview"
        type="button"
        (click)="handleRemove()"
        class="text-xs text-red-400 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
      >
        Supprimer la photo
      </button>

      <p *ngIf="error" class="text-xs text-red-500">{{ error }}</p>
      <p class="text-xs text-gray-400 dark:text-gray-500">JPG, PNG · max 2Mo</p>
    </div>
  `,
})
export class AvatarUploadComponent {
  @Input() preview: string | undefined = undefined;
  @Input() initials = '?';
  @Output() onAvatarChange = new EventEmitter<string | undefined>();

  error = '';

  constructor(private avatarService: AvatarService) {}

  async handleFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (!this.avatarService.isValid(file)) {
      this.error = 'Image invalide ou trop lourde (max 2Mo).';
      return;
    }

    this.error = '';
    const base64 = await this.avatarService.toBase64(file);
    this.preview = base64;
    this.onAvatarChange.emit(base64);
  }

  handleRemove() {
    this.preview = undefined;
    this.onAvatarChange.emit(undefined);
  }
}
