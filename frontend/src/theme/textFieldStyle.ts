import { SxProps } from '@mui/material';

const textFieldStyle: SxProps = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 1,
    backgroundColor: '#fff',
    '&:hover fieldset': {
      borderColor: '#1869DA',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1869DA',
    }
  },
  // Hide number input arrows
  '& input[type=number]': {
    '-moz-appearance': 'textfield',
  },
  '& input[type=number]::-webkit-outer-spin-button': {
    '-webkit-appearance': 'none',
    margin: 0,
  },
  '& input[type=number]::-webkit-inner-spin-button': {
    '-webkit-appearance': 'none',
    margin: 0,
  }
};

export default textFieldStyle;
