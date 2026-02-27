import type { CartItem } from '@/types';
import { formatHarga } from './utils';

interface CheckoutData {
    orderId: string;
    nama: string;
    telepon: string;
    alamat: string;
    catatan?: string;
    jadwal: string;
    metodeBayar: string;
    items: CartItem[];
    subtotal: number;
    ongkir: number;
    total: number;
    diskon?: number;
    kupon?: string;
    linkMaps?: string;
}

/**
 * Generate formatted WhatsApp order message
 */
export function generateWAMessage(data: CheckoutData): string {
    const orderId = data.orderId;
    const tanggal = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    let msg = `🛒 *PESANAN BARU — MATJAR SAYUR*\n`;
    msg += `━━━━━━━━━━━━━━━━\n`;
    msg += `📋 ID: *${orderId}*\n`;
    msg += `📅 ${tanggal}\n\n`;

    msg += `👤 *Data Penerima*\n`;
    msg += `Nama: ${data.nama}\n`;
    msg += `Telp: ${data.telepon}\n`;
    msg += `Alamat: ${data.alamat}\n`;
    if (data.linkMaps) {
        msg += `📍 Lokasi: ${data.linkMaps}\n`;
    }
    msg += `\n`;

    msg += `🧺 *Detail Pesanan*\n`;
    msg += `━━━━━━━━━━━━━━━━\n`;
    data.items.forEach((item, i) => {
        const harga = item.harga + (item.tambahan || 0);
        msg += `${i + 1}. ${item.nama}`;
        if (item.variasi) msg += ` (${item.variasi})`;
        msg += `\n`;
        msg += `   ${item.qty}x ${formatHarga(harga)} = ${formatHarga(harga * item.qty)}\n`;
        if (item.catatan) msg += `   📝 ${item.catatan}\n`;
    });
    msg += `━━━━━━━━━━━━━━━━\n`;

    msg += `\n💰 *Ringkasan*\n`;
    msg += `Subtotal: ${formatHarga(data.subtotal)}\n`;
    if (data.diskon && data.diskon > 0) {
        msg += `Diskon${data.kupon ? ` (${data.kupon})` : ''}: -${formatHarga(data.diskon)}\n`;
    }
    msg += `Ongkir: ${data.ongkir === 0 ? 'GRATIS 🎉' : formatHarga(data.ongkir)}\n`;
    msg += `*TOTAL: ${formatHarga(data.total)}*\n\n`;

    msg += `🚚 Jadwal: ${data.jadwal}\n`;
    msg += `💳 Bayar: ${data.metodeBayar}\n`;

    if (data.catatan) {
        msg += `\n📝 Catatan: ${data.catatan}\n`;
    }

    msg += `\n_Terima kasih sudah belanja di Matjar Sayur! 🥬_`;

    return msg;
}

/**
 * Generate WhatsApp click-to-chat URL
 */
export function generateWALink(phone: string, message: string): string {
    // Strip everything except digits
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    // Normalize: 08xx → 628xx, already 62 → keep, other → prepend 62
    let formatted = cleanPhone;
    if (formatted.startsWith('0')) {
        formatted = '62' + formatted.slice(1);
    } else if (!formatted.startsWith('62')) {
        formatted = '62' + formatted;
    }
    return `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`;
}

/**
 * Default store WhatsApp number
 */
export const DEFAULT_WA_NUMBER = '6281219199323';
