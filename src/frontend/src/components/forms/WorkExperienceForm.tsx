
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Briefcase, Plus, Trash2, Save } from 'lucide-react';
import { useResumeStore, WorkExperience } from '../../store/useResumeStore';
import { useToast } from '@/hooks/use-toast';

export const WorkExperienceForm: React.FC = () => {
  const { resumeData, addWorkExperience, updateWorkExperience, removeWorkExperience } = useResumeStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  const handleAdd = (experience: Omit<WorkExperience, 'id'>) => {
    addWorkExperience(experience);
    setShowAddForm(false);
  };

  const handleSave = () => {
    toast({
      title: "Saved!",
      description: "Work experience has been saved successfully.",
    });
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            <span>Work Experience</span>
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleSave} size="sm" variant="outline" className="flex items-center space-x-1">
              <Save className="w-4 h-4" />
              <span>Save</span>
            </Button>
            <Button
              onClick={() => setShowAddForm(true)}
              size="sm"
              variant="outline"
              className="flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {resumeData.workExperience.map((experience) => (
          <ExperienceItem
            key={experience.id}
            experience={experience}
            onUpdate={(updates) => updateWorkExperience(experience.id, updates)}
            onRemove={() => removeWorkExperience(experience.id)}
          />
        ))}
        
        {showAddForm && (
          <AddExperienceForm
            onAdd={handleAdd}
            onCancel={() => setShowAddForm(false)}
          />
        )}
      </CardContent>
    </Card>
  );
};

interface ExperienceItemProps {
  experience: WorkExperience;
  onUpdate: (updates: Partial<WorkExperience>) => void;
  onRemove: () => void;
}

const ExperienceItem: React.FC<ExperienceItemProps> = ({ experience, onUpdate, onRemove }) => {
  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Job Title</Label>
              <Input
                value={experience.jobTitle}
                onChange={(e) => onUpdate({ jobTitle: e.target.value })}
              />
            </div>
            <div>
              <Label>Company</Label>
              <Input
                value={experience.company}
                onChange={(e) => onUpdate({ company: e.target.value })}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <Label>Start Date</Label>
              <Input
                type="month"
                value={experience.startDate}
                onChange={(e) => onUpdate({ startDate: e.target.value })}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="month"
                value={experience.endDate}
                onChange={(e) => onUpdate({ endDate: e.target.value })}
                disabled={experience.current}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`current-${experience.id}`}
                checked={experience.current}
                onCheckedChange={(checked) => onUpdate({ current: !!checked })}
              />
              <Label htmlFor={`current-${experience.id}`}>Current</Label>
            </div>
          </div>
          
          <div>
            <Label>Description</Label>
            <Textarea
              value={experience.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              rows={3}
            />
          </div>
        </div>
        
        <Button
          onClick={onRemove}
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

interface AddExperienceFormProps {
  onAdd: (experience: Omit<WorkExperience, 'id'>) => void;
  onCancel: () => void;
}

const AddExperienceForm: React.FC<AddExperienceFormProps> = ({ onAdd, onCancel }) => {
  const [formData, setFormData] = useState({
    jobTitle: '',
    company: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
  });

  const handleSubmit = () => {
    if (formData.jobTitle && formData.company) {
      onAdd(formData);
    }
  };

  return (
    <div className="p-4 border-2 border-dashed border-blue-200 rounded-lg space-y-3">
      <h4 className="font-medium text-gray-900">Add Work Experience</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label>Job Title</Label>
          <Input
            value={formData.jobTitle}
            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
            placeholder="Software Engineer"
          />
        </div>
        <div>
          <Label>Company</Label>
          <Input
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            placeholder="Tech Corp"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <div>
          <Label>Start Date</Label>
          <Input
            type="month"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
        </div>
        <div>
          <Label>End Date</Label>
          <Input
            type="month"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            disabled={formData.current}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={formData.current}
            onCheckedChange={(checked) => setFormData({ ...formData, current: !!checked })}
          />
          <Label>Current</Label>
        </div>
      </div>
      
      <div>
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          placeholder="Describe your role and achievements..."
        />
      </div>
      
      <div className="flex space-x-2">
        <Button onClick={handleSubmit} size="sm">Add Experience</Button>
        <Button onClick={onCancel} variant="outline" size="sm">Cancel</Button>
      </div>
    </div>
  );
};
