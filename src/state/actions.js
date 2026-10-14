import { store } from './store.js';
import { calculateFare, calculateCo2Saved, validateDistance, validateWeight } from '../utils/calculator.js';

export function setRole(newRole) {
  store.setState(state => ({
    ...state,
    activeRole: newRole
  }));
}

export function createOrder({ pickup, dropoff, itemType, distanceKm, weightKg, senderName, senderPhone }) {
  const distVal = validateDistance(distanceKm);
  if (!distVal.isValid) throw new Error(distVal.message);

  const weightVal = validateWeight(weightKg);
  if (!weightVal.isValid) throw new Error(weightVal.message);

  const newOrder = {
    id: `ORD-${Math.floor(100 + Math.random() * 900)}`,
    pickup,
    dropoff,
    itemType,
    distanceKm,
    weightKg,
    senderName,
    senderPhone,
    fare: calculateFare(distanceKm),
    co2SavedGrams: calculateCo2Saved(distanceKm),
    status: 'pending', // pending | accepted | picking_up | in_transit | delivered | cancelled
    assignedRiderId: null,
    createdAt: new Date().toISOString()
  };

  store.setState(state => ({
    ...state,
    orders: [newOrder, ...state.orders]
  }));

  return newOrder;
}

export function cancelOrder(orderId) {
  store.setState(state => {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return state;
    if (order.status === 'in_transit' || order.status === 'delivered') {
      throw new Error('Pesanan dalam perjalanan tidak dapat dibatalkan.');
    }

    const updatedRiders = state.riders.map(r => {
      if (r.id === order.assignedRiderId) {
        return { ...r, status: 'available' };
      }
      return r;
    });

    return {
      ...state,
      riders: updatedRiders,
      orders: state.orders.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o)
    };
  });
}

export function setRiderOnline(riderId, isOnline) {
  store.setState(state => ({
    ...state,
    riders: state.riders.map(r => r.id === riderId ? {
      ...r,
      isOnline,
      status: isOnline ? (r.status === 'offline' ? 'available' : r.status) : 'offline'
    } : r)
  }));
}

export function acceptOrder(riderId, orderId) {
  store.setState(state => {
    const order = state.orders.find(o => o.id === orderId);
    const rider = state.riders.find(r => r.id === riderId);
    if (!order || !rider || order.status !== 'pending') return state;

    return {
      ...state,
      orders: state.orders.map(o => o.id === orderId ? {
        ...o,
        status: 'accepted',
        assignedRiderId: riderId
      } : o),
      riders: state.riders.map(r => r.id === riderId ? {
        ...r,
        status: 'on_delivery'
      } : r)
    };
  });
}

export function updateOrderMilestone(orderId, nextStatus) {
  store.setState(state => {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return state;

    let updatedMetrics = { ...state.metrics };
    let updatedRiders = [...state.riders];

    if (nextStatus === 'delivered') {
      updatedMetrics.completedOrders += 1;
      updatedMetrics.totalCo2Saved += order.co2SavedGrams;

      updatedRiders = updatedRiders.map(r => {
        if (r.id === order.assignedRiderId) {
          return {
            ...r,
            status: 'available',
            totalKmToday: Number((r.totalKmToday + order.distanceKm).toFixed(1)),
            deliveriesCount: r.deliveriesCount + 1
          };
        }
        return r;
      });
    }

    return {
      ...state,
      metrics: updatedMetrics,
      riders: updatedRiders,
      orders: state.orders.map(o => o.id === orderId ? { ...o, status: nextStatus } : o)
    };
  });
}

export function reportRiderIssue(orderId) {
  store.setState(state => {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return state;

    return {
      ...state,
      orders: state.orders.map(o => o.id === orderId ? {
        ...o,
        status: 'pending',
        assignedRiderId: null
      } : o),
      riders: state.riders.map(r => r.id === order.assignedRiderId ? {
        ...r,
        status: 'offline',
        isOnline: false
      } : r)
    };
  });
}
