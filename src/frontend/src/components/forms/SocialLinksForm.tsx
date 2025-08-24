"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Share2,
  Plus,
  Trash2,
  Linkedin,
  Github,
  Twitter,
  Globe,
  Instagram,
  Facebook,
  Save,
} from "lucide-react";
import { SocialLink, useResumeStore } from "@/store/useResumeStore";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { createSocialHandler } from "@/lib/socialHandler";

const socialPlatforms = [
  { name: "LinkedIn", icon: Linkedin, placeholder: "https://linkedin.com/in/yourprofile" },
  { name: "GitHub", icon: Github, placeholder: "https://github.com/yourusername" },
  { name: "Twitter", icon: Twitter, placeholder: "https://twitter.com/yourusername" },
  { name: "Website", icon: Globe, placeholder: "https://yourwebsite.com" },
  { name: "Instagram", icon: Instagram, placeholder: "https://instagram.com/yourusername" },
  { name: "Facebook", icon: Facebook, placeholder: "https://facebook.com/yourusername" },
] as const;

export const SocialLinksForm: React.FC = () => {
  const {
    resumeData,
    addSocialLink,
    setSocialLink,
    updateSocialLink,
    updateSocialLinkId,
    removeSocialLink,
    socialHandler,
  } = useResumeStore();

  const { socialLinks } = resumeData;
  const { toast } = useToast();
  const { authClient, isAuthenticated } = useAuth();

  const [newLink, setNewLink] = useState({
    lid: crypto.randomUUID(),
    id: crypto.randomUUID(),
    platform: "",
    url: "",
  });

  const [showEdit, setShowEdit] = useState(null);

  const { toast } = useToast();

  const handleAddLink = async () => {
    try {
      const socialLink = { ...newLink };

      addSocialLink(socialLink);

      setNewLink({ id: crypto.randomUUID(), lid: crypto.randomUUID(), platform: "", url: "" });

      toast({
        title: "Success",
        description: `${newLink.platform} Social link added.`,
      });

      const addedSocialLink = await socialHandler.clientAdd({
        lid: socialLink.lid,
        socialLink: socialLink,
      });

      updateSocialLinkId({
        lid: addedSocialLink.lid,
        id: addedSocialLink.id,
      });
    } catch (error) {
      toast({
        title: "An Error Occurred",
        description:
          error.message || "Something went wrong with the social service.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveLink = async ({ id }: { id: string }) => {
    try {
      removeSocialLink(id);

      toast({
        title: "Success",
        description: `Social link deleted.`,
      });

      await socialHandler.clientDelete({
        id: id,
      });
    } catch (error) {
      toast({
        title: "An Error Occurred",
        description:
          error.message || "Something went wrong with the social service.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateLink = async ({ socialLink }: { socialLink: SocialLink }) => {
    try {
      setShowEdit(null);

      toast({
        title: "Success",
        description: `Social link updated.`,
      });

      await socialHandler.clientUpdate({
        socialLink: socialLink
      });
    } catch (error) {
      toast({
        title: "An Error Occurred",
        description:
          error.message || "Something went wrong with the social service.",
        variant: "destructive",
      });
    }
  };

  const getPlatformIcon = (platform: string) => {
    const platformData = socialPlatforms.find((p) => p.name === platform);
    return platformData?.icon || Globe;
  };

  const handleAddLink = async () => {
    try {
      // Validasi sederhana
      if (!newLink.platform || !newLink.url) {
        toast({ title: "Missing fields", description: "Choose a platform and fill the URL.", variant: "destructive" });
        return;
      }

      // 1) Tambahkan ke lokal (optimistic)
      const lid = Date.now();
      addSocialLink({ lid, platform: newLink.platform, url: newLink.url } as Omit<SocialLink, "id">);

      // 2) Panggil backend
      if (socialHandler) {
        const saved = await socialHandler.clientAdd({
          lid,
          socialLink: { platform: newLink.platform, url: newLink.url }, // <-- HARUS dibungkus socialLink
        });
        updateSocialLinkId({ lid: saved.lid!, id: saved.id }); // saved.id number, saved.lid number
      }

      // 4) Reset form
      setNewLink({ platform: "", url: "" });
      toast({ title: "Success", description: `${newLink.platform} link added.` });
    } catch (error: any) {
      toast({
        title: "An Error Occurred",
        description: error?.message || "Something went wrong with the social service.",
        variant: "destructive",
      });
    }
  };

  // Ubah definisi:
  const handleRemoveLink = async (id: number) => {
    try {
      removeSocialLink(id);
      toast({ title: "Success", description: "Social link deleted." });

      if (socialHandler && id > 0) {
        await socialHandler.clientDelete({ id }); // handler tetap butuh objek
      }
    } catch (error: any) {
      toast({ title: "An Error Occurred", description: error?.message ?? "..." , variant: "destructive" });
    }
  };


  const handleUpdateLink = async (link: SocialLink) => {
    try {
      setShowEdit(null);
      toast({ title: "Success", description: `Social link updated.` });

      if (socialHandler && link.id > 0) {
        await socialHandler.clientUpdate({ socialLink: link });
      }
    } catch (error: any) {
      toast({
        title: "An Error Occurred",
        description: error?.message || "Something went wrong with the social service.",
        variant: "destructive",
      });
    }
  };

  const handleEditLink = (id: number) => {
    // Kalau sedang edit link lain, auto-save yang lama
    if (showEdit && showEdit !== id) {
      const unsaved = socialLinks.find((l) => l.id === showEdit);
      if (unsaved) void handleUpdateLink(unsaved);
    }
    setShowEdit(id);
  };

  const renderLink = (link: SocialLink) => {
    if (showEdit !== link.id) {
      return <div className="text-sm text-gray-600 truncate">{link.url}</div>;
    }
    return (
      <Input
        id="socialUrl"
        value={link.url}
        onChange={(e) => updateSocialLink(link.id, { url: e.target.value })}
        placeholder={
          socialPlatforms.find((p) => p.name === link.platform)?.placeholder ||
          "https://example.com/yourprofile"
        }
        required
      />
    );
  };

  const renderActionButton = (link: SocialLink) => {
    const canEditDelete = link.id > 0; // sudah punya id backend
    const isEditing = showEdit === link.id;

    return (
      <div className={`flex items-center space-x-3 ${isEditing ? "mt-5" : ""}`}>
        {isEditing ? (
          <Button variant="outline" size="sm" onClick={() => handleUpdateLink(link)}>
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={() => handleEditLink(link.id)} disabled={!canEditDelete}>
            Edit
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleRemoveLink(link.id)}
          className="text-red-600 hover:text-red-700"
          disabled={!canEditDelete}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Share2 className="w-5 h-5" />
          <span>Social Media Links</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Existing Social Links */}
        {socialLinks.map((link) => {
          const Icon = getPlatformIcon(link.platform);
          return (
            <div key={`${link.id}-${link.platform}`} className="flex items-center space-x-3 p-3 border rounded-lg">
              <Icon className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <div className="font-medium text-sm">{link.platform}</div>
                {renderLink(link)}
              </div>
              {renderActionButton(link)}
            </div>
          );
        })}

        {/* Add New Social Link */}
        <div className="space-y-3 p-4 border-2 border-dashed border-gray-200 rounded-lg">
          <Label>Add New Social Link</Label>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleAddLink();
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-3"
          >
            <div>
              <Label htmlFor="platform">Platform</Label>
              <select
                id="platform"
                value={newLink.platform}
                onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled hidden>
                  Select Platform
                </option>
                {socialPlatforms.map((platform) => {
                  const exists = socialLinks.some((l) => l.platform === platform.name);
                  if (exists) return null;
                  return (
                    <option key={platform.name} value={platform.name}>
                      {platform.name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <Label htmlFor="socialUrl">URL</Label>
              <Input
                id="socialUrl"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                placeholder={
                  socialPlatforms.find((p) => p.name === newLink.platform)?.placeholder ||
                  "https://example.com/yourprofile"
                }
                required
              />
            </div>

            <div className="flex items-end">
              <Button type="submit" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Link
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};
