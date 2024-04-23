import { DemoIndicatorGateway } from "../../adapters/secondaries/in-memory/demo-indicator.gateway.ts";

export const indicatorGatewayFactory = () => {
  return new DemoIndicatorGateway()
}
