import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Zap, Plus, X, Save } from 'lucide-react';
import { useResumeStore, Skill, SkillLevel } from '../../store/useResumeStore';
import { useToast } from '@/hooks/use-toast';

export const SkillsForm: React.FC = () => {
  const resumeData = useResumeStore(s => s.resumeData);
  const addSkill = useResumeStore(s => s.addSkill);
  const removeSkill = useResumeStore(s => s.removeSkill);
  const saveAllSkills = useResumeStore(s => s.saveAllSkills);

  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  // === tetap pakai signature lamamu ===
  const handleAdd = (skill: Omit<Skill, 'id'>) => {
    // perbedaan KECIL: cast level -> SkillLevel biar cocok sama tipe di store
    addSkill({ name: skill.name, level: skill.level as SkillLevel });
    setShowAddForm(false);
  };

  const handleSaveAllSkills = async () => {
    try {
      toast({ title: 'Success', description: 'All skills have been saved.' });

      await saveAllSkills();
    } catch (error) {
      console.error('Failed to save skills:', error);
      toast({
        title: 'Error',
        description: (error as Error)?.message ?? 'An unknown error occurred.',
        variant: 'destructive',
      });
    }
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

  useEffect(() => {
    console.log(resumeData.skills);
  }, [resumeData.skills]);

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <span>Skills</span>
          </div>
          <div className="flex space-x-2">
            {/* tombol Save PERSIS seperti punyamu */}
            <Button onClick={handleSaveAllSkills} size="sm" variant="outline" className="flex items-center space-x-1">
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
        {/* 1. daftar skill (tanpa perubahan tampilan) */}
        {resumeData.skills.length > 0 && (
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
        )}

        {/* 2. placeholder kalau kosong */}
        {resumeData.skills.length === 0 && !showAddForm && (
          <p className="text-center text-gray-500 py-4">
            No skills added yet. Click "Add" to start.
          </p>
        )}

        {/* 3. form tambah (tanpa perubahan tampilan) */}
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
    // tetap string seperti punyamu
    level: 'Intermediate',
  });

  const handleSubmit = () => {
    // cast level di sini supaya nggak ganggu UI/markup
    onAdd({ name: formData.name, level: formData.level as SkillLevel });
    setFormData({ name: '', level: 'Intermediate' });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="p-4 border-2 border-dashed border-blue-200 rounded-lg space-y-3">
      <h4 className="font-medium text-gray-900">Add Skill</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label>Skill Name</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="JavaScript, React, etc."
            required
          />
        </div>
        <div>
          <Label>Proficiency Level</Label>
          <Select
            value={formData.level}
            onValueChange={(value) => setFormData({ ...formData, level: value })}
            required
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
        <Button type="submit" size="sm">Add Skill</Button>
        <Button onClick={onCancel} variant="outline" size="sm">Cancel</Button>
      </div>
    </form>
  );
};
