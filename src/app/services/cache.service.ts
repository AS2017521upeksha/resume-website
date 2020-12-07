import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  cacheMemory: CacheObject;

  constructor() {
    this.cacheMemory = new CacheObject();
  }

  push(key, value) {
    if (this.cacheMemory && key && value) {
      this.cacheMemory[key] = value;
    }
  }

  pop(key) {
    if (this.cacheMemory && key && this.cacheMemory[key]) {
      const temp = this.cacheMemory[key];
      this.cacheMemory[key] = undefined;
      return temp;
    } else {
      return null;
    }
  }

}

export class CacheObject {
  constructor() {}
}
