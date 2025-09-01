import { createTheme } from '@mui/material/styles';
import textFieldStyle from './textFieldStyle';

// Define your color palette
const theme = createTheme({
  palette: {
    primary: {
      main: '#1869DA', // A shade of blue
    },
    secondary: {
      main: '#FFC107', // A shade of yellow
    },
    background: {
      default: '#f4f6f8',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#555555',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: textFieldStyle,
      },
    },
  },
});

export default theme;
