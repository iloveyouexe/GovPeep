import { Agency } from '../types/types.ts';

export const filterAgencies = (agencies: Agency[], query: string): Agency[] => {
    return agencies.filter((agency) =>
        agency["Agency Name"].toLowerCase().includes(query.toLowerCase())
    );
};

export const toggleIndex = (currentIndex: number | null, targetIndex: number): number | null => {
    return currentIndex === targetIndex ? null : targetIndex;
};

export const validateFOIAForm = (reason: string): boolean => {
    return reason.trim().length > 0;
};
