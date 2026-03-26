import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Contact, ContactGroup } from '../../models/contact.model';
import { CONTACT_GROUPS, GROUP_COLORS } from '../../models/contact.model';
import { ContactService } from '../../services/contact.service';
import { ThemeService } from '../../services/theme.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { ContactCardComponent } from '../contact-card/contact-card.component';
import { ContactDrawerComponent } from '../contact-drawer/contact-drawer.component';
import { ContactFormComponent } from '../contact-form/contact-form.component';

type ImportStatus = 'success' | 'partial' | 'error' | null;

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ContactCardComponent,
    ContactFormComponent,
    ConfirmDialogComponent,
    ContactDrawerComponent,
  ],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div
        class="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10"
      >
        <div class="max-w-4xl mx-auto px-4 py-4">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Contacts</h1>
              <p class="text-sm text-gray-400 dark:text-gray-500">
                {{ contactService.total() }} contact{{ contactService.total() > 1 ? 's' : '' }}
              </p>
            </div>
            <div class="flex gap-2 items-center">
              <button
                (click)="themeService.toggle()"
                class="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                [title]="themeService.dark() ? 'Mode clair' : 'Mode sombre'"
              >
                {{ themeService.dark() ? '☀️' : '🌙' }}
              </button>
              <button
                (click)="triggerImport()"
                class="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                ↑ Import
              </button>
              <input
                #fileInput
                type="file"
                accept=".csv"
                class="hidden"
                (change)="handleImport($event)"
              />
              <button
                (click)="contactService.exportCSV()"
                class="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                ↓ Export
              </button>
              <button
                (click)="showForm.set(true)"
                class="px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors"
              >
                + Nouveau
              </button>
            </div>
          </div>

          <div class="flex gap-3 flex-wrap">
            <div class="relative flex-1 min-w-48">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Rechercher..."
                [ngModel]="contactService.search()"
                (ngModelChange)="contactService.setSearch($event)"
                class="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:border-indigo-300 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>

            <select
              [ngModel]="contactService.sortBy()"
              (ngModelChange)="contactService.setSortBy($event)"
              class="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300"
            >
              <option value="name">Trier par nom</option>
              <option value="group">Trier par groupe</option>
              <option value="date">Trier par date</option>
            </select>
          </div>

          <div class="flex gap-2 mt-3 overflow-x-auto pb-1">
            <button
              *ngFor="let g of allGroups"
              (click)="contactService.setGroup(g)"
              class="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1"
              [class.bg-indigo-500]="contactService.group() === g"
              [class.text-white]="contactService.group() === g"
              [class.bg-gray-100]="contactService.group() !== g"
              [class.dark:bg-gray-800]="contactService.group() !== g"
              [class.text-gray-600]="contactService.group() !== g"
              [class.dark:text-gray-400]="contactService.group() !== g"
            >
              {{ g }}
              <span class="opacity-70">({{ contactService.groupCounts()[g] ?? 0 }})</span>
            </button>
          </div>
        </div>
      </div>

      <div class="max-w-4xl mx-auto px-4 py-6">
        <div
          *ngIf="importMessage()"
          class="mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-fade-in"
          [style.background]="importBg()"
          [style.border]="'1px solid ' + importBorder()"
          [style.color]="importColor()"
        >
          <span>{{ importIcon() }}</span>
          <span>{{ importMessage() }}</span>
        </div>

        <div *ngIf="contactService.contacts().length === 0" class="text-center py-20 text-gray-400">
          <p class="text-5xl mb-4">👤</p>
          <p class="text-lg font-medium text-gray-500 dark:text-gray-400">Aucun contact trouvé</p>
          <p class="text-sm mt-1">Essaie une autre recherche ou ajoute un contact.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <app-contact-card
            *ngFor="let contact of contactService.contacts(); trackBy: trackById"
            [contact]="contact"
            (onView)="openDrawer($event)"
            (onEdit)="openEdit($event)"
            (onDelete)="openDelete($event)"
          />
        </div>
      </div>
    </div>

    <app-contact-form
      *ngIf="showForm()"
      mode="add"
      (onSave)="handleAdd($event)"
      (onCancel)="showForm.set(false)"
    />

    <app-contact-form
      *ngIf="contactToEdit()"
      mode="edit"
      [contact]="contactToEdit()!"
      (onSave)="handleEdit($event)"
      (onCancel)="contactToEdit.set(null)"
    />

    <app-confirm-dialog
      *ngIf="contactToDelete()"
      message="Veux-tu vraiment supprimer ce contact ?"
      (onConfirm)="handleDelete()"
      (onCancel)="contactToDelete.set(null)"
    />

    <app-contact-drawer
      [contact]="selectedContact()"
      (onClose)="selectedContact.set(null)"
      (onDeleted)="selectedContact.set(null)"
      (onUpdated)="selectedContact.set($event)"
    />
  `,
})
export class ContactListComponent {
  showForm = signal(false);
  contactToEdit = signal<Contact | null>(null);
  contactToDelete = signal<string | null>(null);
  selectedContact = signal<Contact | null>(null);
  importMessage = signal<string>('');
  importStatus = signal<ImportStatus>(null);

  allGroups: ('Tous' | ContactGroup)[] = ['Tous', ...CONTACT_GROUPS];
  groupColors = GROUP_COLORS;

  constructor(
    public contactService: ContactService,
    public themeService: ThemeService,
  ) {}

  importBg(): string {
    switch (this.importStatus()) {
      case 'success':
        return this.themeService.dark() ? 'rgba(20,83,45,0.3)' : '#f0fdf4';
      case 'partial':
        return this.themeService.dark() ? 'rgba(120,53,15,0.3)' : '#fffbeb';
      case 'error':
        return this.themeService.dark() ? 'rgba(127,29,29,0.3)' : '#fef2f2';
      default:
        return 'transparent';
    }
  }

  importBorder(): string {
    switch (this.importStatus()) {
      case 'success':
        return this.themeService.dark() ? '#166534' : '#bbf7d0';
      case 'partial':
        return this.themeService.dark() ? '#92400e' : '#fde68a';
      case 'error':
        return this.themeService.dark() ? '#991b1b' : '#fecaca';
      default:
        return 'transparent';
    }
  }

  importColor(): string {
    switch (this.importStatus()) {
      case 'success':
        return this.themeService.dark() ? '#86efac' : '#166534';
      case 'partial':
        return this.themeService.dark() ? '#fcd34d' : '#92400e';
      case 'error':
        return this.themeService.dark() ? '#fca5a5' : '#991b1b';
      default:
        return 'inherit';
    }
  }

  importIcon(): string {
    switch (this.importStatus()) {
      case 'success':
        return '✓';
      case 'partial':
        return '⚠';
      case 'error':
        return '✕';
      default:
        return '';
    }
  }

  trackById(_: number, c: Contact) {
    return c.id;
  }

  openDrawer(contact: Contact) {
    this.selectedContact.set(contact);
  }
  openEdit(contact: Contact) {
    this.contactToEdit.set(contact);
  }
  openDelete(id: string) {
    this.contactToDelete.set(id);
  }

  handleAdd(data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) {
    this.contactService.add(data);
    this.showForm.set(false);
  }

  handleEdit(data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) {
    const id = this.contactToEdit()?.id;
    if (id) this.contactService.update(id, data);
    this.contactToEdit.set(null);
  }

  handleDelete() {
    const id = this.contactToDelete();
    if (id) this.contactService.delete(id);
    this.contactToDelete.set(null);
  }

  triggerImport() {
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    input?.click();
  }

  async handleImport(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      const { imported, skipped } = await this.contactService.importCSV(file);

      if (imported === 0 && skipped > 0) {
        this.importStatus.set('error');
        this.importMessage.set(
          `Aucun contact importé — ${skipped} doublon${skipped > 1 ? 's' : ''} détecté${skipped > 1 ? 's' : ''}.`,
        );
      } else if (imported > 0 && skipped > 0) {
        this.importStatus.set('partial');
        this.importMessage.set(
          `${imported} contact${imported > 1 ? 's' : ''} importé${imported > 1 ? 's' : ''} · ${skipped} doublon${skipped > 1 ? 's' : ''} ignoré${skipped > 1 ? 's' : ''}.`,
        );
      } else {
        this.importStatus.set('success');
        this.importMessage.set(
          `${imported} contact${imported > 1 ? 's' : ''} importé${imported > 1 ? 's' : ''} avec succès !`,
        );
      }

      setTimeout(() => {
        this.importMessage.set('');
        this.importStatus.set(null);
      }, 5000);
    } catch {
      this.importStatus.set('error');
      this.importMessage.set("Erreur lors de l'import — vérifie le format du fichier.");
      setTimeout(() => {
        this.importMessage.set('');
        this.importStatus.set(null);
      }, 5000);
    }
  }
}
