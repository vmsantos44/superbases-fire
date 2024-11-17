import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc,
  doc,
  orderBy,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { TimeEntry } from '../types/timeEntry';

export async function getEmployees() {
  const employeesRef = collection(db, 'employees');
  const q = query(employeesRef, orderBy('name'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function getEmployeeById(id: string) {
  const docRef = doc(db, 'employees', id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  
  return {
    id: docSnap.id,
    ...docSnap.data()
  };
}

export async function getTimeEntries(employeeId: string) {
  const timeEntriesRef = collection(db, 'time_entries');
  const q = query(
    timeEntriesRef, 
    where('employee_id', '==', employeeId),
    orderBy('date', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date.toDate()
  }));
}

export async function clockIn(employeeId: string) {
  const now = new Date();
  const timeEntriesRef = collection(db, 'time_entries');
  
  const entry = await addDoc(timeEntriesRef, {
    employee_id: employeeId,
    date: Timestamp.fromDate(now),
    clock_in: now.toTimeString().split(' ')[0],
    status: 'regular',
    created_at: Timestamp.now(),
    updated_at: Timestamp.now()
  });

  return {
    id: entry.id,
    employee_id: employeeId,
    date: now,
    clock_in: now.toTimeString().split(' ')[0],
    status: 'regular'
  };
}

export async function clockOut(entryId: string) {
  const now = new Date();
  const clockOutTime = now.toTimeString().split(' ')[0];
  
  const entryRef = doc(db, 'time_entries', entryId);
  await updateDoc(entryRef, {
    clock_out: clockOutTime,
    updated_at: Timestamp.now()
  });

  return {
    id: entryId,
    clock_out: clockOutTime
  };
}

export async function uploadTimeEntries(entries: TimeEntry[]) {
  const batch = [];
  const timeEntriesRef = collection(db, 'time_entries');
  
  for (const entry of entries) {
    const timeEntryData = {
      ...entry,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
      date: Timestamp.fromDate(new Date(entry.entry_date))
    };
    
    batch.push(addDoc(timeEntriesRef, timeEntryData));
  }
  
  return Promise.all(batch);
}