import { configureStore } from '@reduxjs/toolkit'

import toastifyReducer from './features/toastify/toastifySlice'
export const makeStore = () => {
    return configureStore({
        reducer: {
            toastify: toastifyReducer
        }
    })
}
export const store = makeStore();
export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']