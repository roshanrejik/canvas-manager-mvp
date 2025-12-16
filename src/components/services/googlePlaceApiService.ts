export const googlePlaceApiKey = 'AIzaSyBHsrXboX_H0TwuqAn-E9gZCocpqXa7050';
export const googlePlaceMapApiJs = 'https://maps.googleapis.com/maps/api/js';
export const googlePlaceGeocodeJson =
    'https://maps.googleapis.com/maps/api/geocode/json';

export const initMapScript = (window: any) => {
    // if script already loaded
    if (window.google) {
        return Promise.resolve();
    }
    const src = `${googlePlaceMapApiJs}?key=${googlePlaceApiKey}&libraries=places`;
    return loadAsyncScript(src);
};

export const loadAsyncScript = (src: any) => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        Object.assign(script, {
            type: 'text/javascript',
            async: true,
            src
        });
        script.addEventListener('load', () => resolve(script));
        document.head.appendChild(script);
    });
};

export const googlePlaceApiSetFields = (ref: any, window: any) => {
    const autocomplete: any = new window.google.maps.places.Autocomplete(
        ref.current
    );
    autocomplete.setFields(['address_component', 'geometry']);
    autocomplete.setComponentRestrictions({ country: 'us' });
    return autocomplete;
};
