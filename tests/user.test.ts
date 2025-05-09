import http from 'http';
import { requestHandler } from '../src/api';
import { User } from '../src/models/user.model';

let server: http.Server;
const port = 3333;
const baseUrl = `http://localhost:${port}/api/users`;

beforeAll((done) => {
  server = http.createServer(requestHandler).listen(port, done);
});

afterAll((done) => {
  server.close(done);
});

describe('CRUD API scenarios: ', () => {
  let createdUserId: string;

  it('- Get all records with a GET api/users request (an empty array is expected)', async () => {
    const res = await fetch(baseUrl);
    const data = (await res.json()) as User[];

    expect(res.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(0);
  });

  it('- A new object is created by a POST api/users request (a response containing newly created record is expected)', async () => {
    const newUser = {
      username: 'UserName',
      age: 25,
      hobbies: ['reading'],
    };

    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    });

    const data = (await res.json()) as User;
    createdUserId = data.id;

    expect(res.status).toBe(201);
    expect(data).toMatchObject(newUser);
    expect(createdUserId).toBeDefined();
  });

  it('- With a GET api/users/{userId} request, we try to get the created record by its id (the created record is expected)', async () => {
    const res = await fetch(`${baseUrl}/${createdUserId}`);
    const data = (await res.json()) as User;

    expect(res.status).toBe(200);
    expect(data.id).toBe(createdUserId);
  });

  it('- We try to update the created record with a PUT api/users/{userId}request (a response is expected containing an updated object with the same id)', async () => {
    const updatedUser = {
      username: 'UserName Updated',
      age: 30,
      hobbies: ['writing'],
    };

    const res = await fetch(`${baseUrl}/${createdUserId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedUser),
    });

    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toMatchObject(updatedUser);
  });

  it('- With a DELETE api/users/{userId} request, we delete the created object by id (confirmation of successful deletion is expected)', async () => {
    const res = await fetch(`${baseUrl}/${createdUserId}`, {
      method: 'DELETE',
    });

    expect(res.status).toBe(204);
  });

  it('- With a GET api/users/{userId} request, we are trying to get a deleted object by id (expected answer is that there is no such object)', async () => {
    const res = await fetch(`${baseUrl}/${createdUserId}`);
    expect(res.status).toBe(404);
  });
});
