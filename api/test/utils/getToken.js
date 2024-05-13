import request from 'supertest';
import app from 'app';

export default function getToken({ username, password }) {
  return request(app)
    .post('/api/graphql')
    .send({
      query: `
        mutation {
          localUserLogin(
            username: "${username}",
            password: "${password}"
          ) {
            token
          }
        }
      `
    })
    .then(res => ({
      Authorization: `Bearer ${res.body.data.localUserLogin.token}`
    }));
}
