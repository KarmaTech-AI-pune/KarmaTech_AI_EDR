import axios from 'axios';
import { InwardRow, OutwardRow } from './correspondenceApi';

// Base URL for the correspondence API
const BASE_URL = '/api/correspondence';

// Function to directly update an inward row using PUT
export const directUpdateInward = async (id: string | number, data: any): Promise<InwardRow> => {
    console.log('DIRECT UPDATE INWARD - Using PUT method');
    console.log('ID:', id);
    console.log('Data:', data);
    
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
    
    try {
        // Make a direct PUT request to the API
        const response = await axios.put(
            `${BASE_URL}/inward/${id}`,
            data,
            { headers }
        );
        
        console.log('DIRECT UPDATE INWARD - Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('DIRECT UPDATE INWARD - Error:', error);
        throw error;
    }
};

// Function to directly update an outward row using PUT
export const directUpdateOutward = async (id: string | number, data: any): Promise<OutwardRow> => {
    console.log('DIRECT UPDATE OUTWARD - Using PUT method');
    console.log('ID:', id);
    console.log('Data:', data);
    
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
    
    try {
        // Make a direct PUT request to the API
        const response = await axios.put(
            `${BASE_URL}/outward/${id}`,
            data,
            { headers }
        );
        
        console.log('DIRECT UPDATE OUTWARD - Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('DIRECT UPDATE OUTWARD - Error:', error);
        throw error;
    }
};
