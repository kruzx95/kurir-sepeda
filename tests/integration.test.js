import { describe, it, expect, beforeEach } from 'vitest';
import { store } from '../src/state/store.js';
import * as actions from '../src/state/actions.js';

describe('End-to-End Multi-Role Workflow', () => {
  beforeEach(() => {
    store.resetState();
  });

  it('completes the entire cycle: Customer creates -> Rider accepts & completes -> Admin tracks CO2', () => {
    // 1. Customer creates order
    const order = actions.createOrder({
      pickup: 'Pacific Place SCBD',
      dropoff: 'Menara BTPN Mega Kuningan',
      itemType: 'Dokumen / Surat Segel',
      distanceKm: 4.0,
      weightKg: 0.8,
      senderName: 'Direktur Legal',
      senderPhone: '0812-9988-7766'
    });

    expect(order.fare).toBe(22000); // 15000 + (2 * 3500)
    expect(order.co2SavedGrams).toBe(480); // 4 * 120
    expect(store.getState().orders[0].status).toBe('pending');

    // 2. Rider accepts from radar
    const rider = store.getState().riders[0];
    actions.acceptOrder(rider.id, order.id);

    expect(store.getState().orders[0].status).toBe('accepted');
    expect(store.getState().orders[0].assignedRiderId).toBe(rider.id);
    expect(store.getState().riders[0].status).toBe('on_delivery');

    // 3. Rider executes 1-tap milestones
    actions.updateOrderMilestone(order.id, 'picking_up');
    expect(store.getState().orders[0].status).toBe('picking_up');

    actions.updateOrderMilestone(order.id, 'in_transit');
    expect(store.getState().orders[0].status).toBe('in_transit');

    actions.updateOrderMilestone(order.id, 'delivered');
    expect(store.getState().orders[0].status).toBe('delivered');

    // 4. Admin metrics updated
    const state = store.getState();
    expect(state.metrics.completedOrders).toBe(1);
    expect(state.metrics.totalCo2Saved).toBe(480);
    expect(state.riders[0].status).toBe('available');
    expect(state.riders[0].totalKmToday).toBe(22.5); // 18.5 + 4.0
  });

  it('enforces cancellation rules properly', () => {
    const order = actions.createOrder({
      pickup: 'Lokasi A',
      dropoff: 'Lokasi B',
      itemType: 'Map Berkas Kantor',
      distanceKm: 2.0,
      weightKg: 1.0,
      senderName: 'User',
      senderPhone: '0811'
    });

    actions.cancelOrder(order.id);
    expect(store.getState().orders[0].status).toBe('cancelled');

    const order2 = actions.createOrder({
      pickup: 'Lokasi X',
      dropoff: 'Lokasi Y',
      itemType: 'Map Berkas Kantor',
      distanceKm: 2.0,
      weightKg: 1.0,
      senderName: 'User',
      senderPhone: '0811'
    });
    actions.acceptOrder('RIDER-01', order2.id);
    actions.updateOrderMilestone(order2.id, 'in_transit');

    // Should throw error when cancelling in transit
    expect(() => actions.cancelOrder(order2.id)).toThrow('tidak dapat dibatalkan');
  });
});
