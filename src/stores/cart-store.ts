'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/types';

interface CartStore {
    items: CartItem[];
    addItem: (product: { id: string; nama: string; harga: number; foto_utama: string }, qty: number, variasi?: string, tambahan?: number, catatan?: string) => void;
    removeItem: (id: string, variasi?: string) => void;
    updateQty: (id: string, qty: number, variasi?: string) => void;
    reorder: (items: CartItem[]) => void;
    clearCart: () => void;
    getTotal: () => number;
    getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (product, qty, variasi, tambahan, catatan) =>
                set((state) => {
                    const hargaFinal = product.harga + (tambahan || 0);
                    const key = product.id + (variasi || '');
                    const existing = state.items.find(
                        (i) => i.id + (i.variasi || '') === key
                    );

                    if (existing) {
                        return {
                            items: state.items.map((i) =>
                                i === existing
                                    ? { ...i, qty: i.qty + qty, subtotal: hargaFinal * (i.qty + qty) }
                                    : i
                            ),
                        };
                    }

                    return {
                        items: [
                            ...state.items,
                            {
                                id: product.id,
                                nama: product.nama,
                                harga: product.harga,
                                foto: product.foto_utama,
                                qty,
                                variasi,
                                tambahan,
                                catatan,
                                subtotal: hargaFinal * qty,
                            },
                        ],
                    };
                }),

            reorder: (items) =>
                set({
                    items: items.map((i) => ({
                        id: i.id || i.nama,
                        nama: i.nama,
                        harga: i.harga,
                        foto: i.foto || '',
                        qty: i.qty,
                        variasi: i.variasi,
                        tambahan: i.tambahan || 0,
                        catatan: i.catatan,
                        subtotal: (i.harga + (i.tambahan || 0)) * i.qty,
                    })),
                }),

            removeItem: (id, variasi) =>
                set((state) => ({
                    items: state.items.filter(
                        (i) => !(i.id === id && (i.variasi || '') === (variasi || ''))
                    ),
                })),

            updateQty: (id, qty, variasi) =>
                set((state) => ({
                    items: state.items.map((i) =>
                        i.id === id && (i.variasi || '') === (variasi || '')
                            ? { ...i, qty, subtotal: (i.harga + (i.tambahan || 0)) * qty }
                            : i
                    ),
                })),

            clearCart: () => set({ items: [] }),

            getTotal: () =>
                get().items.reduce((sum, i) => sum + i.subtotal, 0),

            getItemCount: () =>
                get().items.reduce((sum, i) => sum + i.qty, 0),
        }),
        { name: 'pesan-sayur-cart' }
    )
);
