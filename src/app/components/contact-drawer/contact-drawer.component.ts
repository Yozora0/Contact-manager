import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import type { Contact } from '../../models/contact.model';
import { GROUP_COLORS } from '../../models/contact.model';
import { FullNamePipe, InitialsPipe } from '../../pipes/filter.pipe';
import { ContactService } from '../../services/contact.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { ContactFormComponent } from '../contact-form/contact-form.component';

@Component({
  selector: 'app-contact-drawer',
  standalone: true,
  imports: [CommonModule, InitialsPipe, FullNamePipe, ContactFormComponent, ConfirmDialogComponent],
  template: `
    <div class="fixed inset-0 z-40 flex justify-end" *ngIf="contact">
      <div
        class="absolute inset-0 bg-black/30 backdrop-blur-sm"
        (click)="handleClose()"
        [class.animate-fade-in]="!closing"
        [class.animate-fade-out]="closing"
      ></div>

      <div
        class="relative w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col overflow-hidden"
        [class.animate-slide-in]="!closing"
        [class.animate-slide-out]="closing"
        style="border-top-left-radius: 1rem;"
      >
        <div
          class="px-6 py-8 flex-shrink-0"
          style="background: linear-gradient(to right, #6366f1, #9333ea); border-top-left-radius: 1rem;"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-4">
              <img
                *ngIf="contact.avatar"
                [src]="contact.avatar"
                [alt]="contact | fullName"
                class="w-16 h-16 rounded-full object-cover border-2 border-white/30"
              />
              <div
                *ngIf="!contact.avatar"
                class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl"
              >
                {{ contact | initials }}
              </div>
              <div>
                <h2 class="text-xl font-bold text-white">{{ contact | fullName }}</h2>
                <span
                  class="inline-block mt-1 text-xs font-medium px-3 py-1 rounded-full bg-white/20 text-white"
                >
                  {{ contact.group }}
                </span>
              </div>
            </div>
            <button
              (click)="handleClose()"
              class="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-3">
          <div class="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
            <span class="text-lg w-8 text-center">✉</span>
            <div>
              <p class="text-xs text-gray-400 dark:text-gray-500 font-medium">Email</p>
              <p class="text-sm text-gray-800 dark:text-gray-200">{{ contact.email }}</p>
            </div>
          </div>

          <div
            *ngIf="contact.phone"
            class="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800"
          >
            <span class="text-lg w-8 text-center">📞</span>
            <div>
              <p class="text-xs text-gray-400 dark:text-gray-500 font-medium">Téléphone</p>
              <p class="text-sm text-gray-800 dark:text-gray-200">{{ contact.phone }}</p>
            </div>
          </div>

          <div
            *ngIf="contact.address"
            class="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800"
          >
            <span class="text-lg w-8 text-center">📍</span>
            <div>
              <p class="text-xs text-gray-400 dark:text-gray-500 font-medium">Adresse</p>
              <p class="text-sm text-gray-800 dark:text-gray-200">{{ contact.address }}</p>
            </div>
          </div>

          <div
            *ngIf="contact.notes"
            class="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800"
          >
            <span class="text-lg w-8 text-center">📝</span>
            <div>
              <p class="text-xs text-gray-400 dark:text-gray-500 font-medium">Notes</p>
              <p class="text-sm text-gray-800 dark:text-gray-200">{{ contact.notes }}</p>
            </div>
          </div>

          <div
            class="text-xs text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-700"
          >
            Créé le {{ contact.createdAt | date: 'dd/MM/yyyy' }} · Modifié le
            {{ contact.updatedAt | date: 'dd/MM/yyyy' }}
          </div>
        </div>

        <div
          class="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex gap-3 flex-shrink-0"
        >
          <button
            (click)="showEdit.set(true)"
            class="flex-1 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors"
          >
            ✎ Modifier
          </button>
          <button
            (click)="showConfirm.set(true)"
            class="flex-1 py-2.5 rounded-xl border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>

    <app-contact-form
      *ngIf="showEdit()"
      mode="edit"
      [contact]="contact!"
      (onSave)="handleEdit($event)"
      (onCancel)="showEdit.set(false)"
    />

    <app-confirm-dialog
      *ngIf="showConfirm()"
      message="Veux-tu vraiment supprimer ce contact ?"
      (onConfirm)="handleDelete()"
      (onCancel)="showConfirm.set(false)"
    />
  `,
})
export class ContactDrawerComponent {
  @Input() contact: Contact | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onDeleted = new EventEmitter<void>();
  @Output() onUpdated = new EventEmitter<Contact>();

  showEdit = signal(false);
  showConfirm = signal(false);
  closing = false;

  groupColors = GROUP_COLORS;

  constructor(private contactService: ContactService) {}

  handleClose() {
    this.closing = true;
    setTimeout(() => {
      this.closing = false;
      this.onClose.emit();
    }, 250);
  }

  handleEdit(data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) {
    if (this.contact) {
      this.contactService.update(this.contact.id, data);
      const updated = this.contactService.getById(this.contact.id);
      if (updated) this.onUpdated.emit(updated);
    }
    this.showEdit.set(false);
  }

  handleDelete() {
    if (this.contact) this.contactService.delete(this.contact.id);
    this.showConfirm.set(false);
    this.onDeleted.emit();
    this.handleClose();
  }
}
