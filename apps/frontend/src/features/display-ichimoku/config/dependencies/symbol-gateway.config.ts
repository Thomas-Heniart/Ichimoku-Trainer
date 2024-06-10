import { InMemorySymbolGateway } from '../../adapters/secondaries/in-memory/in-memory-symbol.gateway.ts'

export const symbolGatewayFactory = () => {
    const gateway = new InMemorySymbolGateway()
    gateway.symbols = ['AAPL', 'GLD', 'BTCUSD']
    return gateway
}
