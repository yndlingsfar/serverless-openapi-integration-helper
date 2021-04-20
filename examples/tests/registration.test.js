import {getOutput} from 'serverless-plugin-test-helper';
import axios from 'axios';

axios.defaults.adapter = require('axios/lib/adapters/http'); //Todo

const URL = getOutput('GatewayUrl');
test('request validation on registration', async () => {
    expect.assertions(1);
    const {status} = await axios.post(URL + '/api/v1/user',
        {
            "email_address": "test@example.com",
            "password": "someStrongPassword#"
        },
        {
            headers: {
                'Content-Type': 'application/json',
            }
        });
    expect(status).toEqual(201);
});

test('request validation on registration (invalid request)', async () => {
    expect.assertions(1);
    try {
        await axios.post(URL + '/api/v1/user',
            {
                "email": "test@example.com"
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
    } catch (e) {
        expect(e.response).toMatchObject({
            statusText: 'Bad Request',
            status: 400
        });
    }
});
