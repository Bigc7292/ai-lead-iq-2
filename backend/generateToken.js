const { generateToken } = require('./src/middleware/authMiddleware');

/**
 * JWT Token Generator Utility
 * Generate JWT tokens for testing API endpoints
 * 
 * Usage: node generateToken.js [role]
 * Example: node generateToken.js admin
 */

// Ensure JWT_SECRET is set
if (!process.env.JWT_SECRET) {
    console.error('❌ Error: JWT_SECRET environment variable not set');
    console.log('📝 Please set JWT_SECRET in your .env file');
    process.exit(1);
}

const role = process.argv[2] || 'agent';
const validRoles = ['admin', 'manager', 'agent'];

if (!validRoles.includes(role)) {
    console.error(`❌ Invalid role: ${role}`);
    console.log(`Valid roles: ${validRoles.join(', ')}`);
    process.exit(1);
}

// Generate test user payload
const payload = {
    id: `test-${role}-${Date.now()}`,
    email: `${role}@test.example.com`,
    role: role
};

const token = generateToken(payload, '24h');

console.log('\n✅ JWT Token Generated Successfully!\n');
console.log('User Details:');
console.log(`  ID: ${payload.id}`);
console.log(`  Email: ${payload.email}`);
console.log(`  Role: ${payload.role}`);
console.log(`\n🔑 Token (expires in 24h):\n`);
console.log(token);
console.log('\n📋 Use in API requests as:');
console.log(`  Authorization: Bearer ${token}\n`);
console.log('💡 Test with curl:');
console.log(`  curl -H "Authorization: Bearer ${token}" http://localhost:3000/api/leads\n`);
