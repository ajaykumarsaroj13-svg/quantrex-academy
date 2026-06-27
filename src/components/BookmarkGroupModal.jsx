import React, { useState } from 'react';
import X from 'lucide-react/dist/esm/icons/x';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Bookmark from 'lucide-react/dist/esm/icons/bookmark';

export default function BookmarkGroupModal({ 
  isOpen, 
  onClose, 
  groups, 
  currentGroups = [], 
  onSave, 
  onCreateGroup 
}) {
  const [selectedGroups, setSelectedGroups] = useState(currentGroups);
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const toggleGroup = (group) => {
    setSelectedGroups(prev => 
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    );
  };

  const handleSave = () => {
    onSave(selectedGroups);
    onClose();
  };

  const handleCreate = () => {
    if (newGroupName.trim()) {
      onCreateGroup(newGroupName.trim());
      setSelectedGroups(prev => [...prev, newGroupName.trim()]);
      setNewGroupName('');
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-blue-500" />
            Save to Bookmark Group
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto max-h-[50vh]">
          {groups.length === 0 && !isCreating ? (
            <div className="text-center py-6 text-gray-500 text-sm">
              No bookmark groups yet. Create one to organize your questions!
            </div>
          ) : (
            <div className="space-y-2">
              {groups.map(group => (
                <label key={group} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    checked={selectedGroups.includes(group)}
                    onChange={() => toggleGroup(group)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{group}</span>
                </label>
              ))}
            </div>
          )}

          {isCreating ? (
            <div className="mt-4 p-3 border border-blue-100 bg-blue-50/50 rounded-lg">
              <input 
                type="text"
                autoFocus
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name..."
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2 bg-white"
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
              <div className="flex gap-2 justify-end">
                <button 
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreate}
                  disabled={!newGroupName.trim()}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsCreating(true)}
              className="mt-4 flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-200 rounded-lg text-sm font-medium text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create New Group
            </button>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3 justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/30 rounded-lg transition-colors"
          >
            Save Bookmark
          </button>
        </div>
      </div>
    </div>
  );
}
