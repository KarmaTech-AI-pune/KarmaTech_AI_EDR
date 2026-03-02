import { createContext, useContext, ReactNode } from 'react';

interface FormDisabledContextType {
  isFormDisabled: boolean;
}

const FormDisabledContext = createContext<FormDisabledContextType>({
  isFormDisabled: false,
});

export const FormDisabledProvider = ({ 
  children, 
  disabled 
}: { 
  children: ReactNode; 
  disabled: boolean;
}) => {
  return (
    <FormDisabledContext.Provider value={{ isFormDisabled: disabled }}>
      {children}
    </FormDisabledContext.Provider>
  );
};

export const useFormDisabled = () => {
  const context = useContext(FormDisabledContext);
  return context;
};

export default FormDisabledContext;
