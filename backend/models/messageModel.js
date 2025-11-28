import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
  },
  phone: {
    type: String,
    required: false,
  },
  subject: {
    type: String,
    required: [true, 'Please provide a subject'],
  },
  message: {
    type: String,
    required: [true, 'Please provide a message'],
  },
}, {
  timestamps: true,
});

const Message = mongoose.model('Message', messageSchema);

export default Message;