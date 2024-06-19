import { useRef } from 'react'

export const useDebounce = <F extends (...args: never[]) => void>(func: F, timeout = 300) => {
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    return (...args: Parameters<F>) => {
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
            func(...args)
        }, timeout)
    }
}
