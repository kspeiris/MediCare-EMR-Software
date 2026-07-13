export type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  nic: string;
  dob: string;
  age: number;
  gender: 'Male' | 'Female';
  bloodGroup: string;
  phone: string;
  email: string;
  address: string;
  allergies: string[];
  medicalHistory: string;
  lastVisit: string;
};

export type Medicine = {
  id: string;
  name: string;
  genericName: string;
  batchNo: string;
  stock: number;
  expiryDate: string;
  status: 'Adequate' | 'Low Stock' | 'Expiring';
};
