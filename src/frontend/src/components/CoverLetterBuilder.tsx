// src/pages/CoverLetterBuilder.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Wand2, Download, Eye, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { createCoverLetterHandler } from "@/lib/coverLetterHandler";
import { useResumeStore } from "@/store/useResumeStore";

const DEFAULT_BUILDER = {
  id: "",
  recipientName: "",
  companyName: "",
  jobTitle: "",
  jobDescription: "",
  tone: "professional",
};

const DEFAULT_EDITOR = {
  id: "",
  introduction: "",
  body: "",
  conclusion: "",
};

type TabType = "builder" | "editor" | "templates" | "preview";

export const CoverLetterBuilder: React.FC = () => {
  // ⬇️ ambil dari ROOT store (bukan dari resumeData)
  const coverLetterBuilder = useResumeStore((s) => s.coverLetterBuilder);
  const coverLetterEditor = useResumeStore((s) => s.coverLetterEditor);
  const setCoverLetterBuilder = useResumeStore((s) => s.setCoverLetterBuilder);
  const updateCoverLetterBuilder = useResumeStore((s) => s.updateCoverLetterBuilder);
  const setCoverLetterEditor = useResumeStore((s) => s.setCoverLetterEditor);
  const updateCoverLetterEditor = useResumeStore((s) => s.updateCoverLetterEditor);

  // fallback biar nggak crash saat awal render
  const builder = coverLetterBuilder ?? DEFAULT_BUILDER;
  const editor = coverLetterEditor ?? DEFAULT_EDITOR;

  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("builder");

  const toneOptions = [
    { value: "professional", label: "Professional" },
    { value: "friendly", label: "Friendly" },
    { value: "enthusiastic", label: "Enthusiastic" },
    { value: "confident", label: "Confident" },
    { value: "creative", label: "Creative" },
  ] as const;

  const templates = [
    { id: "traditional", name: "Traditional", description: "Classic formal business letter format" },
    { id: "modern", name: "Modern", description: "Contemporary style with a personal touch" },
    { id: "creative", name: "Creative", description: "Unique format for creative industries" },
    { id: "tech", name: "Tech", description: "Technical focus for IT and software roles" },
  ] as const;

  const { authClient, isAuthenticated } = useAuth();
  const handler = useMemo(() => (authClient ? createCoverLetterHandler(authClient) : null), [authClient]);

  // init default (biar nggak undefined) + fetch dari BE kalau sudah login
  useEffect(() => {
    // init sekali kalau kosong
    if (!coverLetterBuilder) setCoverLetterBuilder(DEFAULT_BUILDER);
    if (!coverLetterEditor) setCoverLetterEditor(DEFAULT_EDITOR);

    if (!handler || !isAuthenticated) return;
    (async () => {
      try {
        // NB: sesuaikan dgn API handler kamu (clientGetBuilder/clientGetEditor)
        const [b, e] = await Promise.all([
          handler.clientGetBuilder?.(),
          handler.clientGetEditor?.(),
        ]);
        if (b) setCoverLetterBuilder(b as any);
        if (e) setCoverLetterEditor(e as any);
      } catch (err) {
        console.error("fetch cover letter failed:", err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handler, isAuthenticated]);

  const generateCoverLetter = async () => {
    if (!builder.companyName || !builder.jobTitle) {
      toast({
        title: "Missing Information",
        description: "Please fill in the company name and job title to generate a cover letter.",
        variant: "destructive",
      });
      return;
    }
    if (!handler?.clientGenerateAiCoverLetter) {
      toast({ title: "Not ready", description: "Handler not ready.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const newEditor = await handler.clientGenerateAiCoverLetter(builder as any);
      setCoverLetterEditor(newEditor as any);
      setActiveTab("editor");
      toast({ title: "Cover Letter Generated!", description: "Your AI-generated cover letter is ready for review." });
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Failed to generate cover letter.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!builder.companyName || !builder.jobTitle) {
      toast({
        title: "Missing required fields",
        description: "Company name & job title are required to save.",
        variant: "destructive",
      });
      return;
    }
    if (!handler?.clientSave) {
      toast({ title: "Not ready", description: "Handler not ready.", variant: "destructive" });
      return;
    }
    try {
      await handler.clientSave(builder as any, editor as any);
      toast({ title: "Saved", description: "Your cover letter has been saved." });
    } catch (e: any) {
      toast({ title: "Save failed", description: e?.message || "Please try again.", variant: "destructive" });
    }
  };

  const handleUseTemplate = (templateId: (typeof templates)[number]["id"]) => {
    if (templateId === "traditional") {
      updateCoverLetterEditor({
        introduction: `Dear ${builder.recipientName || "Hiring Manager"},\n\nI am writing to express my interest in the ${builder.jobTitle} position at ${builder.companyName}.`,
        body: `In my previous roles, I have developed skills closely aligned with this role. I collaborate well across teams and enjoy delivering impact.`,
        conclusion: `Thank you for your time and consideration. I look forward to discussing how I can contribute to ${builder.companyName}.\n\nSincerely,\n[Your Name]`,
      });
    }
    if (templateId === "modern") {
      updateCoverLetterEditor({
        introduction: `Hello ${builder.recipientName || "Hiring Manager"},\n\nI’m excited about the ${builder.jobTitle} role at ${builder.companyName}.`,
        body: `I bring hands-on experience in fast-paced environments and love solving real problems with thoughtful engineering and collaboration.`,
        conclusion: `I’d love to connect and share how I can help ${builder.companyName} reach its goals.\n\nBest,\n[Your Name]`,
      });
    }
    if (templateId === "creative") {
      updateCoverLetterEditor({
        introduction: `Hi ${builder.recipientName || "Hiring Manager"},\n\nAs a creative professional, I see ${builder.companyName} as the perfect canvas for the ${builder.jobTitle} role.`,
        body: `My approach blends curiosity with execution. I’ve shipped campaigns/features that balanced fresh ideas with measurable outcomes.`,
        conclusion: `Thanks for reviewing my application—I’d be thrilled to bring that energy to ${builder.companyName}.\n\nCheers,\n[Your Name]`,
      });
    }
    if (templateId === "tech") {
      updateCoverLetterEditor({
        introduction: `Dear ${builder.recipientName || "Hiring Manager"},\n\nI’m applying for ${builder.jobTitle} at ${builder.companyName}.`,
        body: `I’ve built and maintained production systems, focused on reliability, performance, and developer experience. I enjoy pairing and writing clean, tested code.`,
        conclusion: `I’d welcome the chance to discuss how I can contribute to ${builder.companyName}'s roadmap.\n\nRegards,\n[Your Name]`,
      });
    }
    setActiveTab("editor");
  };

  const handleExport = () => {
    const content = getFullCoverLetter().trim();
    if (!content) {
      toast({ title: "Nothing to export", description: "Generate or write content first.", variant: "destructive" });
      return;
    }
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeCompany = (builder.companyName || "Company").replace(/\s+/g, "_");
    const safeRole = (builder.jobTitle || "Role").replace(/\s+/g, "_");
    a.href = url;
    a.download = `cover_letter_${safeCompany}_${safeRole}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    toast({ title: "Exported", description: "Your cover letter was downloaded as .txt." });
  };

  const getFullCoverLetter = () =>
    `${editor.introduction}\n\n${editor.body}\n\n${editor.conclusion}`.trim();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-green-600" />
          <span>Cover Letter Builder</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v: TabType) => setActiveTab(v)} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="builder">Builder</TabsTrigger>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          {/* Builder */}
          <TabsContent value="builder" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={builder.companyName}
                    onChange={(e) => updateCoverLetterBuilder({ companyName: e.target.value })}
                    placeholder="Enter company name"
                  />
                </div>

                <div>
                  <Label htmlFor="jobTitle">Job Title *</Label>
                  <Input
                    id="jobTitle"
                    value={builder.jobTitle}
                    onChange={(e) => updateCoverLetterBuilder({ jobTitle: e.target.value })}
                    placeholder="Enter job title"
                  />
                </div>

                <div>
                  <Label htmlFor="recipientName">Recipient Name</Label>
                  <Input
                    id="recipientName"
                    value={builder.recipientName}
                    onChange={(e) => updateCoverLetterBuilder({ recipientName: e.target.value })}
                    placeholder="Hiring Manager (optional)"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="tone">Tone</Label>
                  <Select
                    value={builder.tone}
                    onValueChange={(value) => updateCoverLetterBuilder({ tone: value })}
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
                  <Label htmlFor="jobDescription">Job Description (Optional)</Label>
                  <Textarea
                    id="jobDescription"
                    value={builder.jobDescription}
                    onChange={(e) => updateCoverLetterBuilder({ jobDescription: e.target.value })}
                    placeholder="Paste job description for better customization"
                    rows={6}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button onClick={generateCoverLetter} disabled={isGenerating} size="lg" className="flex items-center space-x-2">
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

          {/* Editor */}
          <TabsContent value="editor" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="introduction">Introduction</Label>
                <Textarea
                  id="introduction"
                  value={editor.introduction}
                  onChange={(e) => updateCoverLetterEditor({ introduction: e.target.value })}
                  placeholder="Write your opening paragraph..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="body">Body</Label>
                <Textarea
                  id="body"
                  value={editor.body}
                  onChange={(e) => updateCoverLetterEditor({ body: e.target.value })}
                  placeholder="Write the main content of your cover letter..."
                  rows={8}
                />
              </div>

              <div>
                <Label htmlFor="conclusion">Conclusion</Label>
                <Textarea
                  id="conclusion"
                  value={editor.conclusion}
                  onChange={(e) => updateCoverLetterEditor({ conclusion: e.target.value })}
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

          {/* Templates */}
          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((t) => (
                <div key={t.id} className="border rounded-lg p-4 hover:border-green-300 hover:bg-green-50 cursor-pointer transition-all">
                  <div className="space-y-2">
                    <h3 className="font-semibold">{t.name}</h3>
                    <p className="text-sm text-gray-600">{t.description}</p>
                    <Button size="sm" className="w-full" onClick={() => handleUseTemplate(t.id)}>
                      Use Template
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Preview */}
          <TabsContent value="preview" className="space-y-4">
            <div className="bg-white border rounded-lg p-8 max-w-2xl mx-auto">
              <div className="space-y-4 text-sm leading-relaxed">
                <div className="whitespace-pre-wrap">
                  {getFullCoverLetter() || "Generate or write your cover letter to see the preview."}
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
