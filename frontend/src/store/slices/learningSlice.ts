import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LearningState {
  profile: any | null;
  masteryScores: { [key: string]: number };
  learningPath: any | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: LearningState = {
  profile: null,
  masteryScores: {},
  learningPath: null,
  isLoading: false,
  error: null,
};

const learningSlice = createSlice({
  name: 'learning',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<any>) => {
      state.profile = action.payload;
    },
    setMasteryScores: (state, action: PayloadAction<{ [key: string]: number }>) => {
      state.masteryScores = action.payload;
    },
    setLearningPath: (state, action: PayloadAction<any>) => {
      state.learningPath = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setProfile, setMasteryScores, setLearningPath, setLoading, setError } = learningSlice.actions;
export default learningSlice.reducer;
