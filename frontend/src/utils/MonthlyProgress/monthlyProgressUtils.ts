import { MonthlyReviewModel } from '../../models/monthlyReviewModel';

export const formatCurrency = (value: number | null): string => {
    if (value == null) return '';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};

export const getCurrentMonthYear = (): string => {
    const date = new Date();
    return `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
};

export const calculateTotals = (data: MonthlyReviewModel): MonthlyReviewModel => {
    const newData = { ...data };

    // Calculate fees total
    const net = newData.fees.net || 0;
    const tax = newData.fees.serviceTax || 0;
    newData.fees.total = net + (net * tax / 100);

    // Calculate budget costs subtotal
    const budgetOdcs = newData.budgetCosts.odcs || 0;
    const budgetStaff = newData.budgetCosts.staff || 0;
    newData.budgetCosts.subTotal = budgetOdcs + budgetStaff;

    // Calculate actual costs subtotal
    const actualOdcs = newData.actualCosts.odcs || 0;
    const actualStaff = newData.actualCosts.staff || 0;
    newData.actualCosts.subtotal = actualOdcs + actualStaff;

    // Calculate costs to complete subtotal
    const ctcOdcs = newData.costsToComplete.odcs || 0;
    const ctcStaff = newData.costsToComplete.staff || 0;
    newData.costsToComplete.subtotal = ctcOdcs + ctcStaff;

    // Calculate total EAC estimate
    newData.totalEACEstimate = newData.actualCosts.subtotal + newData.costsToComplete.subtotal;

    // Calculate gross profit percentage
    if (newData.fees.total > 0) {
        newData.grossProfitPercentage = ((newData.fees.total - newData.totalEACEstimate) / newData.fees.total) * 100;
    }

    return newData;
};

export const setNestedValue = (obj: any, path: string, value: any): void => {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in current)) {
            current[keys[i]] = {};
        }
        current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
};
