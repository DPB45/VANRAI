// One-off migration: lowercase every stored user email.
// Usage (from /backend):  node scripts/lowercaseEmails.js
// Safe to re-run. It refuses to touch any address that would collide with
// another account once lowercased, and lists those so you can resolve them by hand.
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/userModel.js';

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const users = await User.find({}).select('email');
  const byLower = new Map();
  users.forEach((u) => {
    const key = u.email.toLowerCase().trim();
    byLower.set(key, [...(byLower.get(key) || []), u]);
  });

  let updated = 0;
  const collisions = [];
  for (const [lower, group] of byLower) {
    if (group.length > 1) { collisions.push(group.map((u) => u.email)); continue; }
    const [u] = group;
    if (u.email !== lower) {
      await User.updateOne({ _id: u._id }, { $set: { email: lower } });
      updated += 1;
    }
  }
  console.log(`Lowercased ${updated} email(s).`);
  if (collisions.length) {
    console.log('Left untouched (would collide with another account):');
    collisions.forEach((g) => console.log('  ', g.join('  <->  ')));
  }
  await mongoose.disconnect();
};

run().catch((e) => { console.error(e); process.exit(1); });
