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
import { AuthClient } from "@dfinity/auth-client";
import { createActor as createLlmActor, canisterId as llmCanisterId } from "../../../declarations/llm_service";
import {
  saveDraft,
  type CoverLetterEditor,
} from "@/lib/coverLetterHandler";

interface CoverLetterData {
  recipientName: string;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  tone: string;
  introduction: string;
  body: string;
  conclusion: string;
}

export const CoverLetterBuilder: React.FC = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"builder" | "editor" | "templates" | "preview">("builder");
  const [draftId, setDraftId] = useState<bigint | null>(null);

  const [coverLetterData, setCoverLetterData] = useState<CoverLetterData>({
    recipientName: "",
    companyName: "",
    jobTitle: "",
    jobDescription: "",
    tone: "professional",
    introduction: "",
    body: "",
    conclusion: "",
  });

  const toneOptions = [
    { value: "professional", label: "Professional" },
    { value: "friendly", label: "Friendly" },
    { value: "enthusiastic", label: "Enthusiastic" },
    { value: "confident", label: "Confident" },
    { value: "creative", label: "Creative" },
  ];

  const templates = [
    { id: "traditional", name: "Traditional", description: "Classic formal business letter format" },
    { id: "modern", name: "Modern", description: "Contemporary style with a personal touch" },
    { id: "creative", name: "Creative", description: "Unique format for creative industries" },
    { id: "tech", name: "Tech", description: "Technical focus for IT and software roles" },
  ] as const;

  const LLM_MODEL = "llama4-scout"; // opsi lain: "qwen3:32b" atau "llama4-scout"

  const handleInputChange = (field: keyof CoverLetterData, value: string) => {
    setCoverLetterData((prev) => ({ ...prev, [field]: value }));
  };

  // Auth & LLM actor
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      const ac = await AuthClient.create();
      if (mounted) setAuthClient(ac);
    })();
    return () => { mounted = false; };
  }, []);

  const llm = useMemo(
    () =>
      authClient
        ? createLlmActor(llmCanisterId, {
          agentOptions: { identity: authClient.getIdentity() },
        })
        : null,
    [authClient]
  );

  const generateCoverLetter = async () => {
    if (!coverLetterData.companyName || !coverLetterData.jobTitle) {
      toast({
        title: "Missing Information",
        description: "Please fill in the company name and job title to generate a cover letter.",
        variant: "destructive",
      });
      return;
    }
    if (!llm) {
      toast({ title: "Not ready", description: "Auth belum siap. Coba lagi sebentar." });
      return;
    }

    setIsGenerating(true);
    try {
      const sys =
        "You are an expert cover letter writer. Output EXACTLY three paragraphs: an introduction, a body, and a conclusion. Keep it concise and professional.";
      const userText = `Recipient: ${coverLetterData.recipientName || "Hiring Manager"}
Company: ${coverLetterData.companyName}
Job Title: ${coverLetterData.jobTitle}
Job Description: ${coverLetterData.jobDescription}
Tone: ${coverLetterData.tone}`;

      // Panggil LLM canister langsung (query)
      const completion: string = await llm.v0_chat({
        model: LLM_MODEL, // <— gunakan konstanta
        messages: [
          { role: { system: null }, content: sys },
          { role: { user: null }, content: userText },
        ],
      });

      // Split jadi 3 paragraf pakai blank line
      const [introduction = "", body = "", conclusion = ""] = completion.split(/\n\s*\n/);

      setCoverLetterData((prev) => ({ ...prev, introduction, body, conclusion }));
      setActiveTab("editor");
      toast({ title: "Cover Letter Generated!", description: "Your AI-generated cover letter is ready for review." });
    } catch (e: any) {
      console.error("v0_chat error:", e);
      // Tampilkan pilihan model jika provider mengembalikan daftar "Supported models: ..."
      const msg = String(e?.message ?? e);
      const supported = msg.match(/Supported models:\s*(.*)$/i)?.[1];
      toast({
        title: "Error",
        description: supported
          ? `Model tidak didukung. Coba salah satu: ${supported}`
          : "Failed to generate cover letter.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };


  const handleSave = async () => {
    if (!coverLetterData.companyName || !coverLetterData.jobTitle) {
      toast({
        title: "Missing required fields",
        description: "Company name & job title are required to save.",
        variant: "destructive",
      });
      return;
    }

    try {
      const builder = {
        recipientName: coverLetterData.recipientName || "Hiring Manager",
        companyName: coverLetterData.companyName,
        jobTitle: coverLetterData.jobTitle,
        jobDescription: coverLetterData.jobDescription,
        tone: coverLetterData.tone,
      };
      const editor: CoverLetterEditor = {
        introduction: coverLetterData.introduction,
        body: coverLetterData.body,
        conclusion: coverLetterData.conclusion,
      };

      const id = await saveDraft(draftId, builder, editor);
      setDraftId(id);

      toast({ title: "Saved", description: "Your cover letter has been saved." });
    } catch (e) {
      toast({ title: "Save failed", description: "Please try again.", variant: "destructive" });
    }
  };

  const handleUseTemplate = (templateId: typeof templates[number]["id"]) => {
    if (templateId === "traditional") {
      setCoverLetterData((prev) => ({
        ...prev,
        introduction: `Dear ${prev.recipientName || "Hiring Manager"},\n\nI am writing to express my interest in the ${prev.jobTitle} position at ${prev.companyName}.`,
        body: `In my previous roles, I have developed skills closely aligned with this role. I collaborate well across teams and enjoy delivering impact.`,
        conclusion: `Thank you for your time and consideration. I look forward to discussing how I can contribute to ${prev.companyName}.\n\nSincerely,\n[Your Name]`,
      }));
    }
    if (templateId === "modern") {
      setCoverLetterData((prev) => ({
        ...prev,
        introduction: `Hello ${prev.recipientName || "Hiring Manager"},\n\nI’m excited about the ${prev.jobTitle} role at ${prev.companyName}.`,
        body: `I bring hands-on experience in fast-paced environments and love solving real problems with thoughtful engineering and collaboration.`,
        conclusion: `I’d love to connect and share how I can help ${prev.companyName} reach its goals.\n\nBest,\n[Your Name]`,
      }));
    }
    if (templateId === "creative") {
      setCoverLetterData((prev) => ({
        ...prev,
        introduction: `Hi ${prev.recipientName || "Hiring Manager"},\n\nAs a creative professional, I see ${prev.companyName} as the perfect canvas for the ${prev.jobTitle} role.`,
        body: `My approach blends curiosity with execution. I’ve shipped campaigns/features that balanced fresh ideas with measurable outcomes.`,
        conclusion: `Thanks for reviewing my application—I’d be thrilled to bring that energy to ${prev.companyName}.\n\nCheers,\n[Your Name]`,
      }));
    }
    if (templateId === "tech") {
      setCoverLetterData((prev) => ({
        ...prev,
        introduction: `Dear ${prev.recipientName || "Hiring Manager"},\n\nI’m applying for ${prev.jobTitle} at ${prev.companyName}.`,
        body: `I’ve built and maintained production systems, focused on reliability, performance, and developer experience. I enjoy pairing and writing clean, tested code.`,
        conclusion: `I’d welcome the chance to discuss how I can contribute to ${prev.companyName}'s roadmap.\n\nRegards,\n[Your Name]`,
      }));
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
    const safeCompany = (coverLetterData.companyName || "Company").replace(/\s+/g, "_");
    const safeRole = (coverLetterData.jobTitle || "Role").replace(/\s+/g, "_");
    a.href = url;
    a.download = `cover_letter_${safeCompany}_${safeRole}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    toast({ title: "Exported", description: "Your cover letter was downloaded as .txt." });
  };

  const getFullCoverLetter = () =>
    `${coverLetterData.introduction}\n\n${coverLetterData.body}\n\n${coverLetterData.conclusion}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-green-600" />
          <span>Cover Letter Builder</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
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
                    value={coverLetterData.companyName}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>

                <div>
                  <Label htmlFor="jobTitle">Job Title *</Label>
                  <Input
                    id="jobTitle"
                    value={coverLetterData.jobTitle}
                    onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                    placeholder="Enter job title"
                  />
                </div>

                <div>
                  <Label htmlFor="recipientName">Recipient Name</Label>
                  <Input
                    id="recipientName"
                    value={coverLetterData.recipientName}
                    onChange={(e) => handleInputChange("recipientName", e.target.value)}
                    placeholder="Hiring Manager (optional)"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="tone">Tone</Label>
                  <Select
                    value={coverLetterData.tone}
                    onValueChange={(value) => handleInputChange("tone", value)}
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
                    value={coverLetterData.jobDescription}
                    onChange={(e) => handleInputChange("jobDescription", e.target.value)}
                    placeholder="Paste job description for better customization"
                    rows={6}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button onClick={generateCoverLetter} disabled={isGenerating || !llm} size="lg" className="flex items-center space-x-2">
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

            {draftId != null && (
              <div className="text-center text-xs text-gray-500 mt-2">Draft ID: {draftId.toString()}</div>
            )}
          </TabsContent>

          <TabsContent value="editor" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="introduction">Introduction</Label>
                <Textarea
                  id="introduction"
                  value={coverLetterData.introduction}
                  onChange={(e) => handleInputChange("introduction", e.target.value)}
                  placeholder="Write your opening paragraph..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="body">Body</Label>
                <Textarea
                  id="body"
                  value={coverLetterData.body}
                  onChange={(e) => handleInputChange("body", e.target.value)}
                  placeholder="Write the main content of your cover letter..."
                  rows={8}
                />
              </div>

              <div>
                <Label htmlFor="conclusion">Conclusion</Label>
                <Textarea
                  id="conclusion"
                  value={coverLetterData.conclusion}
                  onChange={(e) => handleInputChange("conclusion", e.target.value)}
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
                    <Button size="sm" className="w-full" onClick={() => handleUseTemplate(t.id)}>
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
