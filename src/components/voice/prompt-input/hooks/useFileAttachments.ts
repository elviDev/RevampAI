import { useState } from 'react';
import {
  pick,
  types,
} from '@react-native-documents/picker';
import {
  launchImageLibrary,
  ImagePickerResponse,
  MediaType,
} from 'react-native-image-picker';
import { AttachedFile } from '../types';

export const useFileAttachments = (
  onAttachFile?: (file: any) => void,
  onAttachImage?: (image: any) => void
) => {
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);

  const attachFile = async () => {
    try {
      const result = await pick({
        type: [types.allFiles],
        allowMultiSelection: false,
      });

      if (result) {
        setAttachedFiles(prev => [...prev, ...result]);
        if (onAttachFile && result[0]) {
          onAttachFile(result[0]);
        }
      }
    } catch (error) {
      console.log('File picker error:', error);
    }
  };

  const attachImage = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.assets && response.assets[0]) {
        const image = response.assets[0];
        setAttachedFiles(prev => [...prev, image]);
        if (onAttachImage) {
          onAttachImage(image);
        }
      }
    });
  };

  const removeAttachment = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return {
    attachedFiles,
    showAttachmentModal,
    setAttachedFiles,
    setShowAttachmentModal,
    attachFile,
    attachImage,
    removeAttachment,
  };
};