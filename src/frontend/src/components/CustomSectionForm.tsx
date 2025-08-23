import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, GripVertical, Save } from "lucide-react";
import { RichTextEditor } from "./RichTextEditor";
import { CustomSectionItem, useResumeStore } from "../store/useResumeStore";
import { useAuth } from "@/hooks/use-auth";
import { createCustomSectionHandler } from "@/lib/customSectionHandler";
import { useToast } from "@/hooks/use-toast";
import { isBackendId } from "@/lib/utils";

export const CustomSectionForm: React.FC = () => {
  const {
    resumeData,
    setCustomSection,
    addCustomSection,
    updateCustomSectionId,
    updateCustomSection,
    removeCustomSection,
    addCustomSectionItem,
    updateCustomSectionItemId,
    customSectionHandler,
  } = useResumeStore();
  const [newSectionName, setNewSectionName] = useState("");
  const [showAddSection, setShowAddSection] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const { toast } = useToast();

  const handleAddSection = async () => {
    try {
      const sectionName = newSectionName.trim();

      if (!sectionName) {
        toast({
          title: "Section Name Required",
          description: "Section name must be filled.",
          variant: "destructive",
        });

        return;
      }

      const localId = crypto.randomUUID();

      addCustomSection({
        lid: localId,
        name: sectionName,
        items: [],
      });

      setNewSectionName("");

      setShowAddSection(false);

      toast({
        title: "Success",
        description: `Custom section ${sectionName} added.`,
      });

      const addedCustomSection =
        await customSectionHandler.clientAddCustomSection({
          lid: localId,
          name: sectionName,
        });

      updateCustomSectionId(addedCustomSection.lid, addedCustomSection.id);
    } catch (error) {
      toast({
        title: "An Error Occurred",
        description: "Something went wrong with the custom section service.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveSection = async ({ id } : { id: string }) => {
    try {

      removeCustomSection(id);

      toast({
        title: "Success",
        description: "Section Deleted",
      });

      await customSectionHandler.clientDeleteCustomSection({
        id: id,
      })
    } catch (error) {
      toast({
        title: "An Error Occurred",
        description: error.message ?? "Something went wrong with the custom section service.",
        variant: "destructive",
      });
    }
  };

  const handleAddItem = async ({ lid, item }:{ lid:string, item: CustomSectionItem }) => {
    try {
      addCustomSectionItem(item);

      setShowAddItem(false);

      toast({
        title: "Success",
        description: `Item ${item.title} added.`,
      });

      const backendItem = await customSectionHandler.clientAddItem({
        lid,
        item
      });

      updateCustomSectionItemId({
        sectionId: backendItem.sectionId,
        lid : backendItem.lid,
        newId : backendItem.id
      });

    } catch (error) {
      toast({
        title: "An Error Occurred",
        description: error.message ?? "Something went wrong with the custom section service.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateItem = (
    sectionId: string,
    itemId: string,
    updates: Partial<CustomSectionItem>
  ) => {
    const section = resumeData.customSections.find((s) => s.id === sectionId);
    if (section) {
      const updatedItems = section.items.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      );
      updateCustomSection(sectionId, {
        ...section,
        items: updatedItems,
      });
    }
  };

  const handleBatchUpdateSectionItem = async ({ sectionId } : { sectionId: string }) => {
    try {

      toast({
        title: "Success",
        description: "Items Updated",
      });

      const section = resumeData.customSections.find(section => section.id == sectionId );

      if (! section) {
        throw new Error(`Section with ID ${sectionId} not found`);
      }

      await customSectionHandler.clientBatchUpdateItem({
        sectionId: sectionId,
        items: section.items
      })
    } catch (error) {
      toast({
        title: "An Error Occurred",
        description: error.message ?? "Something went wrong with the custom section service.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveItem = async (sectionId: string, itemId: string) => {
    try {
      const section = resumeData.customSections.find((s) => s.id === sectionId);

      if (!section) {
        throw new Error(`Section with ID ${sectionId} not found`);
      }

      const updatedItems = section.items.filter((item) => item.id !== itemId);

      updateCustomSection(sectionId, {
        ...section,
        items: updatedItems,
      });

      toast({
        title: "Success",
        description: "Item Deleted",
      });

      await customSectionHandler.clientDeleteItem({
        sectionId: sectionId,
        id: itemId,
      })
    } catch (error) {
      toast({
        title: "An Error Occurred",
        description: error.message ?? "Something went wrong with the custom section service.",
        variant: "destructive",
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
                onKeyDown={(e) => e.key === "Enter" && handleAddSection()}
              />
              <Button onClick={handleAddSection} size="sm">
                Add
              </Button>
              <Button
                onClick={() => {
                  setShowAddSection(false);
                  setNewSectionName("");
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

      {resumeData.customSections.map((section) => (
        <Card key={section.id}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center space-x-2">
                <GripVertical className="h-4 w-4 text-gray-400" />
                <span>{section.name}</span>
              </CardTitle>
              <div className="flex space-x-12">
                <div className="flex space-x-2">
                  <Button disabled={!isBackendId(section.id)} onClick={() => handleBatchUpdateSectionItem({ sectionId: section.id})} size="sm" variant="outline" className="flex items-center space-x-1">
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </Button>
                  <Button
                    onClick={() => {setShowAddItem(true)}}
                    size="sm"
                    variant="outline"
                    disabled={!isBackendId(section.id)}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add</span>
                  </Button>
                </div>
                <Button
                  onClick={() => handleRemoveSection({ id:section.id })}
                  size="sm"
                  variant="destructive"
                  disabled={!isBackendId(section.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">

            {showAddItem && (
              <AddItemForm
              sectionId={section.id}
              onAdd={handleAddItem}
              onCancel={() => setShowAddItem(false)}
              />
            )}

            {section.items.map((item) => (
              <Card key={item.id} className="bg-gray-50">
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`title-${item.id}`}>Title</Label>
                      <Input
                        id={`title-${item.id}`}
                        value={item.title}
                        onChange={(e) =>
                          handleUpdateItem(section.id, item.id, {
                            title: e.target.value,
                          })
                        }
                        placeholder="Item title"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`subtitle-${item.id}`}>
                        Subtitle (Optional)
                      </Label>
                      <Input
                        id={`subtitle-${item.id}`}
                        value={item.subtitle || ""}
                        onChange={(e) =>
                          handleUpdateItem(section.id, item.id, {
                            subtitle: e.target.value,
                          })
                        }
                        placeholder="Subtitle or organization"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={`date-${item.id}`}>Date (Optional)</Label>
                    <Input
                      id={`date-${item.id}`}
                      type="month"
                      value={item.date || ""}
                      onChange={(e) =>
                        handleUpdateItem(section.id, item.id, {
                          date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`description-${item.id}`}>
                      Description
                    </Label>
                    <RichTextEditor
                      value={item.description}
                      onChange={(value) =>
                        handleUpdateItem(section.id, item.id, {
                          description: value,
                        })
                      }
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
                No items yet. Click the + Add button to add your first item.
              </p>
            )}
          </CardContent>
        </Card>
      ))}

      {resumeData.customSections.length === 0 && !showAddSection && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 mb-4">
              Add custom sections like Projects, Awards, Volunteering, or any
              other relevant information.
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

interface AddItemProps {
  sectionId: string,
  onAdd: (params: {lid: string, item: CustomSectionItem}) => void;
  onCancel: () => void;
}

const AddItemForm: React.FC<AddItemProps> = ({ sectionId, onAdd, onCancel }) => {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    lid: crypto.randomUUID(),
    id: crypto.randomUUID(),
    sectionId: sectionId,
    title: "",
    subtitle: "",
    description: "",
    date: "",
  });

  const handleSubmit = () => {
    if (! formData.description.trim()) {
      toast({
          title: "Description is Required",
          description: "Description must be filled.",
          variant: "destructive",
      });
      return;
    }

    onAdd({
      lid: formData.lid,
      item: formData
    });
  };

  return (
    <CardContent className="p-4 space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`title-${formData.lid}`}>Title</Label>
            <Input
              id={`title-${formData.lid}`}
              name="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Item title"
              required
            />
          </div>
          <div>
            <Label htmlFor={`subtitle-${formData.lid}`}>Subtitle (Optional)</Label>
            <Input
              id={`subtitle-${formData.lid}`}
              name="subtitle"
              value={formData.subtitle}
              onChange={(e) =>
                setFormData({ ...formData, subtitle: e.target.value })
              }
              placeholder="Subtitle or organization"
            />
          </div>
        </div>

        <div>
          <Label htmlFor={`date-${formData.lid}`}>Date (Optional)</Label>
          <Input
            id={`date-${formData.lid}`}
            name="date"
            type="month"
            value={formData.date}
            onChange={(e) =>
              setFormData({ ...formData, date: e.target.value })
            }
          />
        </div>

        <div>
          <Label htmlFor={`description-${formData.lid}`}>Description</Label>
          <RichTextEditor
            value={formData.description}
            onChange={(val) =>
              setFormData({ ...formData, description: val })
            }
            placeholder="Describe this item..."
          />
        </div>

        <div className="flex space-x-2">
          <Button type="submit" size="sm">Add Item</Button>
          <Button type="button" onClick={onCancel} variant="outline" size="sm">Cancel</Button>
        </div>
      </form>
    </CardContent>
  );
};
