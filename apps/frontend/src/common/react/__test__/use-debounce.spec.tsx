import { useState } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useDebounce } from '../use-debounce.tsx'

describe('Use Debounce', () => {
    it('triggers the first call', async () => {
        render(<UseDebounceTestComponent obj={{ v: '1' }} />)
        fireEvent.click(await screen.findByTestId('the-button'))
        await waitFor(async () => {
            const elem = await screen.findByTestId('the-value')
            expect(elem.textContent).toEqual('1')
        })
    })

    it('keeps the same value when called twice in short timespan', async () => {
        const obj = { v: '1' }
        render(<UseDebounceTestComponent obj={obj} />)
        fireEvent.click(await screen.findByTestId('the-button'))
        obj.v = '2'
        fireEvent.click(await screen.findByTestId('the-button'))
        await waitFor(async () => {
            const elem = await screen.findByTestId('the-value')
            expect(elem.textContent).toEqual('2')
        })
    })
})

const UseDebounceTestComponent = ({ obj }: { obj: { v: string } }) => {
    const [value, setValue] = useState('')

    const d = useDebounce(() => setValue(obj.v))

    return (
        <>
            <button
                data-testid={'the-button'}
                onClick={() => {
                    d()
                }}
            >
                Click me
            </button>
            {value && <span data-testid={'the-value'}>{value}</span>}
        </>
    )
}
