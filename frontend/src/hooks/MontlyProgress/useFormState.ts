import { useState, useCallback } from 'react';
import { MonthlyReviewModel, initialFormState } from '../../models/monthlyReviewModel';
import { calculateTotals, setNestedValue } from '../../utils/MonthlyProgress/monthlyProgressUtils';

interface FormState {
    data: MonthlyReviewModel;
    isLoading: boolean;
    showSuccess: boolean;
}

export const useFormState = () => {
    const [state, setState] = useState<FormState>({
        data: {
            ...initialFormState,
            changeOrders: {
                proposed: [],
                submitted: [],
                approved: []
            },
            lastMonthActions: [...initialFormState.lastMonthActions],
            currentMonthActions: [...initialFormState.currentMonthActions]
        },
        isLoading: false,
        showSuccess: false
    });

    const updateFormData = useCallback((path: string, value: any) => {
        setState(prevState => {
            const newData = { ...prevState.data };
            setNestedValue(newData, path, value);
            
            return {
                ...prevState,
                data: calculateTotals(newData)
            };
        });
    }, []);

    const setLoading = useCallback((loading: boolean) => {
        setState(prev => ({ ...prev, isLoading: loading }));
    }, []);

    const setShowSuccess = useCallback((show: boolean) => {
        setState(prev => ({ ...prev, showSuccess: show }));
    }, []);

    return {
        ...state,
        updateFormData,
        setLoading,
        setShowSuccess
    };
};
