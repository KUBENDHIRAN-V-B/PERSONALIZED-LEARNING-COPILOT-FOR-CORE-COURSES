import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Message {
  id: string;
  userMessage: string;
  aiResponse: string;
  timestamp: Date;
  difficulty: string;
}

interface ChatState {
  messages: Message[];
  currentConversationId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  messages: [],
  currentConversationId: null,
  isLoading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    setConversationId: (state, action: PayloadAction<string>) => {
      state.currentConversationId = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const { addMessage, setConversationId, setLoading, setError, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;
