import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      (click)="onCancel.emit()"
    >
      <div
        class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-fade-in"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-center gap-3 mb-4">
          <div
            class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0"
          >
            <span class="text-red-600 dark:text-red-400 text-lg">⚠</span>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ title }}</h3>
        </div>
        <p class="text-gray-500 dark:text-gray-400 text-sm mb-6">{{ message }}</p>
        <div class="flex gap-3 justify-end">
          <button
            (click)="onCancel.emit()"
            class="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Annuler
          </button>
          <button
            (click)="onConfirm.emit()"
            class="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  @Input() title = 'Confirmer la suppression';
  @Input() message = 'Cette action est irréversible.';
  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
}
