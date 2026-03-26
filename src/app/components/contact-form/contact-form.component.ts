import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Contact } from '../../models/contact.model';
import { CONTACT_GROUPS } from '../../models/contact.model';
import { AvatarUploadComponent } from '../avatar-upload/avatar-upload.component';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AvatarUploadComponent],
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      (click)="onCancel.emit()"
    >
      <div
        class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in"
        (click)="$event.stopPropagation()"
      >
        <div
          class="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 px-6 py-4 rounded-t-2xl"
        >
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ mode === 'add' ? 'Nouveau contact' : 'Modifier le contact' }}
            </h2>
            <button
              (click)="onCancel.emit()"
              class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <form [formGroup]="form" (ngSubmit)="handleSubmit()" class="p-6 space-y-4">
          <div class="flex justify-center mb-2">
            <app-avatar-upload
              [preview]="avatarPreview"
              [initials]="getInitials()"
              (onAvatarChange)="handleAvatarChange($event)"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >Prénom *</label
              >
              <input
                formControlName="firstName"
                type="text"
                placeholder="Jean"
                class="w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                [class.border-red-300]="isInvalid('firstName')"
                [class.border-gray-200]="!isInvalid('firstName')"
                [class.dark:border-gray-600]="true"
              />
              <p *ngIf="isInvalid('firstName')" class="text-red-500 text-xs mt-1">Prénom requis</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >Nom *</label
              >
              <input
                formControlName="lastName"
                type="text"
                placeholder="Dupont"
                class="w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                [class.border-red-300]="isInvalid('lastName')"
                [class.border-gray-200]="!isInvalid('lastName')"
              />
              <p *ngIf="isInvalid('lastName')" class="text-red-500 text-xs mt-1">Nom requis</p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >Email *</label
            >
            <input
              formControlName="email"
              type="email"
              placeholder="jean.dupont@email.com"
              class="w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              [class.border-red-300]="isInvalid('email')"
              [class.border-gray-200]="!isInvalid('email')"
            />
            <p *ngIf="isInvalid('email')" class="text-red-500 text-xs mt-1">Email valide requis</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >Téléphone</label
            >
            <input
              formControlName="phone"
              type="tel"
              placeholder="06 12 34 56 78"
              class="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >Groupe *</label
            >
            <select
              formControlName="group"
              class="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option *ngFor="let g of groups" [value]="g">{{ g }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >Adresse</label
            >
            <input
              formControlName="address"
              type="text"
              placeholder="12 rue de la Paix, Paris"
              class="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >Notes</label
            >
            <textarea
              formControlName="notes"
              rows="3"
              placeholder="Informations supplémentaires..."
              class="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            ></textarea>
          </div>

          <div class="flex gap-3 pt-2">
            <button
              type="button"
              (click)="onCancel.emit()"
              class="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              [disabled]="form.invalid"
              class="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
              [class.bg-indigo-500]="form.valid"
              [class.hover:bg-indigo-600]="form.valid"
              [class.bg-gray-300]="form.invalid"
              [class.cursor-not-allowed]="form.invalid"
            >
              {{ mode === 'add' ? 'Ajouter' : 'Sauvegarder' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class ContactFormComponent implements OnInit {
  @Input() mode: 'add' | 'edit' = 'add';
  @Input() contact?: Contact;
  @Output() onSave = new EventEmitter<Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>>();
  @Output() onCancel = new EventEmitter<void>();

  groups = CONTACT_GROUPS;
  form!: FormGroup;
  avatarPreview: string | undefined;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.avatarPreview = this.contact?.avatar;
    this.form = this.fb.group({
      firstName: [this.contact?.firstName ?? '', Validators.required],
      lastName: [this.contact?.lastName ?? '', Validators.required],
      email: [this.contact?.email ?? '', [Validators.required, Validators.email]],
      phone: [this.contact?.phone ?? ''],
      group: [this.contact?.group ?? 'Autre', Validators.required],
      address: [this.contact?.address ?? ''],
      notes: [this.contact?.notes ?? ''],
    });
  }

  getInitials(): string {
    const first = this.form?.get('firstName')?.value ?? '';
    const last = this.form?.get('lastName')?.value ?? '';
    return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase() || '?';
  }

  handleAvatarChange(avatar: string | undefined) {
    this.avatarPreview = avatar;
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && control?.touched);
  }

  handleSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.onSave.emit({ ...this.form.value, avatar: this.avatarPreview });
  }
}
