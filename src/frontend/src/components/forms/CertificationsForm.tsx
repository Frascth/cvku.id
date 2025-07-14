
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Award, Plus, Trash2, Save } from 'lucide-react';
import { useResumeStore, Certification } from '../../store/useResumeStore';
import { useToast } from '@/hooks/use-toast';

export const CertificationsForm: React.FC = () => {
  const { resumeData, addCertification, updateCertification, removeCertification } = useResumeStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  const handleAdd = (certification: Omit<Certification, 'id'>) => {
    addCertification(certification);
    setShowAddForm(false);
  };

  const handleSave = () => {
    toast({
      title: "Saved!",
      description: "Certifications have been saved successfully.",
    });
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-blue-600" />
            <span>Certifications</span>
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
        {resumeData.certifications.map((certification) => (
          <CertificationItem
            key={certification.id}
            certification={certification}
            onUpdate={(updates) => updateCertification(certification.id, updates)}
            onRemove={() => removeCertification(certification.id)}
          />
        ))}
        
        {showAddForm && (
          <AddCertificationForm
            onAdd={handleAdd}
            onCancel={() => setShowAddForm(false)}
          />
        )}
      </CardContent>
    </Card>
  );
};

interface CertificationItemProps {
  certification: Certification;
  onUpdate: (updates: Partial<Certification>) => void;
  onRemove: () => void;
}

const CertificationItem: React.FC<CertificationItemProps> = ({ certification, onUpdate, onRemove }) => {
  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Certification Name</Label>
              <Input
                value={certification.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
              />
            </div>
            <div>
              <Label>Issuing Organization</Label>
              <Input
                value={certification.issuer}
                onChange={(e) => onUpdate({ issuer: e.target.value })}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Issue Date</Label>
              <Input
                type="month"
                value={certification.date}
                onChange={(e) => onUpdate({ date: e.target.value })}
              />
            </div>
            <div>
              <Label>Credential ID (Optional)</Label>
              <Input
                value={certification.credentialId || ''}
                onChange={(e) => onUpdate({ credentialId: e.target.value })}
                placeholder="Certificate ID or URL"
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

interface AddCertificationFormProps {
  onAdd: (certification: Omit<Certification, 'id'>) => void;
  onCancel: () => void;
}

const AddCertificationForm: React.FC<AddCertificationFormProps> = ({ onAdd, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    issuer: '',
    date: '',
    credentialId: '',
  });

  const handleSubmit = () => {
    if (formData.name && formData.issuer) {
      onAdd(formData);
    }
  };

  return (
    <div className="p-4 border-2 border-dashed border-blue-200 rounded-lg space-y-3">
      <h4 className="font-medium text-gray-900">Add Certification</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label>Certification Name</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="AWS Certified Developer"
          />
        </div>
        <div>
          <Label>Issuing Organization</Label>
          <Input
            value={formData.issuer}
            onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
            placeholder="Amazon Web Services"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label>Issue Date</Label>
          <Input
            type="month"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
        <div>
          <Label>Credential ID (Optional)</Label>
          <Input
            value={formData.credentialId}
            onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
            placeholder="Certificate ID or URL"
          />
        </div>
      </div>
      
      <div className="flex space-x-2">
        <Button onClick={handleSubmit} size="sm">Add Certification</Button>
        <Button onClick={onCancel} variant="outline" size="sm">Cancel</Button>
      </div>
    </div>
  );
};
