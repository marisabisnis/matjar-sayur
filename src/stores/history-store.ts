'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/types';

export interface LocalOrder {
    id: string;           // ORD-xxx
    tanggal: string;      // ISO date
    nama: string;
    telepon: string;
    alamat: string;
    items: CartItem[];
    subtotal: number;
    ongkir: number;
    diskon: number;
    kupon?: string;
    total: number;
    jadwal: string;
    metodeBayar: string;
    catatan?: string;
    linkMaps?: string;
}

interface HistoryStore {
    orders: LocalOrder[];
    addOrder: (order: LocalOrder) => void;
    getOrder: (id: string) => LocalOrder | undefined;
    clearHistory: () => void;
}

export const useHistoryStore = create<HistoryStore>()(
    persist(
        (set, get) => ({
            orders: [],

            addOrder: (order) =>
                set((state) => ({
                    orders: [order, ...state.orders.filter(o => o.id !== order.id)],
                })),

            getOrder: (id) =>
                get().orders.find(o => o.id === id),

            clearHistory: () => set({ orders: [] }),
        }),
        { name: 'matjar-sayur-history' }
    )
);
