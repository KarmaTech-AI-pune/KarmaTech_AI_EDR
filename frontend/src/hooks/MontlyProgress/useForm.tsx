import { createContext, useContext, useState } from "react";
import { tab } from "../../components/forms/MonthlyProgresscomponents/MonthlyProgressForm";

interface FormControlsContextProps{
   currentPageIndex: number;
   previousPageIndex: number;
   hasNextPage: boolean;
   hasPreviousPage: boolean;
   isFinalPage: boolean;
   handleNext: () => void;
   handleBack: () => void;
   setCurrentPageIndex: (index: number) => void;
   setPreviousPageIndex: (index: number) => void;
   setpage: (index: number) => void;
}

const FormControlsContext = createContext<FormControlsContextProps | undefined>(undefined);

interface FormControlsProviderProps{
    children: React.ReactNode;
    tabs: tab[];
}

export const FormControlsProvider: React.FC<FormControlsProviderProps> = ({ children, tabs }) => {
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [previousPageIndex, setPreviousPageIndex] = useState(0);

    const handleNext = () => {
        setPreviousPageIndex(currentPageIndex);
        setCurrentPageIndex((prev) => Math.min(tabs.length - 1, prev + 1));
    };

    const handleBack = () => {
        setPreviousPageIndex(currentPageIndex);
        setCurrentPageIndex((prev) => Math.max(0, prev - 1));
    };

    // Define setpage as an alias to setCurrentPageIndex for backward compatibility
    const setpage = setCurrentPageIndex;

    const hasNextPage = currentPageIndex < tabs.length - 1;
    const hasPreviousPage = currentPageIndex > 0;
    const isFinalPage = currentPageIndex === tabs.length - 1;

    return (
        <FormControlsContext.Provider value={{
            currentPageIndex,
            previousPageIndex,
            hasNextPage,
            hasPreviousPage,
            isFinalPage,
            handleNext,
            handleBack,
            setCurrentPageIndex,
            setPreviousPageIndex,
            setpage
        }}>
            {children}
        </FormControlsContext.Provider>
    );
}


export const useFormControls = (): FormControlsContextProps => {
    const context = useContext(FormControlsContext);
    if (!context) {
        throw new Error('useFormControls must be used within a FormControlsProvider');
    }
    return context;
};
