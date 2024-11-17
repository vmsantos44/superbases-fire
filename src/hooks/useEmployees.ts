import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useEmployees() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const employeesRef = collection(db, 'employees');
      const q = query(employeesRef, orderBy('name'));
      const snapshot = await getDocs(q);
      
      const employeesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setEmployees(employeesData);
      setError(null);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return { employees, loading, error, refetchEmployees: fetchEmployees };
}

export function useEmployee(id: string) {
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchEmployee() {
      if (!id) return;
      
      try {
        setLoading(true);
        const docRef = doc(db, 'employees', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setEmployee({
            id: docSnap.id,
            ...docSnap.data()
          });
          setError(null);
        } else {
          throw new Error('Employee not found');
        }
      } catch (err) {
        console.error('Error fetching employee:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchEmployee();
  }, [id]);

  return { employee, loading, error };
}