import { configureStore } from '@reduxjs/toolkit';
import gbcstore from './features';

const store = configureStore({
    reducer: {
        gbcStore: gbcstore,
    },
});
export type RootState = ReturnType<
    typeof store.getState
>;
export default store;
