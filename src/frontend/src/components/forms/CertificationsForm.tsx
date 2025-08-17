// src/components/CertificationsForm.tsx

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Award, Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { useResumeStore, Certification } from '../../store/useResumeStore'; // Pastikan path benar
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth'; // <-- Menggunakan hook useAuth Anda

export const CertificationsForm: React.FC = () => {
  const {
    resumeData,
    certificationHandler,
    initializeHandlers,
    fetchCertifications,
    addCertification,
    updateCertification,
    removeCertification,
    saveAllCertifications,
  } = useResumeStore();

  const { authClient, isAuthenticated, isLoading: isAuthLoading } = useAuth(); // <-- Ambil dari useAuth

  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Mulai dengan true karena fetching diawal
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // --- useEffect: Inisialisasi Handler dan Fetch Data ---
  useEffect(() => {
    const initAndLoadCertifications = async () => {
      // Jika authClient belum siap atau pengguna belum terautentikasi
      if (isAuthLoading) {
        setIsLoading(true); // Tetap loading jika auth sedang loading
        return;
      }

      if (!isAuthenticated || !authClient) {
        setError("Please log in to manage certifications.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        // Inisialisasi handler HANYA jika belum terinisialisasi
        if (!certificationHandler) {
          initializeHandlers(authClient);
        }
        
        // Fetch data setelah handler terinisialisasi
        await fetchCertifications();

      } catch (err: any) {
        console.error("Failed to load certifications:", err);
        setError(err.message || "Failed to load certifications.");
      } finally {
        setIsLoading(false);
      }
    };

    // Panggil fungsi ini setiap kali authClient, isAuthenticated, atau isAuthLoading berubah
    // dan juga ketika handler dari store berubah.
    initAndLoadCertifications();
  }, [authClient, isAuthenticated, isAuthLoading, initializeHandlers, fetchCertifications, certificationHandler]);

  // --- Handlers ---
  const handleAdd = async (certification: Omit<Certification, 'id'>) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!isAuthenticated || !authClient) throw new Error("Not authenticated.");
      await addCertification(certification);
      setShowAddForm(false);
      toast({
        title: "Success!",
        description: "Certification added successfully.",
        variant: "default", // Ubah ke "default" jika "success" tidak didukung
      });
    } catch (err: any) {
      console.error("Failed to add certification:", err);
      setError(err.message || "Failed to add certification.");
      toast({
        title: "Error!",
        description: err.message || "Failed to add certification.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Certification>) => {
    setIsLoading(true);
    setError(null);
    try {
      await updateCertification(id, updates);
      toast({
        title: "Updated!",
        description: "Certification changes staged. Click Save All to commit.",
        variant: "default", // Ubah ke "default"
      });
    } catch (err: any) {
      console.error("Failed to update certification:", err);
      setError(err.message || "Failed to update certification.");
      toast({
        title: "Error!",
        description: err.message || "Failed to update certification.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!isAuthenticated || !authClient) throw new Error("Not authenticated.");
      await removeCertification(id);
      toast({
        title: "Deleted!",
        description: "Certification removed successfully.",
        variant: "default", // Ubah ke "default"
      });
    } catch (err: any) {
      console.error("Failed to remove certification:", err);
      setError(err.message || "Failed to remove certification.");
      toast({
        title: "Error!",
        description: err.message || "Failed to remove certification.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAllChanges = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!isAuthenticated || !authClient) throw new Error("Not authenticated.");
      await saveAllCertifications();
      toast({
        title: "Saved!",
        description: "All certifications have been saved successfully to the backend.",
        variant: "default", // Ubah ke "default"
      });
    } catch (err: any) {
      console.error("Failed to save all certifications:", err);
      setError(err.message || "Failed to save all certifications.");
      toast({
        title: "Error!",
        description: err.message || "Failed to save all certifications.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render UI ---
  // Tampilkan loading spinner jika autentikasi atau data sedang dimuat
  if (isAuthLoading || isLoading) {
    return (
      <Card className="animate-fade-in flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2">Loading certifications...</span>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-blue-600" />
            <span>Certifications</span>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-500 ml-2" />}
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={handleSaveAllChanges}
              size="sm"
              variant="outline"
              className="flex items-center space-x-1"
              disabled={isLoading || !isAuthenticated} // Disable jika loading atau tidak login
            >
              <Save className="w-4 h-4" />
              <span>Save </span>
            </Button>
            <Button
              onClick={() => setShowAddForm(true)}
              size="sm"
              variant="outline"
              className="flex items-center space-x-1"
              disabled={isLoading || !isAuthenticated} // Disable jika loading atau tidak login
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {!isAuthenticated && (
          <p className="text-orange-500 text-center py-4">
            You need to be logged in to manage your certifications.
          </p>
        )}

        {isAuthenticated && resumeData.certifications.length === 0 && !showAddForm && !isLoading && (
            <p className="text-gray-500 text-center py-4">No certifications added yet. Click "Add" to start.</p>
        )}

        {isAuthenticated && resumeData.certifications.map((certification) => (
          <CertificationItem
            key={certification.id}
            certification={certification}
            onUpdate={handleUpdate}
            onRemove={() => handleRemove(certification.id)}
            disabled={isLoading} // Disable input jika sedang loading
          />
        ))}
        
        {showAddForm && isAuthenticated && ( // Hanya tampilkan jika login
          <AddCertificationForm
            onAdd={handleAdd}
            onCancel={() => setShowAddForm(false)}
            isLoading={isLoading}
          />
        )}
      </CardContent>
    </Card>
  );
};

// --- CertificationItem Component ---
interface CertificationItemProps {
  certification: Certification;
  onUpdate: (id: string, updates: Partial<Certification>) => void; // Sudah diperbaiki dari diskusi sebelumnya
  onRemove: () => void;
  disabled: boolean; // Tambah prop disabled
}

const CertificationItem: React.FC<CertificationItemProps> = ({ certification, onUpdate, onRemove, disabled }) => {
  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Certification Name</Label>
              <Input
                value={certification.name}
                onChange={(e) => onUpdate(certification.id, { name: e.target.value })}
                disabled={disabled} // Disable input
              />
            </div>
            <div>
              <Label>Issuing Organization</Label>
              <Input
                value={certification.issuer}
                onChange={(e) => onUpdate(certification.id, { issuer: e.target.value })}
                disabled={disabled} // Disable input
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Issue Date</Label>
              <Input
                type="month"
                value={certification.date}
                onChange={(e) => onUpdate(certification.id, { date: e.target.value })}
                disabled={disabled} // Disable input
              />
            </div>
            <div>
              <Label>Credential ID (Optional)</Label>
              <Input
                value={certification.credentialId || ''}
                onChange={(e) => onUpdate(certification.id, { credentialId: e.target.value })}
                placeholder="Certificate ID or URL"
                disabled={disabled} // Disable input
              />
            </div>
          </div>
        </div>
        
        <Button
          onClick={onRemove}
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
          disabled={disabled} // Disable tombol
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

// --- AddCertificationForm Component ---
interface AddCertificationFormProps {
  onAdd: (certification: Omit<Certification, 'id'>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const AddCertificationForm: React.FC<AddCertificationFormProps> = ({ onAdd, onCancel, isLoading }) => {
  const [formData, setFormData] = useState<Omit<Certification, 'id'>>({
    name: '',
    issuer: '',
    date: '',
    credentialId: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.issuer && formData.date) {
      onAdd(formData);
    } else {
        alert("Please fill in all required fields (Name, Issuer, Date).");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-2 border-dashed border-blue-200 rounded-lg space-y-3">
      <h4 className="font-medium text-gray-900">Add Certification</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="add-name">Certification Name</Label>
          <Input
            id="add-name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="AWS Certified Developer"
            required
            disabled={isLoading} // Disable input
          />
        </div>
        <div>
          <Label htmlFor="add-issuer">Issuing Organization</Label>
          <Input
            id="add-issuer"
            value={formData.issuer}
            onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
            placeholder="Amazon Web Services"
            required
            disabled={isLoading} // Disable input
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="add-date">Issue Date</Label>
          <Input
            id="add-date"
            type="month"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
            disabled={isLoading} // Disable input
          />
        </div>
        <div>
          <Label htmlFor="add-credentialId">Credential ID (Optional)</Label>
          <Input
            id="add-credentialId"
            value={formData.credentialId}
            onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
            placeholder="Certificate ID or URL"
            disabled={isLoading} // Disable input
          />
        </div>
      </div>
      
      <div className="flex space-x-2">
        <Button type="submit" size="sm" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Add Certification
        </Button>
        <Button onClick={onCancel} variant="outline" size="sm" disabled={isLoading}>Cancel</Button>
      </div>
    </form>
  );
};