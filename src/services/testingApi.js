import api from './api';

export const testingApi = {
    getScenarios: (scenario_type, extraParams = {}) => {
        return api.get('/testing/scenarios', {
            params: { scenario_type, ...extraParams }
        });
    },
    getCompliance: (difficulty, extraParams = {}) => {
        return api.get('/testing/compliance', {
            params: { difficulty, ...extraParams }
        });
    },
    analyze: (payload) => {
        return api.post('/analyze', payload);
    },
    validate: () => {
        return api.get('/testing/validate');
    },
    batchEmotionTest: () => {
        return api.post('/testing/batch/emotions');
    },
    batchComplianceTest: () => {
        return api.post('/testing/batch/compliance');
    },
};

export default testingApi;
