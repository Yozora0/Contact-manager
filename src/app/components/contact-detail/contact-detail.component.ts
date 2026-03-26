import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import type { Contact } from '../../models/contact.model';
import { FullNamePipe, InitialsPipe } from '../../pipes/filter.pipe';
import { ContactService } from '../../services/contact.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { ContactFormComponent } from '../contact-form/contact-form.component';

@Component({
  selector: 'app-contact-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    InitialsPipe,
    FullNamePipe,
    ContactFormComponent,
    ConfirmDialogComponent,
  ],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-2xl mx-auto px-4 py-8">
        <button
          routerLink="/"
          class="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-6 transition-colors"
        >
          ← Retour aux contacts
        </button>

        <div *ngIf="contact(); else notFound">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-8">
              <div class="flex items-center gap-4">
                <div
                  class="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-2xl"
                >
                  {{ contact()! | initials }}
                </div>
                <div>
                  <h1 class="text-2xl font-bold text-white">{{ contact()! | fullName }}</h1>
                  <span
                    class="inline-block mt-1 text-xs font-medium px-3 py-1 rounded-full bg-white/20 text-white"
                  >
                    {{ contact()!.group }}
                  </span>
                </div>
              </div>
            </div>

            <div class="p-6 space-y-4">
              <div class="grid grid-cols-1 gap-4">
                <div class="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <span class="text-lg">✉</span>
                  <div>
                    <p class="text-xs text-gray-400 font-medium">Email</p>
                    <p class="text-sm text-gray-800">{{ contact()!.email }}</p>
                  </div>
                </div>

                <div
                  *ngIf="contact()!.phone"
                  class="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
                >
                  <span class="text-lg">📞</span>
                  <div>
                    <p class="text-xs text-gray-400 font-medium">Téléphone</p>
                    <p class="text-sm text-gray-800">{{ contact()!.phone }}</p>
                  </div>
                </div>

                <div
                  *ngIf="contact()!.address"
                  class="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
                >
                  <span class="text-lg">📍</span>
                  <div>
                    <p class="text-xs text-gray-400 font-medium">Adresse</p>
                    <p class="text-sm text-gray-800">{{ contact()!.address }}</p>
                  </div>
                </div>

                <div
                  *ngIf="contact()!.notes"
                  class="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
                >
                  <span class="text-lg">📝</span>
                  <div>
                    <p class="text-xs text-gray-400 font-medium">Notes</p>
                    <p class="text-sm text-gray-800">{{ contact()!.notes }}</p>
                  </div>
                </div>
              </div>

              <div class="text-xs text-gray-400 pt-2 border-t border-gray-100">
                Créé le {{ contact()!.createdAt | date: 'dd/MM/yyyy' }} · Modifié le
                {{ contact()!.updatedAt | date: 'dd/MM/yyyy' }}
              </div>
            </div>

            <div class="px-6 pb-6 flex gap-3">
              <button
                (click)="showEdit.set(true)"
                class="flex-1 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors"
              >
                ✎ Modifier
              </button>
              <button
                (click)="showConfirm.set(true)"
                class="flex-1 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>

        <ng-template #notFound>
          <div class="text-center py-20 text-gray-400">
            <p class="text-4xl mb-4">🔍</p>
            <p class="text-lg font-medium">Contact introuvable</p>
            <button routerLink="/" class="mt-4 text-indigo-500 text-sm hover:underline">
              Retour à la liste
            </button>
          </div>
        </ng-template>
      </div>
    </div>

    <app-contact-form
      *ngIf="showEdit()"
      mode="edit"
      [contact]="contact()!"
      (onSave)="handleEdit($event)"
      (onCancel)="showEdit.set(false)"
    />

    <app-confirm-dialog
      *ngIf="showConfirm()"
      message="Veux-tu vraiment supprimer ce contact ? Cette action est irréversible."
      (onConfirm)="handleDelete()"
      (onCancel)="showConfirm.set(false)"
    />
  `,
})
export class ContactDetailComponent {
  showEdit = signal(false);
  showConfirm = signal(false);

  contact = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return id ? this.contactService.getById(id) : undefined;
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contactService: ContactService,
  ) {}

  handleEdit(data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.contactService.update(id, data);
    this.showEdit.set(false);
  }

  handleDelete() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.contactService.delete(id);
    this.router.navigate(['/']);
  }
}
