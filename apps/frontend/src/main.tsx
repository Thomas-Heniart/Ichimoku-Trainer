import App from './App'
import reportWebVitals from './reportWebVitals'
import { initReduxStore } from './common/store/reduxStore'
import { symbolGatewayFactory } from './features/display-ichimoku/config/dependencies/symbol-gateway.config'
import { Provider } from 'react-redux'
import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { indicatorGatewayFactory } from './features/display-ichimoku/config/dependencies/indicator-gateway.config.ts'
import { trainingDependencies } from './features/training/config/dependencies.ts'

const root = createRoot(document.getElementById('root') as HTMLElement)

const store = initReduxStore({
    symbolGateway: symbolGatewayFactory(),
    indicatorGateway: indicatorGatewayFactory(),
    ...trainingDependencies(),
})

root.render(
    <React.StrictMode>
        <Provider store={store}>
            <App />
        </Provider>
    </React.StrictMode>,
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
