import { INITIAL_RIDERS } from '../utils/mockData.js';

class ReactiveStore {
  constructor() {
    this.resetState();
  }

  resetState() {
    this.state = {
      activeRole: 'customer', // 'customer' | 'rider' | 'admin'
      orders: [],
      riders: JSON.parse(JSON.stringify(INITIAL_RIDERS)),
      metrics: {
        totalCo2Saved: 0,
        completedOrders: 0
      }
    };
    this.listeners = [];
  }

  getState() {
    return this.state;
  }

  setState(updater) {
    if (typeof updater === 'function') {
      this.state = updater(this.state);
    } else {
      this.state = { ...this.state, ...updater };
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}

export const store = new ReactiveStore();
