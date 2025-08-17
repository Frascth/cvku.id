
import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, Plus, Trash2, Save } from 'lucide-react';
import { useResumeStore, Education } from '../../store/useResumeStore';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { createEducationHandler } from '@/lib/educationHandler';

export const EducationForm: React.FC = () => {
  const { resumeData, setEducation, addEducation, updateEducation, removeEducation } = useResumeStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();
  const { authClient } = useAuth();

  const educationHandler = useMemo(() => {
    if (authClient) {
      return createEducationHandler(authClient);
    }
    return null;
  }, [authClient]);

  useEffect(() => {
    const fetchEducation = async () => {
      try {
        const edus = await educationHandler.clientGetAll();

        setEducation(edus);
      } catch (error) {
        console.error("Failed to fetch educations", error);
      }
    };

    if (educationHandler) {
      fetchEducation();
    }
  }, [educationHandler, setEducation]);

  const handleAdd = async (experience: Omit<Education, 'id'>) => {
    try {
      const addedEducation = await educationHandler.clientAdd(experience);

      addEducation(addedEducation);

      setShowAddForm(false);

      toast({
        title: "Education Added",
        description: `${addedEducation.degree} added.`,
      });
    } catch (error) {
      console.error(error);

      toast({
        title: "An Error Occurred",
        description: "Something went wrong with the education service.",
        variant: "destructive",
      });
    }
  };

  const handleRemove = async (id: number) => {
    try {

      const isDeleted = await educationHandler.clientDeleteById(id);

      removeEducation(id);

      toast({
        title: isDeleted ? "Education Deleted" : "Failed to delete education",
        description: isDeleted
          ? "The selected education was successfully removed."
          : "It may have already been deleted or not found.",
        variant: isDeleted ? "default" : "destructive",
      });
    } catch (error) {
      console.error(error);

      toast({
        title: "An Error Occurred",
        description: "Something went wrong with the education service.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    try {
      const updatedEdus = await educationHandler.clientSave(resumeData.education);

      setEducation(updatedEdus);

      toast({
        title: "Saved!",
        description: "Education has been saved successfully.",
      });
    } catch (error) {
      console.error(error);

      toast({
        title: "An Error Occurred",
        description: "Something went wrong with the education service.",
        variant: "destructive",
      });
    }

  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <span>Education</span>
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
        {resumeData.education.length === 0 && !showAddForm && (
            <p className="text-gray-500 text-center py-4">No education added yet. Click "Add" to start.</p>
        )}

        {resumeData.education.map((education) => (
          <EducationItem
            key={education.id}
            education={education}
            onUpdate={(updates) => updateEducation(education.id, updates)}
            onRemove={() => handleRemove(education.id)}
          />
        ))}

        {showAddForm && (
          <AddEducationForm
            onAdd={handleAdd}
            onCancel={() => setShowAddForm(false)}
          />
        )}
      </CardContent>
    </Card>
  );
};

interface EducationItemProps {
  education: Education;
  onUpdate: (updates: Partial<Education>) => void;
  onRemove: () => void;
}

const EducationItem: React.FC<EducationItemProps> = ({ education, onUpdate, onRemove }) => {
  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Degree</Label>
              <Input
                value={education.degree}
                onChange={(e) => onUpdate({ degree: e.target.value })}
              />
            </div>
            <div>
              <Label>Institution</Label>
              <Input
                value={education.institution}
                onChange={(e) => onUpdate({ institution: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Graduation Date</Label>
              <Input
                type="month"
                value={education.graduationDate}
                onChange={(e) => onUpdate({ graduationDate: e.target.value })}
              />
            </div>
            <div>
              <Label>GPA (Optional)</Label>
              <Input
                value={education.gpa || ''}
                onChange={(e) => onUpdate({ gpa: e.target.value })}
                placeholder="3.8"
              />
            </div>
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

interface AddEducationFormProps {
  onAdd: (education: Omit<Education, 'id'>) => void;
  onCancel: () => void;
}

const AddEducationForm: React.FC<AddEducationFormProps> = ({ onAdd, onCancel }) => {
  const [formData, setFormData] = useState({
    degree: '',
    institution: '',
    graduationDate: '',
    gpa: '',
  });

  const handleSubmit = () => {
    if (formData.degree && formData.institution) {
      onAdd(formData);
    }
  };

  return (
    <div className="p-4 border-2 border-dashed border-blue-200 rounded-lg space-y-3">
      <h4 className="font-medium text-gray-900">Add Education</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label>Degree</Label>
          <Input
            value={formData.degree}
            onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
            placeholder="Bachelor of Science in Computer Science"
          />
        </div>
        <div>
          <Label>Institution</Label>
          <Input
            value={formData.institution}
            onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
            placeholder="University of California, Berkeley"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label>Graduation Date</Label>
          <Input
            type="month"
            value={formData.graduationDate}
            onChange={(e) => setFormData({ ...formData, graduationDate: e.target.value })}
          />
        </div>
        <div>
          <Label>GPA (Optional)</Label>
          <Input
            value={formData.gpa}
            onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
            placeholder="3.8"
          />
        </div>
      </div>

      <div className="flex space-x-2">
        <Button onClick={handleSubmit} size="sm">Add Education</Button>
        <Button onClick={onCancel} variant="outline" size="sm">Cancel</Button>
      </div>
    </div>
  );
};
