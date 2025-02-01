import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interface for Role
interface IRole {
  id: string;
  name: string;
}

// Interface for User document
export interface IUser extends Document {
  id: string;
  userName: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  roles: IRole[];
  isConsultant: boolean;
  standardRate: number;
}

// Role schema matching frontend Role type
const roleSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true }
});

// User schema matching frontend AuthUser interface
const userSchema = new Schema({
  id: { type: String, required: true },
  userName: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  avatar: { type: String },
  roles: [roleSchema],
  isConsultant: { type: Boolean },
  standardRate: { type: Number }
});

// Seed data matching the frontend dummy users
const seedData = [
  {
    id: "usr1",
    name: "Admin User",
    userName: "admin",
    email: "admin@example.com",
    password: "password",
    roles: [{ id: 'admin', name: 'Admin' }]
  },
  {
    id: "usr2",
    name: "Manasi Bapat",
    userName: "PM1",
    email: "PM1@example.com",
    password: "password",
    roles: [{ id: 'project_manager', name: 'Project Manager' }]
  },
  {
    id: "usr3",
    name: "Salaiddin Ahemad",
    userName: "PM2",
    email: "PM2@example.com",
    password: "password",
    roles: [{ id: 'project_manager', name: 'Project Manager' }]
  },
  {
    id: "usr4",
    name: "Vidyadhar Vengurlekar",
    userName: "SPM1",
    email: "SPM1@example.com",
    password: "password",
    roles: [{ id: 'senior_project_manager', name: 'Senior Project Manager' }]
  },
  {
    id: "usr5",
    name: "Mandar Pimputkar",
    userName: "SPM2",
    email: "SPM2@example.com",
    password: "password",
    roles: [{ id: 'senior_project_manager', name: 'Senior Project Manager' }]
  },
  {
    id: "usr6",
    name: "Vidyadhar Sontakke",
    userName: "RM1",
    email: "RM1@example.com",
    password: "password",
    roles: [{ id: 'regional_manager', name: 'Regional Manager' }]
  },
  {
    id: "usr7",
    name: "Sanjay Ghuleria",
    userName: "RM2",
    email: "RM2@example.com",
    password: "password",
    roles: [{ id: 'regional_manager', name: 'Regional Manager' }]
  },
  {
    id: "usr8",
    name: "Pravin Bhawsar",
    userName: "BDM1",
    email: "BDM1@example.com",
    password: "password",
    roles: [{ id: 'business_dev_manager', name: 'Business Development Manager' }]
  },
  {
    id: "usr9",
    name: "Rohit Dembi",
    userName: "BDM2",
    email: "BDM2@example.com",
    password: "password",
    roles: [{ id: 'business_dev_manager', name: 'Business Development Manager' }]
  },
  {
    id: "usr10",
    name: "Nijam Ahemad",
    userName: "SME1",
    email: "SME1@example.com",
    password: "password",
    roles: [{ id: 'subject_matter_expert', name: 'Subject Matter Expert' }]
  },
  {
    id: "usr11",
    name: "Mnjunath Gowda",
    userName: "SME2",
    email: "SME2@example.com",
    password: "password",
    roles: [{ id: 'subject_matter_expert', name: 'Subject Matter Expert' }]
  },
  {
    id: "usr12",
    name: "Pradipto Sarkar",
    userName: "RM3",
    email: "RM3@example.com",
    password: "password",
    roles: [{ id: 'regional_manager', name: 'Regional Manager' }]
  },
  {
    id: "usr15",
    name: "Yogeshwar Gokhale",
    userName: "RD1",
    email: "RD1@example.com",
    password: "password",
    roles: [{ id: 'regional_director', name: 'Regional Director' }]
  },
  {
    id: "usr16",
    name: "Vidyadhar Sontakke",
    userName: "RD2",
    email: "RD2@example.com",
    password: "password",
    roles: [{ id: 'regional_director', name: 'Regional Director' }]
  }
];

const User = mongoose.model<IUser>('User', userSchema);

// Function to seed initial data
export const seedUsers = async () => {
  try {
    // Check if collection is empty
    const count = await User.countDocuments();
    if (count === 0) {
      // Hash passwords before seeding
      const hashedSeedData = await Promise.all(
        seedData.map(async (user) => ({
          ...user,
          password: await bcrypt.hash(user.password, 10)
        }))
      );
      await User.insertMany(hashedSeedData);
      console.log('Users seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

export { User };
