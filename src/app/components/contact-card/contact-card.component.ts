import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { Contact } from '../../models/contact.model';
import { GROUP_COLORS } from '../../models/contact.model';
import { FullNamePipe, InitialsPipe } from '../../pipes/filter.pipe';

@Component({
  selector: 'app-contact-card',
  standalone: true,
  imports: [CommonModule, InitialsPipe, FullNamePipe],
  template: `
    <div
      class="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
      (click)="onView.emit(contact)"
    >
      <div class="flex items-start gap-3">
        <img
          *ngIf="contact.avatar"
          [src]="contact.avatar"
          [alt]="contact | fullName"
          class="w-11 h-11 rounded-full object-cover flex-shrink-0 border border-gray-100 dark:border-gray-700"
        />
        <div
          *ngIf="!contact.avatar"
          class="w-11 h-11 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0 text-indigo-700 dark:text-indigo-300 font-semibold text-sm"
        >
          {{ contact | initials }}
        </div>

        <div class="flex-1 min-w-0">
          <p class="font-semibold text-gray-900 dark:text-white truncate">
            {{ contact | fullName }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400 truncate">{{ contact.email }}</p>
          <p *ngIf="contact.phone" class="text-sm text-gray-400 dark:text-gray-500 truncate">
            {{ contact.phone }}
          </p>
        </div>

        <div class="flex flex-col items-end gap-2">
          <span
            class="text-xs font-medium px-2 py-0.5 rounded-full"
            [class]="groupColors[contact.group].bg + ' ' + groupColors[contact.group].text"
          >
            {{ contact.group }}
          </span>

          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              (click)="$event.stopPropagation(); onEdit.emit(contact)"
              class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900 text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors text-sm"
              title="Modifier"
            >
              ✎
            </button>
            <button
              (click)="$event.stopPropagation(); onDelete.emit(contact.id)"
              class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900 text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors text-sm"
              title="Supprimer"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ContactCardComponent {
  @Input() contact!: Contact;
  @Output() onView = new EventEmitter<Contact>();
  @Output() onEdit = new EventEmitter<Contact>();
  @Output() onDelete = new EventEmitter<string>();

  groupColors = GROUP_COLORS;
}
