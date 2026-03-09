declare module '@glidejs/glide' {
    type GlideOptions = {
        type?: 'slider' | 'carousel';
        startAt?: number;
        perView?: number;
        gap?: number;
        rewind?: boolean;
        autoplay?: number | false;
        hoverpause?: boolean;
        animationDuration?: number;
    };

    export default class Glide {
        constructor(selector: string | Element, options?: GlideOptions);
        mount(): Glide;
        destroy(): void;
    }
}
