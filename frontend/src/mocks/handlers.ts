import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/some-data', () => {
    return HttpResponse.json({ message: 'Success' });
  }),
];
