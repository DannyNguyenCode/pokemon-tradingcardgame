import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Pokemon } from '@/lib/definitions'

export interface CardsState {
    data: Pokemon[],
    status: 'idle' | 'loading' | 'succeeded' | 'failed',
    error?: string
}
const initialState: CardsState = {
    data: [],
    status: 'idle',
};

export const cardsSlice = createSlice({
    name: 'cards',
    initialState,
    reducers: {
        loadAll(state, { payload }: PayloadAction<Pokemon[]>) {
            state.data = payload;
            state.status = 'succeeded'
        },

    }
})


export const { loadAll } = cardsSlice.actions
export default cardsSlice.reducer