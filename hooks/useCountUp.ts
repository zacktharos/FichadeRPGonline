import { useState, useEffect, useRef } from 'react';

export const useCountUp = (endValue: number, duration: number = 2000) => {
    const [count, setCount] = useState(endValue);
    const valueRef = useRef(endValue);

    useEffect(() => {
        const startValue = valueRef.current;
        const range = endValue - startValue;
        if (range === 0) {
            setCount(endValue);
            valueRef.current = endValue;
            return;
        };

        let startTime: number | null = null;

        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const currentCount = Math.floor(startValue + range * progress);
            setCount(currentCount);

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                setCount(endValue);
                valueRef.current = endValue;
            }
        };

        requestAnimationFrame(step);

        return () => {
            valueRef.current = endValue;
        };
    }, [endValue, duration]);

    return count;
};
