
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, setDoc, query, orderBy, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';

const COLLEGE_ID = 'GEC';

export type EmployeeStatus = 'Active' | 'On-Leave' | 'Resigned' | 'Terminated';
export type SalaryType = 'Fixed' | 'Hourly' | 'Incentive-Based';

// Main Employee Interface
export interface Employee {
  id: string;
  fullName: string;
  employeeId: string;
  email: string;
  phone: string;
  departmentId: string;
  designationId: string;
  dateOfJoining: number; // Storing as timestamp
  status: EmployeeStatus;
  salaryType: SalaryType;
  salaryAmount: number;
}

// Data for Firestore (omits id, converts date)
type EmployeeFirestoreData = Omit<Employee, 'id' | 'dateOfJoining'> & {
    dateOfJoining: any; 
}

// Add a new employee
export const addEmployee = async (data: Omit<Employee, 'id'>) => {
  try {
    const employeesCollectionRef = collection(db, 'colleges', COLLEGE_ID, 'employees');
    const employeeData = {
        ...data,
        dateOfJoining: Timestamp.fromMillis(data.dateOfJoining),
    };
    await addDoc(employeesCollectionRef, employeeData);
  } catch (e) {
    console.error("Error adding employee: ", e);
    throw new Error('Failed to create employee record.');
  }
};

// Get all employees
export const getEmployees = async (): Promise<Employee[]> => {
  try {
    const employeesCollectionRef = collection(db, 'colleges', COLLEGE_ID, 'employees');
    const q = query(employeesCollectionRef, orderBy('fullName', 'asc'));
    const querySnapshot = await getDocs(q);
    const employees: Employee[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      employees.push({
        id: doc.id,
        ...data,
        dateOfJoining: data.dateOfJoining.toMillis(), 
      } as Employee);
    });
    return employees;
  } catch (e) {
    console.error("Error fetching employees: ", e);
    throw new Error('Failed to fetch employees.');
  }
};

// Update an existing employee
export const updateEmployee = async (employeeId: string, data: Partial<Omit<Employee, 'id'>>) => {
  try {
    const employeeRef = doc(db, 'colleges', COLLEGE_ID, 'employees', employeeId);
    // Handle date conversion if it's being updated
    const updateData = data.dateOfJoining 
      ? { ...data, dateOfJoining: Timestamp.fromMillis(data.dateOfJoining) } 
      : data;
    await updateDoc(employeeRef, updateData);
  } catch (e) {
    console.error("Error updating employee: ", e);
    throw new Error('Failed to update employee record.');
  }
};

// Delete an employee
export const deleteEmployee = async (employeeId: string) => {
  try {
    const employeeRef = doc(db, 'colleges', COLLEGE_ID, 'employees', employeeId);
    await deleteDoc(employeeRef);
  } catch (e) {
    console.error("Error deleting employee: ", e);
    throw new Error('Failed to delete employee record.');
  }
};
