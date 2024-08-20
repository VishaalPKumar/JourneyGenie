const walkabilityPreferenceMap = [
    {
        value: 0,
        label: 'Not Important',
    },
    {
        value: 1,
        label: 'Somewhat Important',
    },
    {
        value: 2,
        label: 'Very Important',
    },
    {
        value: 3,
        label: 'Extremely Important',
    },
];


const weatherPreferenceMap = [
    {
        value: 'cold',
        label: 'Cold',
    },
    {
        value: 'warm',
        label: 'Warm',
    },
    {
        value: 'hot',
        label: 'Hot',
    }
];

const employmentPreferenceMap = [
    {
        value: 'unemployed',
        label: 'Unemployed',
    },
    {
        value: 'employed',
        label: 'Employed',
    },
    {
        value: 'indifferent',
        label: 'Indifferent',
    }
];

const publicTransportPreferenceMap = [
    {
        value: 'important',
        label: 'Important',
    },
    {
        value: 'indifferent',
        label: 'Indifferent',
    }
];

const diversityPreferenceMap = [
    {
        value: 'similar',
        label: 'Similar',
    },
    {
        value: 'different',
        label: 'Different',
    },
    {
        value: 'indifferent',
        label: 'Indifferent',
    }
];

const roomTypePreferenceMap = [
    {
        value: 0,
        label: 'Entire home/apt',
    },
    {
        value: 1,
        label: 'Private room',
    },
    {
        value: 2,
        label: 'Shared room',
    },
    {
        value: 3,
        label: 'Hotel room',
    }
];

export { walkabilityPreferenceMap, weatherPreferenceMap, employmentPreferenceMap, publicTransportPreferenceMap, diversityPreferenceMap, roomTypePreferenceMap };
