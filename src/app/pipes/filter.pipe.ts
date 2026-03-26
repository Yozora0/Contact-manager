import { Pipe, PipeTransform } from '@angular/core';
import type { Contact } from '../models/contact.model';

@Pipe({ name: 'initials', standalone: true })
export class InitialsPipe implements PipeTransform {
  transform(contact: Contact): string {
    return `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase();
  }
}

@Pipe({ name: 'fullName', standalone: true })
export class FullNamePipe implements PipeTransform {
  transform(contact: Contact): string {
    return `${contact.firstName} ${contact.lastName}`;
  }
}
