const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uri = 'mongodb://localhost:27017/epilytix'; // Default from .env

async function seed() {
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  const users = db.collection('users');

  const ceoEmail = 'ibrahimrehan1230@gmail.com';
  const existing = await users.findOne({ email: ceoEmail.toLowerCase() });

  if (existing) {
    console.log('CEO already exists:', existing);
  } else {
    console.log('CEO not found. Creating one...');
    const passwordHash = await bcrypt.hash('EpilytixCEO@2024!', 10);
    await users.insertOne({
      email: ceoEmail.toLowerCase(),
      passwordHash,
      role: 'CEO',
      firstName: 'Ibraheem',
      lastName: 'Rehan',
      isActive: true,
      twoFactorEnabled: false,
      permissions: {
        canManageLeads: true,
        canViewAllLeads: true,
        canManageContent: true,
        canChat: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('CEO created successfully!');
  }

  await mongoose.disconnect();
}

seed().catch(console.error);
