export type ContactGroup = 'Famille' | 'Amis' | 'Travail' | 'Autre';

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  group: ContactGroup;
  address?: string;
  notes?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export const CONTACT_GROUPS: ContactGroup[] = ['Famille', 'Amis', 'Travail', 'Autre'];

export const GROUP_COLORS: Record<ContactGroup, { bg: string; text: string }> = {
  Famille: { bg: 'bg-blue-100', text: 'text-blue-800' },
  Amis: { bg: 'bg-green-100', text: 'text-green-800' },
  Travail: { bg: 'bg-purple-100', text: 'text-purple-800' },
  Autre: { bg: 'bg-gray-100', text: 'text-gray-800' },
};

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: '1',
    firstName: 'Alice',
    lastName: 'Martin',
    email: 'alice.martin@email.com',
    phone: '06 12 34 56 78',
    group: 'Amis',
    address: '12 rue de la Paix, Paris',
    notes: 'Rencontrée à la fac',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    firstName: 'Thomas',
    lastName: 'Dupont',
    email: 'thomas.dupont@email.com',
    phone: '07 98 76 54 32',
    group: 'Travail',
    address: '5 avenue des Champs, Lyon',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    firstName: 'Sophie',
    lastName: 'Bernard',
    email: 'sophie.bernard@email.com',
    phone: '06 11 22 33 44',
    group: 'Famille',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    firstName: 'Lucas',
    lastName: 'Petit',
    email: 'lucas.petit@email.com',
    group: 'Autre',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
