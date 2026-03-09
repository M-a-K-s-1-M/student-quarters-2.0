'use client'

import Glide from '@glidejs/glide';
import { Button, Image } from '@heroui/react';
import { useEffect, useMemo, useRef } from 'react';



interface IDormitoryImgSliderProps {
    images?: string[],
}

export function DormitoryImgSlider({ images }: IDormitoryImgSliderProps) {
    const rootRef = useRef<HTMLDivElement | null>(null);

    const safeImages = useMemo(() => {
        const normalized = (images ?? []).filter(Boolean);
        return normalized.length ? normalized : ['https://placehold.co/1200x700?text=Dormitory'];
    }, [images]);

    useEffect(() => {
        if (!rootRef.current) {
            return;
        }

        const glide = new Glide(rootRef.current, {
            type: 'slider',
            startAt: 0,
            perView: 1,
            gap: 16,
            rewind: true,
            // autoplay: 3500,
            hoverpause: true,
            animationDuration: 550,
        });

        glide.mount();

        return () => {
            glide.destroy();
        };
    }, [safeImages]);

    return (
        <div ref={rootRef} className="glide text-center">
            <div className="glide__track" data-glide-el="track">
                <ul className="glide__slides">
                    {safeImages.map((src, index) => (
                        <li className="glide__slide" key={`${src}-${index}`}>
                            {/* <img
                                src={src}
                                alt={`Фото общежития ${index + 1}`}
                                className="h-130 w-full rounded-xl object-cover"
                                loading={index === 0 ? 'eager' : 'lazy'}
                            /> */}
                            <Image
                                src={src}
                                alt={`Фото общежития ${index + 1}`}
                                className="h-130 w-full rounded-xl object-fill"
                                loading={index === 0 ? 'eager' : 'lazy'}
                            />
                        </li>
                    ))}
                </ul>
            </div>

            <div className='text-center'>
                <div className="glide__arrows" data-glide-el="controls">
                    <Button variant='flat' className="glide__arrow glide__arrow--left" data-glide-dir="<">prev</Button>
                    <Button variant='flat' className="glide__arrow glide__arrow--right" data-glide-dir=">">next</Button>
                </div>
            </div>
        </div>
    )
}
