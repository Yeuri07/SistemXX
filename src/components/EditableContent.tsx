import React, { useState } from 'react';
import { Edit2, Check, X } from 'lucide-react';

interface EditableContentProps {
  content: string;
  onSave: (newContent: string) => Promise<void>;
  type: 'post' | 'comment';
}

const EditableContent: React.FC<EditableContentProps> = ({ content, onSave, type }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (editedContent.trim() === content) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      await onSave(editedContent);
      setIsEditing(false);
    } catch (error) {
      console.error(`Error updating ${type}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="group relative">
        <p className="mb-2">{content}</p>
        <button
          onClick={() => setIsEditing(true)}
          className="absolute top-0 right-0 p-1 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <textarea
        value={editedContent}
        onChange={(e) => setEditedContent(e.target.value)}
        className="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={3}
        disabled={isLoading}
      />
      <div className="flex justify-end space-x-2">
        <button
          onClick={handleCancel}
          className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-full"
          disabled={isLoading}
        >
          <X className="w-4 h-4" />
        </button>
        <button
          onClick={handleSave}
          className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-full"
          disabled={isLoading}
        >
          <Check className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default EditableContent;