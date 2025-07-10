import { configureStore } from '@reduxjs/toolkit'
import cardsReducer from './features/cards/cardsSlice'
import toastifyReducer from './features/toastify/toastifySlice'
export const makeStore = () => {
    return configureStore({
        reducer: {
            cards: cardsReducer,
            toasify: toastifyReducer
        }
    })
}
export const store = makeStore();
export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']