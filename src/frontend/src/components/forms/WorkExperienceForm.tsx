import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Briefcase, Plus, Trash2, Save, Wand2 } from "lucide-react";
import { useResumeStore, WorkExperience } from "../../store/useResumeStore";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { createWorkExperienceHandler } from "@/lib/workExperienceHandler";

export const WorkExperienceForm: React.FC = () => {
  const {
    resumeData,
    setWorkExperience,
    updateWorkExperienceId,
    addWorkExperience,
    updateWorkExperience,
    removeWorkExperience,
  } = useResumeStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  const { authClient, isAuthenticated } = useAuth();

  const workExpHandler = useMemo(() => {
    if (authClient) {
      return createWorkExperienceHandler(authClient);
    }
    return null;
  }, [authClient]);

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        if (! isAuthenticated) {
          setWorkExperience([]);

          return;
        }

        const exps = await workExpHandler.clientGetAll();

        setWorkExperience(exps);
      } catch (error) {
        console.error("Failed to fetch work experiences", error);
      }
    };

    if (workExpHandler) {
      fetchExperience();
    }
  }, [isAuthenticated]);

  const handleAdd = async (experience: WorkExperience) => {
    try {
      const lid = crypto.randomUUID();

      experience = {
        ...experience,
        lid: lid,
      };

      addWorkExperience(experience);

      setShowAddForm(false);

      toast({
        title: "Work Experience Added",
        description: `${experience.jobTitle} added.`,
      });

      const addedExperience = await workExpHandler.clientAdd(lid, experience);

      updateWorkExperienceId(lid, addedExperience.id);
    } catch (error) {
      console.error(error);

      toast({
        title: "An Error Occurred",
        description: "Something went wrong with the work experience service.",
        variant: "destructive",
      });
    }
  };

  const handleRemove = async (id: string) => {
    try {
      removeWorkExperience(id);
      toast({
        title: "Work Experience Deleted",
        description: "The selected work experience was successfully removed.",
      });

      await workExpHandler.clientDeleteById(id);
    } catch (error) {
      console.error(error);

      toast({
        title: "An Error Occurred",
        description: "Something went wrong with the work experience service.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    try {
      toast({
        title: "Saved!",
        description: "Work experience has been saved successfully.",
      });
      await workExpHandler.clientSave(resumeData.workExperience);
    } catch (error) {
      console.error(error);

      toast({
        title: "An Error Occurred",
        description: "Something went wrong with the work experience service.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateAiDescription = async (
    jobTitle: string
  ): Promise<string> => {
    try {
      const result = await workExpHandler.clientGenerateAiDesc(jobTitle);

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
        title: "Missing Information",
        description: "Something went wrong with the work experience service.",
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
            <Briefcase className="w-5 h-5 text-blue-600" />
            <span>Work Experience</span>
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
        {resumeData.workExperience.length === 0 && !showAddForm && (
          <p className="text-gray-500 text-center py-4">
            No work experience added yet. Click "Add" to start.
          </p>
        )}

        {resumeData.workExperience.map((experience) => (
          <ExperienceItem
            key={experience.id}
            experience={experience}
            onUpdate={(updates) => updateWorkExperience(experience.id, updates)}
            onRemove={() => handleRemove(experience.id)}
            onGenerateAiDesc={handleGenerateAiDescription}
          />
        ))}

        {showAddForm && (
          <AddExperienceForm
            onAdd={handleAdd}
            onCancel={() => setShowAddForm(false)}
            onGenerateAiDesc={handleGenerateAiDescription}
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
  onGenerateAiDesc: (jobTitle: string) => Promise<string>;
}

const ExperienceItem: React.FC<ExperienceItemProps> = ({
  experience,
  onUpdate,
  onRemove,
  onGenerateAiDesc,
}) => {
  const [isAiGeneratingDesc, setIsAiGeneratingDesc] = useState(false);

  const [isCanGenerateAiDesc, setIsCanGenerateAiDesc] = useState(false);

  useEffect(() => {
    const isCanGenerate = !!experience.jobTitle;

    setIsCanGenerateAiDesc(isCanGenerate);
  }, [experience]);

  const handleGenerateAiDesc = async () => {
    setIsAiGeneratingDesc(true);

    const aiDesc = await onGenerateAiDesc(experience.jobTitle);

    const updatedDesc = experience.description + aiDesc;

    onUpdate({ description: updatedDesc });

    setIsAiGeneratingDesc(false);
  };

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
              value={experience.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              rows={5}
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
  onAdd: (experience: Omit<WorkExperience, "id">) => void;
  onCancel: () => void;
  onGenerateAiDesc: (jobTitle: string) => Promise<string>;
}

const AddExperienceForm: React.FC<AddExperienceFormProps> = ({
  onAdd,
  onCancel,
  onGenerateAiDesc,
}) => {
  const [formData, setFormData] = useState({
    id: crypto.randomUUID(),
    jobTitle: "",
    company: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  });

  const [isAiGeneratingDesc, setIsAiGeneratingDesc] = useState(false);

  const [isCanGenerateAiDesc, setIsCanGenerateAiDesc] = useState(false);

  useEffect(() => {
    const isCanGenerate = !!formData.jobTitle;

    setIsCanGenerateAiDesc(isCanGenerate);
  }, [formData]);

  const handleSubmit = () => {
    if (formData.jobTitle && formData.company) {
      onAdd(formData);
    }
  };

  const handleGenerateAiDesc = async () => {
    setIsAiGeneratingDesc(true);

    const aiDesc = await onGenerateAiDesc(formData.jobTitle);

    const updatedDesc = formData.description + aiDesc;

    setFormData({ ...formData, description: updatedDesc });

    setIsAiGeneratingDesc(false);
  };

  return (
    <div className="p-4 border-2 border-dashed border-blue-200 rounded-lg space-y-3">
      <h4 className="font-medium text-gray-900">Add Work Experience</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label>Job Title</Label>
          <Input
            value={formData.jobTitle}
            onChange={(e) =>
              setFormData({ ...formData, jobTitle: e.target.value })
            }
            placeholder="Software Engineer"
          />
        </div>
        <div>
          <Label>Company</Label>
          <Input
            value={formData.company}
            onChange={(e) =>
              setFormData({ ...formData, company: e.target.value })
            }
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
            onChange={(e) =>
              setFormData({ ...formData, startDate: e.target.value })
            }
          />
        </div>
        <div>
          <Label>End Date</Label>
          <Input
            type="month"
            value={formData.endDate}
            onChange={(e) =>
              setFormData({ ...formData, endDate: e.target.value })
            }
            disabled={formData.current}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={formData.current}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, current: !!checked })
            }
          />
          <Label>Current</Label>
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
        />
      </div>

      <div className="flex space-x-2">
        <Button onClick={handleSubmit} size="sm">
          Add Experience
        </Button>
        <Button onClick={onCancel} variant="outline" size="sm">
          Cancel
        </Button>
      </div>
    </div>
  );
};
