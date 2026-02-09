'use client';
import { CartItem } from '@/lib/types';

const CART_KEY = 'cart';

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; }
}

export function saveCart(cart: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToCart(item: Omit<CartItem, 'quantity'>) {
  const cart = getCart();
  const existing = cart.find(c => c.menu_item_id === item.menu_item_id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...item, quantity: 1 });
  }
  saveCart(cart);
  return cart;
}

export function updateQuantity(menuItemId: number, delta: number): CartItem[] {
  let cart = getCart();
  const item = cart.find(c => c.menu_item_id === menuItemId);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) cart = cart.filter(c => c.menu_item_id !== menuItemId);
  }
  saveCart(cart);
  return cart;
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
}

export function cartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
}
