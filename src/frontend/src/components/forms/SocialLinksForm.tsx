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
// Correcting the import path to match the file structure
import { SocialLink, useResumeStore } from "../../store/useResumeStore";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { createSocialHandler } from "@/lib/socialHandler";
import { isBackendId } from "@/lib/utils";

// Asumsi tipe SocialLink sudah benar-benar sesuai dengan definisi Anda.
// lid?: number; // local-only
// id: number; // nat

const socialPlatforms = [
  {
    name: "LinkedIn",
    icon: Linkedin,
    placeholder: "https://linkedin.com/in/yourprofile",
  },
  {
    name: "GitHub",
    icon: Github,
    placeholder: "https://github.com/yourusername",
  },
  {
    name: "Twitter",
    icon: Twitter,
    placeholder: "https://twitter.com/yourusername",
  },
  { name: "Website", icon: Globe, placeholder: "https://yourwebsite.com" },
  {
    name: "Instagram",
    icon: Instagram,
    placeholder: "https://instagram.com/yourusername",
  },
  {
    name: "Facebook",
    icon: Facebook,
    placeholder: "https://facebook.com/yourusername",
  },
];

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

  // Menggunakan angka acak untuk id dan lid sementara, konsisten dengan tipe `number`
  const [newLink, setNewLink] = useState<SocialLink>({
    lid: Date.now() + Math.floor(Math.random() * 1000),
    id: 0, // ID sementara yang akan diganti oleh backend
    platform: "",
    url: "",
  });

  const [showEdit, setShowEdit] = useState<number | null>(null);

  const { toast } = useToast();

  const handleAddLink = async () => {
    try {
      const socialLink = { ...newLink };

      addSocialLink(socialLink);

      setNewLink({ id: 0, lid: Date.now() + Math.floor(Math.random() * 1000), platform: "", url: "" });

      toast({
        title: "Success",
        description: `${newLink.platform} Social link added.`,
      });

      const addedSocialLink = await socialHandler.clientAdd({
        lid: socialLink.lid as number,
        socialLink: { platform: socialLink.platform, url: socialLink.url },
      });

      updateSocialLinkId({
        lid: addedSocialLink.lid as number,
        id: addedSocialLink.id as number,
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

  const handleRemoveLink = async ({ id }: { id: number }) => {
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

  const handleEditLink = ({ id }: { id: number }) => {
    if (showEdit) {
      const unsavedLink = resumeData.socialLinks.find(link => link.id === showEdit);

      if (unsavedLink) {
        handleUpdateLink({ socialLink: unsavedLink });
      }
    }

    setShowEdit(id);
  };

  const renderLink = ({ link }: { link: SocialLink }) => {
    if (showEdit !== link.id) {
      return <div className="text-sm text-gray-600 truncate">{link.url}</div>;
    }

    return (
      <Input
        id="socialUrl"
        value={link.url}
        onChange={(e) => updateSocialLink(link.id, { url: e.target.value })}
        placeholder={
          socialPlatforms.find((platform) => platform.name === link.platform)
            ?.placeholder || "https://example.com/yourprofile"
        }
        required
      />
    );
  };

  const renderActionButton = ({ link }: { link: SocialLink }) => {
    let primaryAction = (
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleEditLink({ id: link.id })}
        disabled={!isBackendId(link.id)}
      >
        Edit
      </Button>
    );

    if (showEdit === link.id) {
      primaryAction = (
        <Button variant="outline" size="sm" onClick={() => handleUpdateLink({ socialLink: link })}>
          <Save className="w-4 h-4" />
          Save
        </Button>
      );
    }

    return (
      <div
        className={`flex items-center space-x-3 ${showEdit === link.id ? "mt-5" : ""
          }`}
      >
        {primaryAction}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleRemoveLink({ id: link.id })}
          className="text-red-600 hover:text-red-700"
          disabled={!isBackendId(link.id)}
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
          const IconComponent = getPlatformIcon(link.platform);
          return (
            <div
              key={link.id}
              className="flex items-center space-x-3 p-3 border rounded-lg"
            >
              <IconComponent className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <div className="font-medium text-sm">{link.platform}</div>
                {renderLink({ link: link })}
              </div>
              {renderActionButton({ link: link })}
            </div>
          );
        })}

        {/* Add New Social Link */}
        <div className="space-y-3 p-4 border-2 border-dashed border-gray-200 rounded-lg">
          <Label>Add New Social Link</Label>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddLink();
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-3"
          >
            <div>
              <Label htmlFor="platform">Platform</Label>
              <select
                id="platform"
                value={newLink.platform}
                onChange={(e) =>
                  setNewLink({ ...newLink, platform: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled hidden>
                  Select Platform
                </option>
                {socialPlatforms.map((platform) => {
                  const isAlreadyExists = resumeData.socialLinks.find(
                    (currentLink) => currentLink.platform === platform.name
                  );

                  if (isAlreadyExists) {
                    return;
                  }

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
                onChange={(e) =>
                  setNewLink({ ...newLink, url: e.target.value })
                }
                placeholder={
                  socialPlatforms.find((p) => p.name === newLink.platform)
                    ?.placeholder || "https://example.com/yourprofile"
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
