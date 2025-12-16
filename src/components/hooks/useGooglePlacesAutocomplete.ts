'use client';
import { useEffect, useRef } from 'react';
import {
    googlePlaceApiSetFields,
    initMapScript
} from '../services/googlePlaceApiService';

const useGooglePlacesAutocomplete = (onChangeCallback: Function) => {
    const physicalAddressRef = useRef<any>('');

    useEffect(() => {
        const onChangePhysicalAddress = (autocomplete: any) => {
            const place = autocomplete.getPlace();
            onChangeCallback(place);
        };

        const initPhysicalAddressAutocomplete = () => {
            if (!physicalAddressRef.current) return;
            const autocomplete = googlePlaceApiSetFields(
                physicalAddressRef,
                window
            );
            autocomplete.addListener('place_changed', () =>
                onChangePhysicalAddress(autocomplete)
            );

            // Handle keyboard events
            physicalAddressRef.current.addEventListener('keydown', (event: any) => {
                if (event.key === 'Enter') {
                    // Prevent default form submission
                    event.preventDefault();
                }
            });
        };

        initMapScript(window).then(() => initPhysicalAddressAutocomplete());

        return () => {
            // Cleanup function to remove event listener or any other cleanup
        };
    }, [onChangeCallback]);

    return physicalAddressRef;
};

export default useGooglePlacesAutocomplete;
