import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { toggleTheme, setDarkMode } from '../store/slices/themeSlice';

export function useTheme() {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const dispatch = useDispatch();
  
  return {
    isDarkMode,
    toggleTheme: () => dispatch(toggleTheme()),
    setDarkMode: (value: boolean) => dispatch(setDarkMode(value))
  };
}
