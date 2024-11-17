import React from 'react';
import { Edit2, Trash2, Save } from 'lucide-react';
import { useTimesheetStore } from '../../store/timesheetStore';
import { TimeEntry } from '../../types/timeEntry';

interface TimesheetEntryProps {
  entry: TimeEntry;
}

export default function TimesheetEntry({ entry }: TimesheetEntryProps) {
  const { editingEntry, editForm, setEditingEntry, updateEditForm, saveEntry, deleteEntry } = useTimesheetStore();

  const isEditing = editingEntry === entry.id;

  const handleEdit = () => {
    setEditingEntry(entry.id);
  };

  const handleSave = () => {
    saveEntry(entry.id);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this entry?')) {
      deleteEntry(entry.id);
    }
  };

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">
            {entry.employee?.name}
          </div>
          <div className="text-sm text-gray-500">
            {entry.employee?.employee_id}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {new Date(entry.entry_date).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {isEditing ? (
          <input
            type="text"
            value={editForm.clock_in || ''}
            onChange={(e) => updateEditForm({ clock_in: e.target.value })}
            className="w-24 rounded-md border-gray-300"
          />
        ) : (
          entry.clock_in || '-'
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {isEditing ? (
          <input
            type="text"
            value={editForm.clock_out || ''}
            onChange={(e) => updateEditForm({ clock_out: e.target.value })}
            className="w-24 rounded-md border-gray-300"
          />
        ) : (
          entry.clock_out || '-'
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {isEditing ? (
          <input
            type="number"
            value={editForm.total_hours || 0}
            onChange={(e) => updateEditForm({ total_hours: Number(e.target.value) })}
            className="w-20 rounded-md border-gray-300"
          />
        ) : (
          entry.total_hours.toFixed(2)
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {isEditing ? (
          <input
            type="number"
            value={editForm.break_time || 0}
            onChange={(e) => updateEditForm({ break_time: Number(e.target.value) })}
            className="w-20 rounded-md border-gray-300"
          />
        ) : (
          entry.break_time.toFixed(2)
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          entry.status === 'regular'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {entry.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {isEditing ? (
          <input
            type="text"
            value={editForm.notes || ''}
            onChange={(e) => updateEditForm({ notes: e.target.value })}
            className="w-full rounded-md border-gray-300"
          />
        ) : (
          entry.notes || '-'
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex space-x-2">
          {isEditing ? (
            <button
              onClick={handleSave}
              className="text-green-600 hover:text-green-900"
            >
              <Save className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleEdit}
              className="text-blue-600 hover:text-blue-900"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-900"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}