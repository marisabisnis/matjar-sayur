'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './PromoSlider.module.css';

interface Slide {
    id: string;
    gambar_url: string;
    judul: string;
    deskripsi: string;
    tipe_link: string;
    link_tujuan: string;
}

interface PromoSliderProps {
    slides: Slide[];
}

export default function PromoSlider({ slides }: PromoSliderProps) {
    const [current, setCurrent] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const total = slides.length;

    const goTo = useCallback((idx: number) => {
        setCurrent(((idx % total) + total) % total);
    }, [total]);

    // Auto-play with stable interval (no re-creation on slide change)
    const startTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setCurrent(prev => (prev + 1) % total);
        }, 5000);
    }, [total]);

    useEffect(() => {
        startTimer();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [startTimer]);

    // Reset timer on user interaction
    const resetTimer = useCallback(() => {
        startTimer();
    }, [startTimer]);

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (Math.abs(distance) > 50) {
            if (distance > 0) goTo(current + 1);
            else goTo(current - 1);
            resetTimer();
        }
        setTouchStart(0);
        setTouchEnd(0);
    };

    if (total === 0) return null;

    return (
        <section className={styles.slider} aria-label="Promo">
            <div
                className={styles.track}
                style={{ transform: `translateX(-${current * 100}%)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {slides.map((slide) => (
                    <div key={slide.id} className={styles.slide}>
                        <Image
                            src={slide.gambar_url}
                            alt={slide.judul}
                            fill
                            className={styles.slideImage}
                            sizes="(max-width: 1280px) 100vw, 1280px"
                            priority={slide.id === slides[0].id}
                        />
                        <div className={styles.slideOverlay} />
                        <div className={styles.slideContent}>
                            <span className={styles.slideTag}>Promo</span>
                            <h2 className={styles.slideTitle}>{slide.judul}</h2>
                            <p className={styles.slideDesc}>{slide.deskripsi}</p>
                            {slide.link_tujuan && (
                                <Link href={slide.link_tujuan} className={styles.slideCTA}>
                                    Lihat Promo
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                                        arrow_forward
                                    </span>
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Arrows */}
            {total > 1 && (
                <>
                    <button
                        className={`${styles.arrow} ${styles.arrowLeft}`}
                        onClick={() => { goTo(current - 1); resetTimer(); }}
                        aria-label="Slide sebelumnya"
                    >
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button
                        className={`${styles.arrow} ${styles.arrowRight}`}
                        onClick={() => { goTo(current + 1); resetTimer(); }}
                        aria-label="Slide berikutnya"
                    >
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </>
            )}

            {/* Dots */}
            {total > 1 && (
                <div className={styles.dots}>
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
                            onClick={() => { goTo(i); resetTimer(); }}
                            aria-label={`Slide ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
