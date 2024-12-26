import { AuthUser } from "../../models";
import { UserRole } from "../../models";

const usersRawData = {
  "usr1" : {
    "name": "Admin User",
    "userName": "admin",
    "password": "password",
    "roles": [{ id: "role1", name: UserRole.Admin }],
    "standardRate": 100,
    "isConsultant": false
  },
  "usr2" : {
    "name": "Manasi Bapat",
    "userName": "PM1",
    "password": "password",
    "roles": [{ id: "role2", name: UserRole.ProjectManager }],
    "standardRate": 80,
    "isConsultant": true
  },
  "usr3" : {
    "name": "Salaiddin Ahemad",
    "userName": "PM2",
    "password": "password",
    "roles": [{ id: "role3", name: UserRole.ProjectManager }],
    "standardRate": 80,
    "isConsultant": true
  },
  "usr4" : {
    "name": "Vidyadhar Vengurlekar",
    "userName": "SPM1", 
    "password": "password",
    "roles": [{ id: "role4", name: UserRole.SeniorProjectManager }],
    "standardRate": 90,
    "isConsultant": false
  },
  "usr5" : {
    "name": "Mandar Pimputkar",
    "userName": "SPM2",
    "password": "password", 
    "roles": [{ id: "role5", name: UserRole.SeniorProjectManager }],
    "standardRate": 90,
    "isConsultant": false
  },
  "usr6" : {
    "name": "Vidyadhar Sontakke",
    "userName": "RM1",
    "password": "password",
    "roles": [{ id: "role6", name: UserRole.RegionalManager }],
    "standardRate": 95,
    "isConsultant": false
  },
  "usr7" : {
    "name": "Sanjay Ghuleria",
    "userName": "RM2",
    "password": "password",
    "roles": [{ id: "role7", name: UserRole.RegionalManager }],
    "standardRate": 95,
    "isConsultant": false
  },
  "usr8" : {
    "name": "Pravin Bhawsar",
    "userName": "BDM1",
    "password": "password",
    "roles": [{ id: "role8", name: UserRole.BusinessDevelopmentManager }],
    "standardRate": 85,
    "isConsultant": false
  },
  "usr9" : {
    "name": "Rohit Dembi",
    "userName": "BDM2",
    "password": "password",
    "roles": [{ id: "role9", name: UserRole.BusinessDevelopmentManager }],
    "standardRate": 85,
    "isConsultant": false
  },
  "usr10" : {
    "name": "Nijam Ahemad",
    "userName": "SME1",
    "password": "password",
    "roles": [{ id: "role10", name: UserRole.SubjectMatterExpert }],
    "standardRate": 75,
    "isConsultant": true
  },
  "usr11" : {
    "name": "Mnjunath Gowda",  
    "userName": "SME2",
    "password": "password",
    "roles": [{ id: "role11", name: UserRole.SubjectMatterExpert }],
    "standardRate": 75,
    "isConsultant": true
  },
  "usr12" : {
    "name": "Pradipto Sarkar",
    "userName": "RM3",
    "password": "password",
    "roles": [{ id: "role12", name: UserRole.RegionalManager }],
    "standardRate": 95,
    "isConsultant": false
  },
  "usr15" : {
    "name": "Yogeshwar Gokhale",
    "userName": "RD1",
    "password": "password",
    "roles": [{ id: "role15", name: UserRole.RegionalDirector }],
    "standardRate": 100,
    "isConsultant": false
  },
  "usr16" : {
    "name": "Vidyadhar Sontakke",
    "userName": "RD2",
    "password": "password",
    "roles": [{ id: "role16", name: UserRole.RegionalDirector }],
    "standardRate": 100,
    "isConsultant": false
  }
};

// Transform into typed array
export const users: AuthUser[] = Object.entries(usersRawData).map(([id, user]) => ({
  id,
  name: user.name,
  email: `${user.userName}@example.com`,
  userName: user.userName,
  password: user.password,
  roles: [...user.roles], // Create a new mutable array
  standardRate: user.standardRate,
  isConsultant: user.isConsultant,
  createdAt: new Date().toISOString(),
  lastLogin: null
}));

// Utility functions
export const getUserById = (id: string): AuthUser | undefined => {
  return users.find(user => user.id === id);
};

export const isAdmin = (user: AuthUser): boolean => {
  return user.roles.some(role => role.name === UserRole.Admin);
};
