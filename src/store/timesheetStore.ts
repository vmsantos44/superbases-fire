import { create } from 'zustand';
import { collection, query, getDocs, where, orderBy, doc, updateDoc, deleteDoc, Timestamp, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { TimeEntry } from '../types/timeEntry';

interface TimesheetState {
  entries: (TimeEntry & { employee?: { name: string; employee_id: string } })[];
  loading: boolean;
  error: string | null;
  startDate: string;
  endDate: string;
  selectedEmployee: string;
  editingEntry: string | null;
  editForm: Partial<TimeEntry>;
  setDateRange: (startDate: string, endDate: string) => void;
  setSelectedEmployee: (employeeId: string) => void;
  fetchEntries: () => Promise<void>;
  setEditingEntry: (entryId: string | null) => void;
  updateEditForm: (updates: Partial<TimeEntry>) => void;
  saveEntry: (entryId: string) => Promise<void>;
  deleteEntry: (entryId: string) => Promise<void>;
}

export const useTimesheetStore = create<TimesheetState>((set, get) => ({
  entries: [],
  loading: false,
  error: null,
  startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  selectedEmployee: '',
  editingEntry: null,
  editForm: {},

  setDateRange: (startDate, endDate) => {
    set({ startDate, endDate });
  },

  setSelectedEmployee: (employeeId) => {
    set({ selectedEmployee: employeeId });
  },

  fetchEntries: async () => {
    const { startDate, endDate, selectedEmployee } = get();
    
    try {
      set({ loading: true, error: null });

      const timeEntriesRef = collection(db, 'time_entries');
      let q;

      const startDateTime = new Date(startDate);
      startDateTime.setHours(0, 0, 0, 0);
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);

      if (selectedEmployee) {
        q = query(
          timeEntriesRef,
          where('employee_id', '==', selectedEmployee),
          where('entry_date', '>=', startDateTime),
          where('entry_date', '<=', endDateTime),
          orderBy('entry_date', 'desc')
        );
      } else {
        q = query(
          timeEntriesRef,
          where('entry_date', '>=', startDateTime),
          where('entry_date', '<=', endDateTime),
          orderBy('entry_date', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      
      // Get unique employee IDs from entries
      const employeeIds = new Set(querySnapshot.docs.map(doc => doc.data().employee_id));
      
      // Fetch employee details
      const employeeDetails = new Map();
      for (const employeeId of employeeIds) {
        const employeeDoc = await getDoc(doc(db, 'employees', employeeId));
        if (employeeDoc.exists()) {
          employeeDetails.set(employeeId, {
            name: employeeDoc.data().name,
            employee_id: employeeDoc.data().employee_id
          });
        }
      }

      // Combine time entries with employee details
      const entriesData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          entry_date: data.entry_date.toDate(),
          employee: employeeDetails.get(data.employee_id)
        };
      });

      set({ entries: entriesData, loading: false });
    } catch (err: any) {
      console.error('Error fetching time entries:', err);
      set({ error: err.message, loading: false });
    }
  },

  setEditingEntry: (entryId) => {
    if (!entryId) {
      set({ editingEntry: null, editForm: {} });
      return;
    }

    const entry = get().entries.find(e => e.id === entryId);
    if (entry) {
      set({
        editingEntry: entryId,
        editForm: {
          clock_in: entry.clock_in,
          clock_out: entry.clock_out,
          total_hours: entry.total_hours,
          break_time: entry.break_time,
          overtime_hours: entry.overtime_hours,
          notes: entry.notes
        }
      });
    }
  },

  updateEditForm: (updates) => {
    set(state => ({
      editForm: { ...state.editForm, ...updates }
    }));
  },

  saveEntry: async (entryId) => {
    try {
      set({ loading: true, error: null });
      const { editForm } = get();
      
      const entryRef = doc(db, 'time_entries', entryId);
      await updateDoc(entryRef, {
        ...editForm,
        updated_at: Timestamp.now()
      });

      set({ editingEntry: null, editForm: {} });
      await get().fetchEntries();
    } catch (err: any) {
      console.error('Error updating entry:', err);
      set({ error: err.message, loading: false });
    }
  },

  deleteEntry: async (entryId) => {
    try {
      set({ loading: true, error: null });
      await deleteDoc(doc(db, 'time_entries', entryId));
      await get().fetchEntries();
    } catch (err: any) {
      console.error('Error deleting entry:', err);
      set({ error: err.message, loading: false });
    }
  }
}));