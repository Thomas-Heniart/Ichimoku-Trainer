import { AppState, initReduxStore, ReduxStore } from '../../../../../store/reduxStore'
import { retrieveSymbols } from '../retrieve-symbols'
import { InMemorySymbolGateway } from '../../../../adapters/secondaries/in-memory/in-memory-symbol.gateway'

describe('Retrieve symbols', () => {
    let store: ReduxStore
    let initialState: AppState
    let symbolGateway: InMemorySymbolGateway

    beforeEach(() => {
        symbolGateway = new InMemorySymbolGateway()
        store = initReduxStore({
            symbolGateway,
        })
        initialState = store.getState()
    })

    it('has no symbols initially', () => {
        expect(store.getState()).toEqual({
            ...initialState,
            symbols: {},
        })
    })

    it('retrieves symbols', async () => {
        symbolGateway.symbols = ['BTCUSD', 'AAPL', 'GOLD']

        await store.dispatch(retrieveSymbols())

        expect(store.getState()).toEqual({
            ...initialState,
            symbols: {
                all: ['BTCUSD', 'AAPL', 'GOLD'],
            },
        })
    })
})
