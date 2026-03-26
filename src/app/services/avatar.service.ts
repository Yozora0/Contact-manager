import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AvatarService {
  toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  isValid(file: File): boolean {
    return file.type.startsWith('image/') && file.size < 2 * 1024 * 1024;
  }
}
