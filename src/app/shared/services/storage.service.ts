import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  get<T = any>(key: string): T {
    const raw = localStorage.getItem(key);
    if (raw === null) return {} as T;
    try {
      return (JSON.parse(raw) ?? {}) as T;
    } catch {
      console.warn(`[LocalStorageService] Corrupt data for key "${key}", clearing it`);
      localStorage.removeItem(key);
      return {} as T;
    }
  }

  set(key: string, value: unknown): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      console.warn(`[LocalStorageService] Failed to write key "${key}"`);
      return false;
    }
  }

  has(key: string): boolean {
    return !!localStorage.getItem(key);
  }

  remove(key: string) {
    localStorage.removeItem(key);
  }

  clear() {
    localStorage.clear();
  }
}

export class MemoryStorageService {
  private store: Record<string, string> = {};

  get<T = any>(key: string): T {
    const raw = this.store[key];
    if (!raw) return {} as T;
    try {
      return (JSON.parse(raw) ?? {}) as T;
    } catch {
      delete this.store[key];
      return {} as T;
    }
  }

  set(key: string, value: unknown): boolean {
    this.store[key] = JSON.stringify(value);
    return true;
  }

  has(key: string): boolean {
    return !!this.store[key];
  }

  remove(key: string) {
    delete this.store[key];
  }

  clear() {
    this.store = {};
  }
}
