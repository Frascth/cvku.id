// src/pages/CoverLetterBuilder.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Wand2, Download, Eye, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { createCoverLetterHandler } from "@/lib/coverLetterHandler";
import { useResumeStore } from "@/store/useResumeStore";

export const CoverLetterBuilder: React.FC = () => {
  const {
    resumeData,
    setCoverLetterBuilder,
    setCoverLetterEditor,
    updateCoverLetterBuilder,
    updateCoverLetterEditor,
    coverLetterHandler,
  } = useResumeStore();

  const { coverLetterBuilder, coverLetterEditor } = resumeData;

  const { toast } = useToast();

  const [isGenerating, setIsGenerating] = useState(false);

  type TabType = "builder" | "editor" | "templates" | "preview";

  const [activeTab, setActiveTab] = useState<TabType>("builder");

  const toneOptions = [
    { value: "professional", label: "Professional" },
    { value: "friendly", label: "Friendly" },
    { value: "enthusiastic", label: "Enthusiastic" },
    { value: "confident", label: "Confident" },
    { value: "creative", label: "Creative" },
  ];

  const templates = [
    {
      id: "traditional",
      name: "Traditional",
      description: "Classic formal business letter format",
    },
    {
      id: "modern",
      name: "Modern",
      description: "Contemporary style with a personal touch",
    },
    {
      id: "creative",
      name: "Creative",
      description: "Unique format for creative industries",
    },
    {
      id: "tech",
      name: "Tech",
      description: "Technical focus for IT and software roles",
    },
  ] as const;


  const generateCoverLetter = async () => {
    if (!coverLetterBuilder.companyName || !coverLetterBuilder.jobTitle) {
      toast({
        title: "Missing Information",
        description:
          "Please fill in the company name and job title to generate a cover letter.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const editor = await coverLetterHandler.clientGenerateAiCoverLetter(
        coverLetterBuilder
      );

      setCoverLetterEditor(editor);

      setActiveTab("editor");

      toast({
        title: "Cover Letter Generated!",
        description: "Your AI-generated cover letter is ready for review.",
      });
    } catch (e) {
      toast({
        title: "Error",
        description: e.message || "Failed to generate cover letter.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!coverLetterBuilder.companyName || !coverLetterBuilder.jobTitle) {
      toast({
        title: "Missing required fields",
        description: "Company name & job title are required to save.",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Saved",
        description: "Your cover letter has been saved.",
      });

      await coverLetterHandler.clientSave(coverLetterBuilder, coverLetterEditor);
    } catch (e) {
      toast({
        title: "Save failed",
        description: e.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUseTemplate = (templateId: (typeof templates)[number]["id"]) => {
    if (templateId === "traditional") {
      updateCoverLetterEditor({
        ...coverLetterEditor,
        introduction: `Dear ${
          coverLetterBuilder.recipientName || "Hiring Manager"
        },\n\nI am writing to express my interest in the ${
          coverLetterBuilder.jobTitle
        } position at ${coverLetterBuilder.companyName}.`,
        body: `In my previous roles, I have developed skills closely aligned with this role. I collaborate well across teams and enjoy delivering impact.`,
        conclusion: `Thank you for your time and consideration. I look forward to discussing how I can contribute to ${coverLetterBuilder.companyName}.\n\nSincerely,\n[Your Name]`,
      });
    }
    if (templateId === "modern") {
      updateCoverLetterEditor({
        ...coverLetterEditor,
        introduction: `Hello ${
          coverLetterBuilder.recipientName || "Hiring Manager"
        },\n\nI’m excited about the ${coverLetterBuilder.jobTitle} role at ${
          coverLetterBuilder.companyName
        }.`,
        body: `I bring hands-on experience in fast-paced environments and love solving real problems with thoughtful engineering and collaboration.`,
        conclusion: `I’d love to connect and share how I can help ${coverLetterBuilder.companyName} reach its goals.\n\nBest,\n[Your Name]`,
      });
    }
    if (templateId === "creative") {
      updateCoverLetterEditor({
        ...coverLetterEditor,
        introduction: `Hi ${
          coverLetterBuilder.recipientName || "Hiring Manager"
        },\n\nAs a creative professional, I see ${
          coverLetterBuilder.companyName
        } as the perfect canvas for the ${coverLetterBuilder.jobTitle} role.`,
        body: `My approach blends curiosity with execution. I’ve shipped campaigns/features that balanced fresh ideas with measurable outcomes.`,
        conclusion: `Thanks for reviewing my application—I’d be thrilled to bring that energy to ${coverLetterBuilder.companyName}.\n\nCheers,\n[Your Name]`,
      });
    }
    if (templateId === "tech") {
      updateCoverLetterEditor({
        ...coverLetterEditor,
        introduction: `Dear ${
          coverLetterBuilder.recipientName || "Hiring Manager"
        },\n\nI’m applying for ${coverLetterBuilder.jobTitle} at ${
          coverLetterBuilder.companyName
        }.`,
        body: `I’ve built and maintained production systems, focused on reliability, performance, and developer experience. I enjoy pairing and writing clean, tested code.`,
        conclusion: `I’d welcome the chance to discuss how I can contribute to ${coverLetterBuilder.companyName}'s roadmap.\n\nRegards,\n[Your Name]`,
      });
    }
    setActiveTab("editor");
  };

  const handleExport = () => {
    const content = getFullCoverLetter().trim();
    if (!content) {
      toast({
        title: "Nothing to export",
        description: "Generate or write content first.",
        variant: "destructive",
      });
      return;
    }
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeCompany = (coverLetterBuilder.companyName || "Company").replace(
      /\s+/g,
      "_"
    );
    const safeRole = (coverLetterBuilder.jobTitle || "Role").replace(
      /\s+/g,
      "_"
    );
    a.href = url;
    a.download = `cover_letter_${safeCompany}_${safeRole}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported",
      description: "Your cover letter was downloaded as .txt.",
    });
  };

  const getFullCoverLetter = () =>
    `${coverLetterEditor.introduction}\n\n${coverLetterEditor.body}\n\n${coverLetterEditor.conclusion}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-green-600" />
          <span>Cover Letter Builder</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(v: TabType) => setActiveTab(v)}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="builder">Builder</TabsTrigger>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={coverLetterBuilder.companyName}
                    onChange={(e) =>
                      updateCoverLetterBuilder({ companyName: e.target.value })
                    }
                    placeholder="Enter company name"
                  />
                </div>

                <div>
                  <Label htmlFor="jobTitle">Job Title *</Label>
                  <Input
                    id="jobTitle"
                    value={coverLetterBuilder.jobTitle}
                    onChange={(e) =>
                      updateCoverLetterBuilder({ jobTitle: e.target.value })
                    }
                    placeholder="Enter job title"
                  />
                </div>

                <div>
                  <Label htmlFor="recipientName">Recipient Name</Label>
                  <Input
                    id="recipientName"
                    value={coverLetterBuilder.recipientName}
                    onChange={(e) =>
                      updateCoverLetterBuilder({
                        recipientName: e.target.value,
                      })
                    }
                    placeholder="Hiring Manager (optional)"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="tone">Tone</Label>
                  <Select
                    value={coverLetterBuilder.tone}
                    onValueChange={(value) =>
                      updateCoverLetterBuilder({ tone: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {toneOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="jobDescription">
                    Job Description (Optional)
                  </Label>
                  <Textarea
                    id="jobDescription"
                    value={coverLetterBuilder.jobDescription}
                    onChange={(e) =>
                      updateCoverLetterBuilder({
                        jobDescription: e.target.value,
                      })
                    }
                    placeholder="Paste job description for better customization"
                    rows={6}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={generateCoverLetter}
                disabled={isGenerating}
                size="lg"
                className="flex items-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <Wand2 className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Generate Cover Letter</span>
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="editor" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="introduction">Introduction</Label>
                <Textarea
                  id="introduction"
                  value={coverLetterEditor.introduction}
                  onChange={(e) =>
                    updateCoverLetterEditor({ introduction: e.target.value })
                  }
                  placeholder="Write your opening paragraph..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="body">Body</Label>
                <Textarea
                  id="body"
                  value={coverLetterEditor.body}
                  onChange={(e) =>
                    updateCoverLetterEditor({ body: e.target.value })
                  }
                  placeholder="Write the main content of your cover letter..."
                  rows={8}
                />
              </div>

              <div>
                <Label htmlFor="conclusion">Conclusion</Label>
                <Textarea
                  id="conclusion"
                  value={coverLetterEditor.conclusion}
                  onChange={(e) =>
                    updateCoverLetterEditor({ conclusion: e.target.value })
                  }
                  placeholder="Write your closing paragraph..."
                  rows={4}
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleSave} variant="outline">
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export TXT
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((t) => (
                <div
                  key={t.id}
                  className="border rounded-lg p-4 hover:border-green-300 hover:bg-green-50 cursor-pointer transition-all"
                >
                  <div className="space-y-2">
                    <h3 className="font-semibold">{t.name}</h3>
                    <p className="text-sm text-gray-600">{t.description}</p>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleUseTemplate(t.id)}
                    >
                      Use Template
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="bg-white border rounded-lg p-8 max-w-2xl mx-auto">
              <div className="space-y-4 text-sm leading-relaxed">
                <div className="whitespace-pre-wrap">
                  {getFullCoverLetter() ||
                    "Generate or write your cover letter to see the preview."}
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-2">
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Full Screen Preview
              </Button>
              <Button onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Download TXT
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
