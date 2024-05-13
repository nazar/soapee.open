import request from 'supertest';
import app from 'app';

export default function client(query, { variables, headers }) {
  const req = request(app).post('/api/graphql');

  headers && req.set(headers);

  return req
    .send({ query, variables })
    .then(res => res.body);
}
