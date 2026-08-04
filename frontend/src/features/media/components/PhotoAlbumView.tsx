import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  MoreHorizontal,
  Trash2,
  Edit,
  Lock,
  Users,
  Globe,
  Upload,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaGrid } from "./MediaGrid";
import { UploadZone } from "./UploadZone";
import {
  useAlbumPhotos,
  useDeleteAlbum,
  useUpdateAlbum,
} from "../hooks";
import type { PhotoAlbum, Media } from "@/types";

interface PhotoAlbumViewProps {
  album: PhotoAlbum;
  userId: string;
  onBack: () => void;
  onMediaClick?: (media: Media, index: number) => void;
  onUpload?: (files: File[]) => void;
  isUploading?: boolean;
}

const PRIVACY_ICONS = {
  everyone: Globe,
  friends: Users,
  only_me: Lock,
};

const PRIVACY_LABELS = {
  everyone: "Public",
  friends: "Friends",
  only_me: "Only Me",
};

export function PhotoAlbumView({
  album,
  userId,
  onBack,
  onMediaClick,
  onUpload,
  isUploading,
}: PhotoAlbumViewProps) {
  const [showUpload, setShowUpload] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(album.name);
  const [editDescription, setEditDescription] = useState(
    album.description || ""
  );

  const { data: photos = [], isLoading } = useAlbumPhotos(album.id);
  const deleteAlbum = useDeleteAlbum();
  const updateAlbum = useUpdateAlbum();

  const PrivacyIcon = PRIVACY_ICONS[album.privacy];

  const handleSaveEdit = async () => {
    await updateAlbum.mutateAsync({
      albumId: album.id,
      data: {
        name: editName,
        description: editDescription || undefined,
      },
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-background bg-gradient-to-br from-background via-background to-primary/5">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            {album.user_id === userId && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUpload(!showUpload)}
                >
                  {showUpload ? (
                    <>Close</>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Add Photos
                    </>
                  )}
                </Button>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMenu(!showMenu)}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                  {showMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowMenu(false)}
                      />
                      <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl border bg-background shadow-xl">
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setShowMenu(false);
                          }}
                          className="flex w-full items-center gap-2 px-4 py-3 text-sm hover:bg-muted transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                          Edit Album
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to delete this album?"
                              )
                            ) {
                              deleteAlbum.mutate(album.id);
                              onBack();
                            }
                            setShowMenu(false);
                          }}
                          className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-muted transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Album
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {isEditing ? (
            <div className="space-y-4 rounded-2xl glass-card p-6">
              <h3 className="font-bold">Edit Album</h3>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Album name"
              />
              <input
                type="text"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Description (optional)"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={!editName.trim() || updateAlbum.isPending}
                >
                  {updateAlbum.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{album.name}</h1>
                <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1">
                  <PrivacyIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {PRIVACY_LABELS[album.privacy]}
                  </span>
                </div>
              </div>
              {album.description && (
                <p className="mt-2 text-muted-foreground">{album.description}</p>
              )}
              <p className="mt-1 text-sm text-muted-foreground">
                {album.media_count} photo{album.media_count !== 1 ? "s" : ""}
              </p>
            </div>
          )}

          <AnimatePresence>
            {showUpload && onUpload && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <UploadZone
                  onUpload={onUpload}
                  isUploading={isUploading}
                  accept={["image"]}
                  maxFiles={20}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <MediaGrid
            media={photos.map((p) => ({
              id: p.media_id,
              user_id: album.user_id,
              media_type: "image" as const,
              file_url: "",
              thumbnail_url: null,
              original_name: null,
              mime_type: null,
              file_size: null,
              width: null,
              height: null,
              duration: null,
              alt_text: null,
              caption: p.caption,
              cloudinary_public_id: null,
              is_processed: false,
              metadata_json: null,
              privacy: "everyone" as const,
              created_at: p.created_at,
              updated_at: p.created_at,
            }))}
            isLoading={isLoading}
            onClick={onMediaClick}
            isOwner={album.user_id === userId}
            emptyMessage="No photos in this album"
          />
        </motion.div>
      </div>
    </div>
  );
}
