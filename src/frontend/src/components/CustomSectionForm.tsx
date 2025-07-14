
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';
import { useResumeStore } from '../store/useResumeStore';

interface CustomSectionItem {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  date?: string;
}

interface CustomSection {
  id: string;
  name: string;
  items: CustomSectionItem[];
}

export const CustomSectionForm: React.FC = () => {
  const { resumeData, addCustomSection, updateCustomSection, removeCustomSection } = useResumeStore();
  const [newSectionName, setNewSectionName] = useState('');
  const [showAddSection, setShowAddSection] = useState(false);

  const customSections = resumeData.customSections || [];

  const handleAddSection = () => {
    if (newSectionName.trim()) {
      addCustomSection({
        name: newSectionName.trim(),
        items: []
      });
      setNewSectionName('');
      setShowAddSection(false);
    }
  };

  const handleAddItem = (sectionId: string) => {
    const section = customSections.find(s => s.id === sectionId);
    if (section) {
      const newItem: CustomSectionItem = {
        id: Date.now().toString(),
        title: '',
        subtitle: '',
        description: '',
        date: ''
      };
      updateCustomSection(sectionId, {
        ...section,
        items: [...section.items, newItem]
      });
    }
  };

  const handleUpdateItem = (sectionId: string, itemId: string, updates: Partial<CustomSectionItem>) => {
    const section = customSections.find(s => s.id === sectionId);
    if (section) {
      const updatedItems = section.items.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      );
      updateCustomSection(sectionId, {
        ...section,
        items: updatedItems
      });
    }
  };

  const handleRemoveItem = (sectionId: string, itemId: string) => {
    const section = customSections.find(s => s.id === sectionId);
    if (section) {
      const updatedItems = section.items.filter(item => item.id !== itemId);
      updateCustomSection(sectionId, {
        ...section,
        items: updatedItems
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Custom Sections</h3>
        <Button
          onClick={() => setShowAddSection(true)}
          size="sm"
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Section</span>
        </Button>
      </div>

      {showAddSection && (
        <Card>
          <CardContent className="p-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Section name (e.g., Projects, Awards, Volunteering)"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSection()}
              />
              <Button onClick={handleAddSection} size="sm">Add</Button>
              <Button 
                onClick={() => {
                  setShowAddSection(false);
                  setNewSectionName('');
                }}
                variant="outline" 
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {customSections.map((section) => (
        <Card key={section.id}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center space-x-2">
                <GripVertical className="h-4 w-4 text-gray-400" />
                <span>{section.name}</span>
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleAddItem(section.id)}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => removeCustomSection(section.id)}
                  size="sm"
                  variant="destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {section.items.map((item) => (
              <Card key={item.id} className="bg-gray-50">
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`title-${item.id}`}>Title</Label>
                      <Input
                        id={`title-${item.id}`}
                        value={item.title}
                        onChange={(e) => handleUpdateItem(section.id, item.id, { title: e.target.value })}
                        placeholder="Item title"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`subtitle-${item.id}`}>Subtitle (Optional)</Label>
                      <Input
                        id={`subtitle-${item.id}`}
                        value={item.subtitle || ''}
                        onChange={(e) => handleUpdateItem(section.id, item.id, { subtitle: e.target.value })}
                        placeholder="Subtitle or organization"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={`date-${item.id}`}>Date (Optional)</Label>
                    <Input
                      id={`date-${item.id}`}
                      type="month"
                      value={item.date || ''}
                      onChange={(e) => handleUpdateItem(section.id, item.id, { date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`description-${item.id}`}>Description</Label>
                    <RichTextEditor
                      value={item.description}
                      onChange={(value) => handleUpdateItem(section.id, item.id, { description: value })}
                      placeholder="Describe this item..."
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleRemoveItem(section.id, item.id)}
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {section.items.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No items yet. Click the + button to add your first item.
              </p>
            )}
          </CardContent>
        </Card>
      ))}

      {customSections.length === 0 && !showAddSection && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 mb-4">
              Add custom sections like Projects, Awards, Volunteering, or any other relevant information.
            </p>
            <Button onClick={() => setShowAddSection(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Custom Section
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
