import { toastifySlice } from "@/lib/features/toastify/toastifySlice";
import { makeStore } from "@/lib/store";
import { loadToastifyState, clearToastifyState } from "@/lib/features/toastify/toastifySlice";
import { configureStore } from "@reduxjs/toolkit";

describe("toastifySlice", () => {
    let store = makeStore();

    beforeEach(() => {
        store = configureStore({
            reducer: {
                toastify: toastifySlice.reducer,
            },
        });
    });

    it("should return the initial state", () => {
        const state = store.getState().toastify;
        expect(state.message).toBe("");
    });

    it("should handle loadToastifyState", () => {
        const message = "Test message";
        store.dispatch(loadToastifyState(message));
        const state = store.getState().toastify;
        expect(state.message).toBe(message);
    });

    it("should handle clearToastifyState", () => {
        store.dispatch(loadToastifyState("Test message"));
        store.dispatch(clearToastifyState());
        const state = store.getState().toastify;
        expect(state.message).toBe("");
    });
});