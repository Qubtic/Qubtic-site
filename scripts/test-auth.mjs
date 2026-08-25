import { verifyAdminUserDb } from '../src/lib/store.ts';

async function testAuth() {
  console.log('Testing verifyAdminUserDb function...');

  const user1 = await verifyAdminUserDb('rafikabir05.rk@gmail.com', 's#Z3@GhyLBa9aeD');
  console.log('User 1 (Rafi):', user1 ? `✓ SUCCESS: ${user1.name} (${user1.email})` : '❌ FAILED');

  const user2 = await verifyAdminUserDb('mainulsunvi@gmail.com', 's#Z3@GhyLBa9aeD');
  console.log('User 2 (Sunvi):', user2 ? `✓ SUCCESS: ${user2.name} (${user2.email})` : '❌ FAILED');

  const invalid = await verifyAdminUserDb('wrong@example.com', 'invalid');
  console.log('Invalid User Test:', invalid === null ? '✓ REJECTED AS EXPECTED' : '❌ ERROR: ACCEPTED INVALID');
}

testAuth().catch(console.error);
