import { HttpIndicatorGateway } from '../adapters/secondaries/gateways/http-indicator.gateway.ts'

export const indicatorGatewayFactory = () => {
    return new HttpIndicatorGateway()
}
