import { describe, it, expect, beforeEach } from 'vitest';
import { store } from '../src/state/store.js';
import * as actions from '../src/state/actions.js';

describe('Reactive Store & Actions', () => {
  beforeEach(() => {
    store.resetState();
  });

  it('initializes with default mock riders and empty orders', () => {
    const state = store.getState();
    expect(state.activeRole).toBe('customer');
    expect(state.riders.length).toBeGreaterThan(0);
    expect(state.orders).toEqual([]);
  });

  it('creates an order and notifies subscribers', () => {
    let notified = false;
    store.subscribe(() => { notified = true; });

    const order = actions.createOrder({
      pickup: 'Menara Sudirman',
      dropoff: 'Gedung Kuningan',
      itemType: 'Dokumen',
      distanceKm: 3.5,
      weightKg: 1.0,
      senderName: 'Budi',
      senderPhone: '08123456789'
    });

    expect(order.status).toBe('pending');
    expect(order.co2SavedGrams).toBe(420);
    expect(store.getState().orders.length).toBe(1);
    expect(notified).toBe(true);
  });

  it('progresses order lifecycle via rider actions', () => {
    const order = actions.createOrder({
      pickup: 'Lokasi A',
      dropoff: 'Lokasi B',
      itemType: 'Berkas',
      distanceKm: 2.0,
      weightKg: 1.0,
      senderName: 'Dewi',
      senderPhone: '08111111111'
    });

    const riderId = store.getState().riders[0].id;
    actions.acceptOrder(riderId, order.id);
    expect(store.getState().orders[0].status).toBe('accepted');
    expect(store.getState().orders[0].assignedRiderId).toBe(riderId);

    actions.updateOrderMilestone(order.id, 'picking_up');
    expect(store.getState().orders[0].status).toBe('picking_up');

    actions.updateOrderMilestone(order.id, 'in_transit');
    expect(store.getState().orders[0].status).toBe('in_transit');

    actions.updateOrderMilestone(order.id, 'delivered');
    expect(store.getState().orders[0].status).toBe('delivered');
    expect(store.getState().metrics.totalCo2Saved).toBe(240);
  });
});
