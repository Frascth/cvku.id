
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Zap, Plus, X, Save } from 'lucide-react';
import { useResumeStore, Skill } from '../../store/useResumeStore';
import { useToast } from '@/hooks/use-toast';

export const SkillsForm: React.FC = () => {
  const { resumeData, addSkill, updateSkill, removeSkill } = useResumeStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  const handleAdd = (skill: Omit<Skill, 'id'>) => {
    addSkill(skill);
    setShowAddForm(false);
  };

  const handleSave = () => {
    toast({
      title: "Saved!",
      description: "Skills have been saved successfully.",
    });
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'Expert': return 'bg-green-100 text-green-800 border-green-200';
      case 'Advanced': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Beginner': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <span>Skills</span>
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
        <div className="flex flex-wrap gap-2">
          {resumeData.skills.map((skill) => (
            <Badge
              key={skill.id}
              variant="outline"
              className={`${getSkillLevelColor(skill.level)} flex items-center space-x-1 px-3 py-1.5`}
            >
              <span>{skill.name}</span>
              <span className="text-xs">({skill.level})</span>
              <button
                onClick={() => removeSkill(skill.id)}
                className="ml-1 hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
        
        {showAddForm && (
          <AddSkillForm
            onAdd={handleAdd}
            onCancel={() => setShowAddForm(false)}
          />
        )}
      </CardContent>
    </Card>
  );
};

interface AddSkillFormProps {
  onAdd: (skill: Omit<Skill, 'id'>) => void;
  onCancel: () => void;
}

const AddSkillForm: React.FC<AddSkillFormProps> = ({ onAdd, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    level: 'Intermediate' as Skill['level'],
  });

  const handleSubmit = () => {
    if (formData.name) {
      onAdd(formData);
      setFormData({ name: '', level: 'Intermediate' });
    }
  };

  return (
    <div className="p-4 border-2 border-dashed border-blue-200 rounded-lg space-y-3">
      <h4 className="font-medium text-gray-900">Add Skill</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label>Skill Name</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="JavaScript, React, etc."
          />
        </div>
        <div>
          <Label>Proficiency Level</Label>
          <Select
            value={formData.level}
            onValueChange={(value) => setFormData({ ...formData, level: value as Skill['level'] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
              <SelectItem value="Expert">Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <Button onClick={handleSubmit} size="sm">Add Skill</Button>
        <Button onClick={onCancel} variant="outline" size="sm">Cancel</Button>
      </div>
    </div>
  );
};
