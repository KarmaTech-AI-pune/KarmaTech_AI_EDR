const textFieldStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 1,
    backgroundColor: '#fff',
    '&:hover fieldset': {
      borderColor: 'primary.main',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'primary.main',
    },
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
