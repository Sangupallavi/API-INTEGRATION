// models/News.js
import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
  title: String,
  description: String,
  content: String,
  date: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('News', newsSchema);
