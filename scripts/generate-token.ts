import * as jwt from 'jsonwebtoken';
import { config } from 'dotenv';

// Load variables from .env
config();

const secret = process.env.JWT_SECRET;

if (!secret) {
  console.error('❌ JWT_SECRET is not defined in your .env file.');
  process.exit(1);
}

// You can customize this payload based on the user you want to simulate
const payload = {
  sub: 'user-123',
  email: 'test@example.com',
  roles: ['ADMIN'],
  permissions: ['health:read', 'integrations:write'], // Add permissions for testing
};

const token = jwt.sign(payload, secret, { expiresIn: '1h' });

console.log('✅ Generated JWT Token:\n');
console.log(token);
console.log('\n----------------------------------------');
console.log('Payload:', payload);
