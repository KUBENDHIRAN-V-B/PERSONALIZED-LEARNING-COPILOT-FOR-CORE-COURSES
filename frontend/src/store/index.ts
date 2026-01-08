import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './slices/chatSlice';
import learningReducer from './slices/learningSlice';

const store = configureStore({
  reducer: {
    chat: chatReducer,
    learning: learningReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
