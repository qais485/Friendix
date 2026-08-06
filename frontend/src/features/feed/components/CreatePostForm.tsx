import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Smile, MapPin, Clock, X, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import { useUploadToMedia } from "../hooks";
import { FEELING_TYPES, POST_VISIBILITY_OPTIONS } from "@/types";
import type { PostCreate } from "@/types";
import { TypeSelector, RichTextEditor, MediaPanel, PollPanel, BackgroundPicker, getPostBackgroundStyle } from "./composer";
import type { PollDuration } from "./composer";

interface CreatePostFormProps {
  onSubmit: (data: PostCreate) => void;
  isSubmitting?: boolean;
  userAvatar?: string | null;
  userName?: string | null;
}

type ComposerType = "text" | "image" | "video" | "poll";

const DURATION_MS: Record<Exclude<PollDuration, "off">, number> = {
  "1h": 60 * 60 * 1000,
  "6h": 6 * 60 * 60 * 1000,
  "12h": 12 * 60 * 60 * 1000,
  "1d": 24 * 60 * 60 * 1000,
  "3d": 3 * 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
};

export function CreatePostForm({
  onSubmit,
  isSubmitting,
  userAvatar,
  userName,
}: CreatePostFormProps) {
  const [content, setContent] = useState("");
  const [privacy, setPrivacy] = useState<"everyone" | "friends" | "only_me">("everyone");
  const [postType, setPostType] = useState<ComposerType>("text");
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollDuration, setPollDuration] = useState<PollDuration>("off");
  const [pollAnonymous, setPollAnonymous] = useState(false);
  const [showFeeling, setShowFeeling] = useState(false);
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [showLocation, setShowLocation] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [isDraft, setIsDraft] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [bgValue, setBgValue] = useState("none");
  const [bgCustomColor, setBgCustomColor] = useState<string | null>(null);
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string>("4:5");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState("");

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading } = useUploadToMedia();
  const { toast } = useToast();

  const isBackgroundMode = bgValue !== "none";

  const previewAspectClass = aspectRatio === "16:9" ? "sm:aspect-[16/9]"
    : aspectRatio === "1:1" ? "aspect-square"
    : aspectRatio === "9:16" ? "aspect-[9/16]"
    : "aspect-[4/5]";

  const handleAddPollOption = () => {
    if (pollOptions.length < 6) setPollOptions([...pollOptions, ""]);
  };

  const handleAddHashtag = () => {
    const tag = hashtagInput.trim().replace(/^#/, "");
    if (tag && !hashtags.includes(tag) && hashtags.length < 10) {
      setHashtags([...hashtags, tag]);
      setHashtagInput("");
    }
  };

  const handleRemoveHashtag = (tag: string) => {
    setHashtags(hashtags.filter((h) => h !== tag));
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length > 2) setPollOptions(pollOptions.filter((_, i) => i !== index));
  };

  const handlePollOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const handlePickMedia = (type: "image" | "video") => {
    setPostType(type);
    if (type === "image") imageInputRef.current?.click();
    else videoInputRef.current?.click();
  };

  const handleMediaFiles = async (files: File[], kind: "image" | "video") => {
    if (files.length === 0) return;
    try {
      const media = await upload(files);
      if (kind === "image") {
        setVideoUrl(null);
        setImageUrls((prev) => [...prev, ...media.map((m) => m.file_url)].slice(0, 6));
        setPostType("image");
      } else {
        setImageUrls([]);
        setVideoUrl(media[0]?.file_url || null);
        setPostType("video");
      }
    } catch {
      toast({ title: "Upload failed", description: "Failed to upload media. Please try again.", variant: "destructive" });
    }
  };

  const pollIsValid =
    postType === "poll" && pollQuestion.trim() !== "" && pollOptions.filter((o) => o.trim() !== "").length >= 2;

  const reset = () => {
    setContent(""); setPollQuestion(""); setPollOptions(["", ""]);
    setPollDuration("off"); setPollAnonymous(false); setSelectedFeeling(null);
    setLocationName(""); setScheduledAt("");
    setShowFeeling(false); setShowLocation(false); setShowSchedule(false);
    setIsDraft(false); setPostType("text"); setImageUrls([]); setVideoUrl(null);
    setBgValue("none"); setBgCustomColor(null); setBgImageUrl(null); setAspectRatio("4:5");
    setHashtags([]); setHashtagInput("");
  };

  const handleSubmit = () => {
    const hasContent = content.trim().replace(/<[^>]*>/g, "").length > 0;
    if (!hasContent && !pollIsValid && imageUrls.length === 0 && !videoUrl) return;
    const data: PostCreate = {
      content: hasContent ? content.trim() : undefined,
      privacy,
      post_type: postType,
      is_draft: isDraft,
    };
    if (imageUrls.length > 0) {
      data.image_urls = imageUrls;
      data.post_type = "image";
    }
    if (videoUrl) {
      data.video_url = videoUrl;
      data.post_type = "video";
    }
    if (showSchedule && scheduledAt) { data.is_scheduled = true; data.scheduled_at = scheduledAt; }
    if (selectedFeeling) {
      const feeling = FEELING_TYPES.find((f) => f.value === selectedFeeling);
      if (feeling) { data.feeling_type = feeling.value; data.feeling_text = feeling.label; }
    }
    if (showLocation && locationName.trim()) data.location_name = locationName.trim();
    if (bgValue !== "none") {
      data.background_style = bgValue === "custom" ? bgCustomColor || "" : bgValue;
      if (bgValue === "custom-image" && bgImageUrl) {
        data.background_image_url = bgImageUrl;
      }
      data.aspect_ratio = aspectRatio;
    }
    if (hashtags.length > 0) {
      data.hashtags = hashtags;
    }
    if (pollIsValid) {
      const endsAt =
        pollDuration !== "off"
          ? new Date(Date.now() + DURATION_MS[pollDuration]).toISOString()
          : undefined;
      data.poll = {
        question: pollQuestion.trim(),
        options: pollOptions.filter((o) => o.trim() !== "").map((text) => ({ text: text.trim() })),
        ends_at: endsAt,
        is_anonymous: pollAnonymous,
      };
      data.post_type = "poll";
    }
    onSubmit(data);
    reset();
  };

  const hasContent = content.trim().replace(/<[^>]*>/g, "").length > 0;
  const charCount = content.trim().replace(/<[^>]*>/g, "").length;
  const maxChars = 5000;
  const canSubmit =
    isSubmitting || isUploading || (!hasContent && !pollIsValid && imageUrls.length === 0 && !videoUrl);

  const bgStyle = getPostBackgroundStyle(bgValue, bgCustomColor, bgImageUrl);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "rounded-2xl glass-card",
        isBackgroundMode ? "" : "overflow-hidden"
      )}
    >
      <AnimatePresence mode="wait">
        {isBackgroundMode ? (
          <motion.div
            key="background-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Background Mode - Facebook Style */}
            <div
              className={cn("relative flex flex-col items-center justify-center p-8", previewAspectClass)}
              style={bgStyle.style}
            >
              {/* Top bar */}
              <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-4 pt-3">
                <div className="flex items-center gap-3">
                  {userAvatar ? (
                    <OptimizedImage
                      src={userAvatar}
                      alt={userName || "User"}
                      preset="avatar"
                      eager
                      className="h-9 w-9 rounded-full object-cover ring-2 ring-white/30"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm font-semibold text-white ring-2 ring-white/30">
                      {userName?.charAt(0) || "U"}
                    </div>
                  )}
                  <span className="text-sm font-semibold text-white drop-shadow">{userName || "User"}</span>
                </div>
                <BackgroundPicker
                  value={bgValue}
                  customColor={bgCustomColor}
                  backgroundImageUrl={bgImageUrl}
                  onChange={setBgValue}
                  onCustomColorChange={setBgCustomColor}
                  onBackgroundImageChange={setBgImageUrl}
                />
                {isBackgroundMode && (
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="flex h-7 items-center rounded-full border border-white/20 bg-white/10 px-2 text-[10px] text-white outline-none backdrop-blur-sm"
                    aria-label="Aspect ratio"
                  >
                    <option value="4:5">4:5</option>
                    <option value="16:9">16:9</option>
                    <option value="1:1">1:1</option>
                    <option value="9:16">9:16</option>
                  </select>
                )}
              </div>

              {/* Centered text */}
              <div className="w-full max-w-md px-4 pt-12">
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="What's on your mind?"
                  backgroundMode
                />
              </div>

              {/* Bottom bar */}
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 pb-3 pt-8">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full text-xs text-white/80 hover:bg-white/20 hover:text-white"
                    onClick={() => setShowFeeling(!showFeeling)}
                  >
                    <Smile className="h-3.5 w-3.5 mr-1" /> Feeling
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full text-xs text-white/80 hover:bg-white/20 hover:text-white"
                    onClick={() => setShowLocation(!showLocation)}
                  >
                    <MapPin className="h-3.5 w-3.5 mr-1" /> Location
                  </Button>
                </div>
                <label htmlFor="privacy-select-bg" className="sr-only">Post visibility</label>
                <select
                  id="privacy-select-bg"
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value as typeof privacy)}
                  className="flex h-7 items-center rounded-full border border-white/20 bg-white/10 px-2 text-[10px] text-white outline-none backdrop-blur-sm"
                >
                  {POST_VISIBILITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Feeling/Location popups in background mode */}
            {showFeeling && (
              <div className="border-t bg-card p-2">
                <div className="grid grid-cols-5 gap-1">
                  {FEELING_TYPES.map((feeling) => (
                    <button
                      key={feeling.value}
                      onClick={() => { setSelectedFeeling(feeling.value); setShowFeeling(false); }}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-xl p-2 text-xs transition-colors hover:bg-muted",
                        selectedFeeling === feeling.value && "bg-primary/10"
                      )}
                    >
                      <span className="text-lg">{feeling.emoji}</span>
                      <span>{feeling.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {showLocation && (
              <div className="border-t bg-card p-2">
                <input
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Add location..."
                  className="w-full rounded-xl border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            )}

            {/* Hashtags (background mode) */}
            <div className="border-t bg-card p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-white/70" />
                <span className="text-xs font-medium text-white/70">Hashtags</span>
              </div>
              {hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white"
                    >
                      #{tag}
                      <button onClick={() => handleRemoveHashtag(tag)} className="ml-0.5 rounded-full p-0.5 hover:bg-white/30">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddHashtag(); } }}
                  placeholder="Add hashtag..."
                  className="flex-1 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/50"
                  maxLength={30}
                />
                <Button variant="ghost" size="sm" onClick={handleAddHashtag} disabled={!hashtagInput.trim() || hashtags.length >= 10} className="text-white hover:bg-white/20">
                  Add
                </Button>
              </div>
            </div>

            {/* Submit bar */}
            <div className="flex items-center justify-end gap-2 border-t bg-card px-4 py-3">
              {hasContent && (
                <span className={`text-xs mr-auto ${charCount > maxChars ? 'text-destructive' : charCount > maxChars * 0.9 ? 'text-yellow-500' : 'text-muted-foreground'}`}>
                  {charCount.toLocaleString()}/{maxChars.toLocaleString()}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => { setIsDraft(true); handleSubmit(); }}
                disabled={canSubmit}
              >
                Save Draft
              </Button>
              <Button
                size="sm"
                className="rounded-full px-5"
                onClick={() => { setIsDraft(false); handleSubmit(); }}
                disabled={canSubmit}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-1.5" />
                    {showSchedule && scheduledAt ? "Schedule" : "Post"}
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="normal-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Normal Mode */}
            <div className="flex gap-3 p-4">
              {userAvatar ? (
                <OptimizedImage
                  src={userAvatar}
                  alt={userName || "User"}
                  preset="avatar"
                  eager
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                  {userName?.charAt(0) || "U"}
                </div>
              )}
              <div className="flex-1 space-y-3">
                <RichTextEditor content={content} onChange={setContent} />

                <div className="border-t pt-3">
                  <TypeSelector
                    activeType={postType}
                    onSelect={setPostType}
                    onPickMedia={handlePickMedia}
                  />
                </div>

                {postType === "image" && (
                  <MediaPanel
                    kind="image"
                    imageUrls={imageUrls}
                    videoUrl={videoUrl}
                    isUploading={isUploading}
                    onFiles={(files) => handleMediaFiles(files, "image")}
                    onPick={() => imageInputRef.current?.click()}
                    onRemoveImage={(index) => setImageUrls((prev) => prev.filter((_, i) => i !== index))}
                    onClearVideo={() => setVideoUrl(null)}
                  />
                )}

                {postType === "video" && (
                  <MediaPanel
                    kind="video"
                    imageUrls={imageUrls}
                    videoUrl={videoUrl}
                    isUploading={isUploading}
                    onFiles={(files) => handleMediaFiles(files, "video")}
                    onPick={() => videoInputRef.current?.click()}
                    onRemoveImage={() => undefined}
                    onClearVideo={() => setVideoUrl(null)}
                  />
                )}

                {postType === "poll" && (
                  <PollPanel
                    question={pollQuestion}
                    options={pollOptions}
                    duration={pollDuration}
                    anonymous={pollAnonymous}
                    onChangeQuestion={setPollQuestion}
                    onChangeOption={handlePollOptionChange}
                    onAddOption={handleAddPollOption}
                    onRemoveOption={handleRemovePollOption}
                    onChangeDuration={setPollDuration}
                    onChangeAnonymous={setPollAnonymous}
                  />
                )}

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    handleMediaFiles(Array.from(e.target.files || []), "image");
                    e.target.value = "";
                  }}
                />
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    handleMediaFiles(Array.from(e.target.files || []), "video");
                    e.target.value = "";
                  }}
                />

                {selectedFeeling && (
                  <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground">
                    <span>
                      {FEELING_TYPES.find((f) => f.value === selectedFeeling)?.emoji} is feeling{" "}
                      <span className="font-medium text-foreground">{FEELING_TYPES.find((f) => f.value === selectedFeeling)?.label}</span>
                    </span>
                    <button onClick={() => setSelectedFeeling(null)} className="ml-1 rounded-full p-0.5 hover:bg-muted">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {showLocation && locationName && (
                  <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{locationName}</span>
                    <button onClick={() => { setShowLocation(false); setLocationName(""); }} className="ml-1 rounded-full p-0.5 hover:bg-muted">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1 border-t px-4 py-3">
              <Button variant="ghost" size="sm" className="rounded-full text-xs text-muted-foreground" onClick={() => setShowFeeling(!showFeeling)}>
                <Smile className="h-3.5 w-3.5 mr-1" /> Feeling
              </Button>
              <Button variant="ghost" size="sm" className="rounded-full text-xs text-muted-foreground" onClick={() => setShowLocation(!showLocation)}>
                <MapPin className="h-3.5 w-3.5 mr-1" /> Location
              </Button>
              <Button variant="ghost" size="sm" className="rounded-full text-xs text-muted-foreground" onClick={() => setShowSchedule(!showSchedule)}>
                <Clock className="h-3.5 w-3.5 mr-1" /> Schedule
              </Button>
              <BackgroundPicker
                value={bgValue}
                customColor={bgCustomColor}
                backgroundImageUrl={bgImageUrl}
                onChange={setBgValue}
                onCustomColorChange={setBgCustomColor}
                onBackgroundImageChange={setBgImageUrl}
              />
              {isBackgroundMode && (
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="flex h-8 items-center gap-1 rounded-lg border bg-transparent px-2 text-xs text-muted-foreground outline-none"
                  aria-label="Aspect ratio"
                >
                  <option value="4:5">4:5</option>
                  <option value="16:9">16:9</option>
                  <option value="1:1">1:1</option>
                  <option value="9:16">9:16</option>
                </select>
              )}
              <div className="flex-1" />
              <label htmlFor="privacy-select" className="sr-only">Post visibility</label>
              <select
                id="privacy-select"
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value as typeof privacy)}
                className="flex h-8 items-center gap-1 rounded-lg border bg-transparent px-2 text-xs text-muted-foreground outline-none"
              >
                {POST_VISIBILITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {showFeeling && (
              <div className="border-t px-4 py-2">
                <div className="grid grid-cols-5 gap-1">
                  {FEELING_TYPES.map((feeling) => (
                    <button
                      key={feeling.value}
                      onClick={() => { setSelectedFeeling(feeling.value); setShowFeeling(false); }}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-xl p-2 text-xs transition-colors hover:bg-muted",
                        selectedFeeling === feeling.value && "bg-primary/10"
                      )}
                    >
                      <span className="text-lg">{feeling.emoji}</span>
                      <span>{feeling.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showLocation && (
              <div className="border-t px-4 py-2">
                <input
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Add location..."
                  className="w-full rounded-xl border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            )}

            {showSchedule && (
              <div className="border-t px-4 py-2">
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full rounded-xl border bg-transparent px-3 py-2 text-sm outline-none"
                />
              </div>
            )}

            {/* Hashtags */}
            <div className="border-t px-4 py-3 space-y-2">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Hashtags</span>
              </div>
              {hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                    >
                      #{tag}
                      <button onClick={() => handleRemoveHashtag(tag)} className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddHashtag(); } }}
                  placeholder="Add hashtag..."
                  className="flex-1 rounded-xl border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
                  maxLength={30}
                />
                <Button variant="outline" size="sm" onClick={handleAddHashtag} disabled={!hashtagInput.trim() || hashtags.length >= 10}>
                  Add
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
              {hasContent && (
                <span className={`text-xs mr-auto ${charCount > maxChars ? 'text-destructive' : charCount > maxChars * 0.9 ? 'text-yellow-500' : 'text-muted-foreground'}`}>
                  {charCount.toLocaleString()}/{maxChars.toLocaleString()}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => { setIsDraft(true); handleSubmit(); }}
                disabled={canSubmit}
              >
                Save Draft
              </Button>
              <Button
                size="sm"
                className="rounded-full px-5"
                onClick={() => { setIsDraft(false); handleSubmit(); }}
                disabled={canSubmit}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-1.5" />
                    {showSchedule && scheduledAt ? "Schedule" : "Post"}
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
