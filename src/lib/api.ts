/**
 * API helper — POST order + GET order data from Google Apps Script
 */

import configData from '../../public/data/config.json';
const GAS_URL = configData.gas_url || process.env.NEXT_PUBLIC_GAS_URL;

interface OrderData {
    orderId: string;
    nama: string;
    telepon: string;
    alamat: string;
    catatan?: string;
    jadwal: string;
    metodeBayar: string;
    items: { id: string; nama: string; harga: number; qty: number; variasi?: string; tambahan?: number; catatan?: string }[];
    subtotal: number;
    ongkir: number;
    total: number;
    diskon?: number;
    kupon?: string;
    linkMaps?: string;
}

interface OrderResponse {
    success: boolean;
    orderId?: string;
    error?: string;
}

/**
 * Submit order to Google Sheets via GAS
 * Fire-and-forget (no-cors mode due to GAS redirect)
 */
export async function submitOrder(data: OrderData): Promise<OrderResponse> {
    if (!GAS_URL) {
        console.warn('GAS_URL not configured — order not recorded');
        return { success: false, error: 'GAS_URL not configured' };
    }

    try {
        await fetch(GAS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ action: 'order', data }),
        });

        return { success: true, orderId: data.orderId };
    } catch (err) {
        console.error('Failed to submit order:', err);
        return { success: false, error: String(err) };
    }
}

/**
 * Fetch single order from GAS by orderId
 */
export interface GASOrder {
    id_order: string;
    tanggal: string;
    nama: string;
    telepon: string;
    alamat: string;
    items_json: { id?: string; nama: string; harga: number; qty: number; variasi?: string; tambahan?: number; catatan?: string }[];
    subtotal: number;
    ongkir: number;
    total: number;
    jadwal: string;
    metode_bayar: string;
    status: string;
    catatan: string;
    diskon: number;
    kupon: string;
    link_maps: string;
}

export async function fetchOrder(orderId: string): Promise<{ success: boolean; order?: GASOrder; error?: string }> {
    if (!GAS_URL) {
        return { success: false, error: 'GAS_URL not configured' };
    }

    try {
        const res = await fetch(`${GAS_URL}?action=get_order&id=${encodeURIComponent(orderId)}`, {
            redirect: 'follow',
            headers: { Accept: 'application/json' },
        });
        const data = await res.json();
        return data;
    } catch (err) {
        return { success: false, error: String(err) };
    }
}

/**
 * Search orders by phone number from GAS
 */
export async function searchOrders(telepon: string): Promise<{ success: boolean; orders?: GASOrder[]; error?: string }> {
    if (!GAS_URL) {
        return { success: false, error: 'GAS_URL not configured' };
    }

    try {
        const cleanTelp = telepon.replace(/[^0-9]/g, '');
        const res = await fetch(`${GAS_URL}?action=search_orders&telepon=${encodeURIComponent(cleanTelp)}`, {
            redirect: 'follow',
            headers: { Accept: 'application/json' },
        });
        const data = await res.json();
        return data;
    } catch (err) {
        return { success: false, error: String(err) };
    }
}
