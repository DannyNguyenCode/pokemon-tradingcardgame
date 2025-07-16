import { createSlice, PayloadAction } from '@reduxjs/toolkit'
export interface ToastifyState {
    message: string
}

const initialState: ToastifyState = {
    message: ''
}

export const toastifySlice = createSlice({
    name: 'toastify',
    initialState,
    reducers: {
        loadToastifyState(state, { payload }: PayloadAction<string>) {
            state.message = payload
        },
        clearToastifyState(state) {
            state = initialState
        }
    }

})

export const { loadToastifyState, clearToastifyState } = toastifySlice.actions
export default toastifySlice.reducer