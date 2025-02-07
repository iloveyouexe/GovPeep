import { Agency } from '../types/types.ts';

export function filterAgencies(agencies: Agency[], searchQuery: string) {
    if (!searchQuery.trim()) return agencies;

    return agencies.filter((agency) =>
        agency.Name.toLowerCase().includes(searchQuery.toLowerCase())
    );
}


export const toggleIndex = (currentIndex: number | null, targetIndex: number): number | null => {
    return currentIndex === targetIndex ? null : targetIndex;
};

export const validateFOIAForm = (reason: string): boolean => {
    return reason.trim().length > 0;
};
