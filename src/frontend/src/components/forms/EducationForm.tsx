import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  GraduationCap,
  Plus,
  Trash2,
  Save,
  Wand2,
  ListEnd,
} from "lucide-react";
import { useResumeStore, Education } from "../../store/useResumeStore";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { createEducationHandler } from "@/lib/educationHandler";
import { Textarea } from "../ui/textarea";
import { isBackendId } from "@/lib/utils";

export const EducationForm: React.FC = () => {
  const {
    resumeData,
    setEducation,
    addEducation,
    updateEducation,
    updateEducationId,
    removeEducation,
    educationHandler,
  } = useResumeStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();
  const handleAdd = async (edu: Omit<Education, "id">) => {
    try {
      const lid = crypto.randomUUID();

      addEducation({
        ...edu,
        lid: lid,
        id: crypto.randomUUID(),
      });

      toast({
        title: "Education Added",
        description: `${edu.degree} added.`,
      });

      setShowAddForm(false);

      const addedEducation = await educationHandler.clientAdd(lid, edu);

      updateEducationId(lid, addedEducation.id);
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
      removeEducation(id);

      toast({
        title: "Education Deleted",
        description: "The selected education was successfully removed.",
        variant: "default",
      });

      await educationHandler.clientDeleteById(id);
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
      toast({
        title: "Saved!",
        description: "Education has been saved successfully.",
      });

      await educationHandler.clientSave(resumeData.education);
    } catch (error) {
      console.error(error);

      toast({
        title: "An Error Occurred",
        description: "Something went wrong with the education service.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateAiDescription = async (
    degree: string
  ): Promise<string> => {
    try {
      const result = await educationHandler.clientGenerateAiDesc(degree);

      toast({
        title: "Description Generated!",
        description:
          "Your AI-generated description is ready for review and customization.",
      });

      let formatted = ``;
      result.forEach((desc) => {
        formatted += `- ${desc}\n`;
      });

      return formatted;
    } catch (error) {
      toast({
        title: "An Error Occured",
        description: "Something went wrong with the education service.",
        variant: "destructive",
      });

      return "";
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
            <Button
              onClick={handleSave}
              size="sm"
              variant="outline"
              className="flex items-center space-x-1"
            >
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
          <p className="text-gray-500 text-center py-4">
            No education added yet. Click "Add" to start.
          </p>
        )}

        {resumeData.education.map((education) => (
          <EducationItem
            key={education.id}
            education={education}
            onUpdate={(updates) => updateEducation(education.id, updates)}
            onRemove={() => handleRemove(education.id)}
            onGenerateAiDesc={handleGenerateAiDescription}
          />
        ))}

        {showAddForm && (
          <AddEducationForm
            onAdd={handleAdd}
            onCancel={() => setShowAddForm(false)}
            onGenerateAiDesc={handleGenerateAiDescription}
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
  onGenerateAiDesc: (jobTitle: string) => Promise<string>;
}

const EducationItem: React.FC<EducationItemProps> = ({
  education,
  onUpdate,
  onRemove,
  onGenerateAiDesc,
}) => {
  const [isAiGeneratingDesc, setIsAiGeneratingDesc] = useState(false);

  const [isCanGenerateAiDesc, setIsCanGenerateAiDesc] = useState(false);

  useEffect(() => {
    const isCanGenerate = !!education.degree;

    setIsCanGenerateAiDesc(isCanGenerate);
  }, [education]);

  const handleGenerateAiDesc = async () => {
    setIsAiGeneratingDesc(true);

    const aiDesc = await onGenerateAiDesc(education.degree);

    const updatedDesc = education.description + aiDesc;

    onUpdate({ description: updatedDesc });

    setIsAiGeneratingDesc(false);
  };

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
                value={education.gpa || ""}
                onChange={(e) => onUpdate({ gpa: e.target.value })}
                placeholder="3.8"
              />
            </div>
          </div>

          <div className="flex justify-end align-middle">
            <Button
              onClick={handleGenerateAiDesc}
              disabled={isAiGeneratingDesc || !isCanGenerateAiDesc}
              size="lg"
              className="flex items-center space-x-2"
            >
              {isAiGeneratingDesc ? (
                <>
                  <Wand2 className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Description</span>
                </>
              )}
            </Button>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              disabled={isAiGeneratingDesc}
              value={education.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              rows={5}
              placeholder="Describe your role and achievements..."
              required
            />
          </div>
        </div>

        <Button
          onClick={onRemove}
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
          disabled={!isBackendId(education.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

interface AddEducationFormProps {
  onAdd: (education: Omit<Education, "id">) => void;
  onCancel: () => void;
  onGenerateAiDesc: (degree: string) => Promise<string>;
}

const AddEducationForm: React.FC<AddEducationFormProps> = ({
  onAdd,
  onCancel,
  onGenerateAiDesc,
}) => {
  const [formData, setFormData] = useState({
    degree: "",
    institution: "",
    graduationDate: "",
    gpa: "",
    description: "",
  });

  const [isAiGeneratingDesc, setIsAiGeneratingDesc] = useState(false);

  const [isCanGenerateAiDesc, setIsCanGenerateAiDesc] = useState(false);

  useEffect(() => {
    const isCanGenerate = !!formData.degree;

    setIsCanGenerateAiDesc(isCanGenerate);
  }, [formData]);

  const handleGenerateAiDesc = async () => {
    setIsAiGeneratingDesc(true);

    const aiDesc = await onGenerateAiDesc(formData.degree);

    const updatedDesc = formData.description + aiDesc;

    setFormData({ ...formData, description: updatedDesc });

    setIsAiGeneratingDesc(false);
  };

  const handleSubmit = () => {
    onAdd(formData);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="p-4 border-2 border-dashed border-blue-200 rounded-lg space-y-3"
    >
      <h4 className="font-medium text-gray-900">Add Education</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label>Degree</Label>
          <Input
            value={formData.degree}
            onChange={(e) =>
              setFormData({ ...formData, degree: e.target.value })
            }
            placeholder="Bachelor of Science in Computer Science"
            required
          />
        </div>
        <div>
          <Label>Institution</Label>
          <Input
            value={formData.institution}
            onChange={(e) =>
              setFormData({ ...formData, institution: e.target.value })
            }
            placeholder="University of California, Berkeley"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label>Graduation Date (Optional)</Label>
          <Input
            type="month"
            value={formData.graduationDate}
            onChange={(e) =>
              setFormData({ ...formData, graduationDate: e.target.value })
            }
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

      <div className="flex justify-end align-middle">
        <Button
          onClick={handleGenerateAiDesc}
          disabled={isAiGeneratingDesc || !isCanGenerateAiDesc}
          size="lg"
          className="flex items-center space-x-2"
        >
          {isAiGeneratingDesc ? (
            <>
              <Wand2 className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              <span>Generate Description</span>
            </>
          )}
        </Button>
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          disabled={isAiGeneratingDesc}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={5}
          placeholder="Describe your role and achievements..."
          required
        />
      </div>

      <div className="flex space-x-2">
        <Button type="submit" size="sm">
          Add Education
        </Button>
        <Button onClick={onCancel} variant="outline" size="sm">
          Cancel
        </Button>
      </div>
    </form>
  );
};
