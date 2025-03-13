import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  details: { type: String },
  clientName: { type: String, required: true },
  projectMangerId: { type: String, required: true },
  office: { type: String, required: true },
  projectNo: { type: String, required: true },
  typeOfJob: { type: String, required: true },
  seniorProjectMangerId: { type: String, required: true },
  sector: { type: String, required: true },
  region: { type: String, required: true },
  typeOfClient: { type: String, required: true },
  estimatedCost: { type: Number, required: true },
  feeType: { type: String, required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  currency: { type: String, required: true },
  regionalManagerID: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add seed data
const seedData = [
  {
    name: "City Water Supply Upgrade",
    details: "City needs water supply upgrade",
    clientName: "Metropolis Municipality",
    projectMangerId: "usr1",
    office: "Mumbai",
    projectNo: "abc-123",
    typeOfJob: "Water Supply",
    seniorProjectMangerId: "usr1",
    sector: "Water",
    region: "West",
    typeOfClient: "Government",
    estimatedCost: 5000000,
    feeType: "Lumpsum",
    startDate: new Date("2023-01-01"),
    endDate: new Date("2024-12-31"),
    currency: "INR",
    regionalManagerID: "usr6"
  },
  {
    name: "Rural Sanitation Initiative",
    details: "Comprehensive sanitation upgrade for rural areas",
    clientName: "State Rural Development Dept",
    projectMangerId: "usr2",
    office: "Delhi",
    projectNo: "san-456",
    typeOfJob: "Sanitation Infrastructure",
    seniorProjectMangerId: "usr4",
    sector: "Sanitation",
    region: "North",
    typeOfClient: "Government",
    estimatedCost: 2000000,
    feeType: "Itemrate",
    startDate: new Date("2023-03-15"),
    endDate: new Date("2025-03-14"),
    currency: "INR",
    regionalManagerID: "usr7"
  }
];

const Project = mongoose.model('Project', projectSchema);

// Function to seed initial data
export const seedProjects = async () => {
  try {
    // Check if collection is empty
    const count = await Project.countDocuments();
    if (count === 0) {
      await Project.insertMany(seedData);
      console.log('Projects seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding projects:', error);
  }
};

export { Project };
