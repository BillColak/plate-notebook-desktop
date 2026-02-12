
import { CaptionPlugin } from "@platejs/caption/react";
import {
  AudioPlugin,
  FilePlugin,
  ImagePlugin,
  MediaEmbedPlugin,
  PlaceholderPlugin,
  VideoPlugin,
} from "@platejs/media/react";
import { KEYS } from "platejs";

import { AudioElement } from "@/features/editor/nodes/media-audio-node";
import { MediaEmbedElement } from "@/features/editor/nodes/media-embed-node";
import { FileElement } from "@/features/editor/nodes/media-file-node";
import { ImageElement } from "@/features/editor/nodes/media-image-node";
import { PlaceholderElement } from "@/features/editor/nodes/media-placeholder-node";
import { MediaPreviewDialog } from "@/features/editor/nodes/media-preview-dialog";
import { MediaUploadToast } from "@/features/editor/nodes/media-upload-toast";
import { VideoElement } from "@/features/editor/nodes/media-video-node";

export const MediaKit = [
  ImagePlugin.configure({
    options: { disableUploadInsert: true },
    render: { afterEditable: MediaPreviewDialog, node: ImageElement },
  }),
  MediaEmbedPlugin.withComponent(MediaEmbedElement),
  VideoPlugin.withComponent(VideoElement),
  AudioPlugin.withComponent(AudioElement),
  FilePlugin.withComponent(FileElement),
  PlaceholderPlugin.configure({
    options: { disableEmptyPlaceholder: true },
    render: { afterEditable: MediaUploadToast, node: PlaceholderElement },
  }),
  CaptionPlugin.configure({
    options: {
      query: {
        allow: [KEYS.img, KEYS.video, KEYS.audio, KEYS.file, KEYS.mediaEmbed],
      },
    },
  }),
];
