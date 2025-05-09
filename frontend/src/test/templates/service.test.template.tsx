import { ServiceNamePlaceholder } from '../../services/ServiceNamePlaceholder';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

const mockAxios = new MockAdapter(axios);

describe('ServiceNamePlaceholder Service', () => {
  afterEach(() => {
    mockAxios.reset();
  });

  describe('Method: methodNamePlaceholder', () => {
    it('formats request correctly', async () => {
      // TODO: Test request formatting if applicable
    });

    it('handles successful response', async () => {
      const mockResponseData = { key: 'value' };
      mockAxios.onGet('apiEndpointPlaceholder').reply(200, mockResponseData);

      const response = await ServiceNamePlaceholder.methodNamePlaceholder(); // or with params
      expect(response).toEqual(mockResponseData);
    });

    it('handles error response', async () => {
      mockAxios.onGet('apiEndpointPlaceholder').reply(400);

      await expect(ServiceNamePlaceholder.methodNamePlaceholder()).rejects.toThrow();
    });
  });
});
