const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB (using local or you can use Atlas later)
mongoose.connect('mongodb://127.0.0.1:27017/campuscare')
.then(()=> console.log("MongoDB Connected for CampusCare"))
.catch(()=> console.log("MongoDB not running - backend will still start"));

// Complaint Model - matches your Student Portal form
const Complaint = mongoose.model('Complaint', {
  studentName: String,
  usn: String,
  department: String,
  complaintType: String,
  description: String,
  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now }
});

// Serve frontend files too
app.use(express.static(path.join(__dirname, '..')));

// API 1: Student submits complaint
app.post('/api/complaints', async (req,res)=>{
  try {
    const complaint = new Complaint(req.body);
    await complaint.save();
    res.json({ success: true, message: "Complaint Submitted!", id: complaint._id });
  } catch(e){ res.json({ success: false, error: e.message }) }
});

// API 2: Track complaint - get all
app.get('/api/complaints', async (req,res)=>{
  const all = await Complaint.find().sort({createdAt: -1});
  res.json(all);
});

// API 3: Admin updates status
app.put('/api/complaints/:id', async (req,res)=>{
  await Complaint.findByIdAndUpdate(req.params.id, { status: req.body.status });
  res.json({ success: true });
});

app.listen(5000, ()=> console.log("Backend running on http://localhost:5000"));