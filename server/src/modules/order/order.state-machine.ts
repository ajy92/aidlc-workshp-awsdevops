import { InvalidStatusTransitionError } from '../../shared/errors/domain-error.js'

export type OrderStatus = 'PENDING' | 'PREPARING' | 'COMPLETED'

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PREPARING'],
  PREPARING: ['COMPLETED'],
  COMPLETED: [],
}

export function validateTransition(from: OrderStatus, to: OrderStatus): OrderStatus {
  if (!TRANSITIONS[from].includes(to)) {
    throw new InvalidStatusTransitionError(from, to)
  }
  return to
}
