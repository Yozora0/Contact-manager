import { computed, Injectable, signal } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import type { Contact, ContactGroup } from '../models/contact.model';
import { INITIAL_CONTACTS } from '../models/contact.model';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly STORAGE_KEY = 'contact-manager';

  private _contacts = signal<Contact[]>(this.loadFromStorage());
  private _search = signal<string>('');
  private _group = signal<ContactGroup | 'Tous'>('Tous');
  private _sortBy = signal<'name' | 'group' | 'date'>('name');

  readonly contacts = computed(() => {
    let list = this._contacts();
    const search = this._search().toLowerCase().trim();
    const group = this._group();

    if (search) {
      list = list.filter(
        (c) =>
          c.firstName.toLowerCase().includes(search) ||
          c.lastName.toLowerCase().includes(search) ||
          c.email.toLowerCase().includes(search) ||
          c.phone?.includes(search),
      );
    }

    if (group !== 'Tous') {
      list = list.filter((c) => c.group === group);
    }

    return [...list].sort((a, b) => {
      switch (this._sortBy()) {
        case 'name':
          return a.lastName.localeCompare(b.lastName);
        case 'group':
          return a.group.localeCompare(b.group);
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  });

  readonly total = computed(() => this._contacts().length);
  readonly search = this._search.asReadonly();
  readonly group = this._group.asReadonly();
  readonly sortBy = this._sortBy.asReadonly();

  readonly groupCounts = computed(() => {
    const counts: Record<string, number> = { Tous: this._contacts().length };
    this._contacts().forEach((c) => {
      counts[c.group] = (counts[c.group] ?? 0) + 1;
    });
    return counts;
  });

  setSearch(value: string) {
    this._search.set(value);
  }
  setGroup(value: ContactGroup | 'Tous') {
    this._group.set(value);
  }
  setSortBy(value: 'name' | 'group' | 'date') {
    this._sortBy.set(value);
  }

  getById(id: string): Contact | undefined {
    return this._contacts().find((c) => c.id === id);
  }

  add(data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Contact {
    const contact: Contact = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this._contacts.update((list) => [...list, contact]);
    this.saveToStorage();
    return contact;
  }

  update(id: string, data: Partial<Omit<Contact, 'id' | 'createdAt'>>): void {
    this._contacts.update((list) =>
      list.map((c) => (c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c)),
    );
    this.saveToStorage();
  }

  delete(id: string): void {
    this._contacts.update((list) => list.filter((c) => c.id !== id));
    this.saveToStorage();
  }

  exportCSV(): void {
    const headers = ['Prénom', 'Nom', 'Email', 'Téléphone', 'Groupe', 'Adresse', 'Notes'];
    const rows = this._contacts().map((c) => [
      c.firstName,
      c.lastName,
      c.email,
      c.phone ?? '',
      c.group,
      c.address ?? '',
      c.notes ?? '',
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'contacts.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  importCSV(file: File): Promise<{ imported: number; skipped: number }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text
            .split('\n')
            .slice(1)
            .filter((l) => l.trim());
          let imported = 0;
          let skipped = 0;

          lines.forEach((line) => {
            const cols = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
            if (cols.length >= 3 && cols[0] && cols[2]) {
              const emailExists = this._contacts().some(
                (c) => c.email.toLowerCase() === cols[2].toLowerCase(),
              );

              if (emailExists) {
                skipped++;
                return;
              }

              this.add({
                firstName: cols[0],
                lastName: cols[1] ?? '',
                email: cols[2],
                phone: cols[3] || undefined,
                group: (['Famille', 'Amis', 'Travail', 'Autre'].includes(cols[4])
                  ? cols[4]
                  : 'Autre') as ContactGroup,
                address: cols[5] || undefined,
                notes: cols[6] || undefined,
              });
              imported++;
            }
          });
          resolve({ imported, skipped });
        } catch {
          reject(new Error('Fichier invalide'));
        }
      };
      reader.readAsText(file);
    });
  }

  private loadFromStorage(): Contact[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_CONTACTS;
    } catch {
      return INITIAL_CONTACTS;
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._contacts()));
  }
}
