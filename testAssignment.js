const mongoose = require('mongoose');
require('dotenv').config();

const Task = require('./src/models/Task');
const User = require('./src/models/User');

async function testAssignment() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find an admin user
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('❌ No admin found');
      return;
    }
    console.log('👑 Admin found:', admin.name);

    // Find a regular user
    const user = await User.findOne({ role: 'user' });
    if (!user) {
      console.log('❌ No regular user found');
      return;
    }
    console.log('👤 User found:', user.name);

    // Find an unassigned task
    const task = await Task.findOne({ assignedTo: { $exists: false } });
    if (!task) {
      console.log('❌ No unassigned task found');
      return;
    }
    console.log('📋 Task found:', task.title);

    // Test assignment
    console.log('🔄 Testing assignment...');
    task.assignedTo = user._id;
    task.assignedBy = admin._id;
    await task.save();

    console.log('✅ Assignment successful!');
    console.log(`📋 Task "${task.title}" assigned to ${user.name}`);

    // Verify assignment
    const updatedTask = await Task.findById(task._id);
    console.log('🔍 Verification:');
    console.log('   assignedTo:', updatedTask.assignedTo);
    console.log('   assignedBy:', updatedTask.assignedBy);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

testAssignment();
