import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true
  },
  country: {
    type: String,
    default: 'Unknown'
  },
  city: {
    type: String,
    default: 'Unknown'
  },
  email: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: 'Unknown'
  },
  cookiesAccepted: {
    type: Boolean,
    default: false
  },
  visitedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create index for better query performance
visitorSchema.index({ country: 1 });
visitorSchema.index({ visitedAt: -1 });
visitorSchema.index({ ip: 1 });
visitorSchema.index({ cookiesAccepted: 1 });

// Prevent duplicate visitors from same IP within 24 hours
visitorSchema.index({ 
  ip: 1, 
  visitedAt: -1 
});

export default mongoose.models.Visitor || mongoose.model('Visitor', visitorSchema);