/**
 * Coupon validation and discount calculation
 * 
 * Validates coupons client-side from preloaded coupons.json data.
 * Also fires a GAS POST for server-side usage tracking (fire-and-forget).
 */

const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL;

export interface CouponData {
    kode: string;
    tipe: 'persen' | 'nominal' | 'gratis_ongkir';
    nilai: number;
    min_order: number;
    max_diskon: number;
    aktif: boolean;
}

interface CouponRaw {
    kode: string;
    tipe: string;
    nilai: number;
    min_order: number;
    max_diskon: number;
    batas_pakai: number;
    sudah_dipakai: number;
    berlaku_dari: string;
    berlaku_sampai: string;
    aktif: boolean;
}

interface ValidateResponse {
    success: boolean;
    error?: string;
    coupon?: CouponData;
}

/**
 * Validate coupon code against preloaded coupons.json + optional GAS check
 */
export async function validateCoupon(kode: string, subtotal: number): Promise<ValidateResponse> {
    const kodeClean = kode.toUpperCase().trim();
    if (!kodeClean) {
        return { success: false, error: 'Masukkan kode kupon' };
    }

    // Client-side validation from preloaded data
    let couponsRaw: CouponRaw[];
    try {
        const couponsModule = await import('../../public/data/coupons.json');
        couponsRaw = couponsModule.default as CouponRaw[];
    } catch {
        return { success: false, error: 'Data kupon tidak tersedia' };
    }

    const coupon = couponsRaw.find(c => String(c.kode).toUpperCase() === kodeClean);
    if (!coupon) {
        return { success: false, error: 'Kode kupon tidak ditemukan' };
    }
    if (!coupon.aktif) {
        return { success: false, error: 'Kupon sudah tidak aktif' };
    }

    // Check date validity
    const now = new Date();
    if (coupon.berlaku_sampai && new Date(coupon.berlaku_sampai) < now) {
        return { success: false, error: 'Kupon sudah kadaluarsa' };
    }
    if (coupon.berlaku_dari && new Date(coupon.berlaku_dari) > now) {
        return { success: false, error: 'Kupon belum berlaku' };
    }

    // Check usage limit (client-side approximation)
    if (coupon.batas_pakai > 0 && coupon.sudah_dipakai >= coupon.batas_pakai) {
        return { success: false, error: 'Kupon sudah habis dipakai' };
    }

    // Check minimum order
    if (coupon.min_order > 0 && subtotal < coupon.min_order) {
        return {
            success: false,
            error: `Minimum belanja ${formatRupiah(coupon.min_order)}`,
        };
    }

    // Fire-and-forget GAS validation for server-side tracking
    if (GAS_URL) {
        try {
            fetch(GAS_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ action: 'validate_coupon', kode: kodeClean, subtotal }),
            }).catch(() => { /* ignore */ });
        } catch {
            // ignore network errors
        }
    }

    return {
        success: true,
        coupon: {
            kode: coupon.kode,
            tipe: coupon.tipe as CouponData['tipe'],
            nilai: coupon.nilai,
            min_order: coupon.min_order,
            max_diskon: coupon.max_diskon,
            aktif: coupon.aktif,
        },
    };
}

function formatRupiah(n: number): string {
    return 'Rp' + n.toLocaleString('id-ID');
}

/**
 * Calculate discount amount based on coupon type
 */
export function calculateDiscount(
    coupon: CouponData,
    subtotal: number,
    ongkir: number
): { diskon: number; ongkirDiskon: number } {
    switch (coupon.tipe) {
        case 'persen': {
            let diskon = Math.round(subtotal * (coupon.nilai / 100));
            if (coupon.max_diskon > 0) {
                diskon = Math.min(diskon, coupon.max_diskon);
            }
            return { diskon, ongkirDiskon: 0 };
        }
        case 'nominal':
            return { diskon: Math.min(coupon.nilai, subtotal), ongkirDiskon: 0 };
        case 'gratis_ongkir':
            return { diskon: 0, ongkirDiskon: ongkir };
        default:
            return { diskon: 0, ongkirDiskon: 0 };
    }
}
