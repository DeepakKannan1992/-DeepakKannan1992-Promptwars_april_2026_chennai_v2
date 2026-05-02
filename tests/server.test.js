const request = require('supertest');
const app = require('../server');

describe('Team Board API', () => {
    it('should fetch all messages', async () => {
        const res = await request(app).get('/api/messages');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].author).toBe('System');
    });

    it('should post a new message successfully', async () => {
        const res = await request(app)
            .post('/api/messages')
            .send({
                author: 'TestUser',
                text: 'Hello from tests!'
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.author).toBe('TestUser');
        expect(res.body.text).toBe('Hello from tests!');
    });

    it('should reject posts with missing text', async () => {
        const res = await request(app)
            .post('/api/messages')
            .send({ author: 'TestUser' }); 
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error');
    });

    it('should reject posts with missing author', async () => {
        const res = await request(app)
            .post('/api/messages')
            .send({ text: 'Some text' }); 
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error');
    });
});
