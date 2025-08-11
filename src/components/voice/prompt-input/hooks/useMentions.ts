import { useState } from 'react';
import { MentionUser } from '../types';
import { DUMMY_USERS } from '../constants';

export const useMentions = () => {
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [selectionStart, setSelectionStart] = useState(0);

  const checkForMentions = (currentText: string, cursorPos: number) => {
    const textBeforeCursor = currentText.substring(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@([a-zA-Z0-9_]*)$/);

    if (mentionMatch) {
      const query = mentionMatch[1] || '';
      setMentionQuery(query);
      setShowMentionSuggestions(true);
    } else {
      setShowMentionSuggestions(false);
      setMentionQuery('');
    }
  };

  const filteredMentionUsers = DUMMY_USERS.filter(user =>
    user.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const insertMention = (
    user: MentionUser,
    currentText: string,
    onTextChange: (text: string) => void,
    onSelectionChange: (position: number) => void,
    focusInput?: () => void
  ) => {
    const cursorPos = selectionStart;
    const textBeforeCursor = currentText.substring(0, cursorPos);
    const textAfterCursor = currentText.substring(cursorPos);

    const mentionMatch = textBeforeCursor.match(/@([a-zA-Z0-9_]*)$/);
    if (mentionMatch) {
      const atPosition = mentionMatch.index!;
      const newText =
        currentText.substring(0, atPosition) +
        `@${user.username} ` +
        textAfterCursor;

      onTextChange(newText);
      setShowMentionSuggestions(false);
      setMentionQuery('');

      const newCursorPos = atPosition + user.username.length + 2;
      onSelectionChange(newCursorPos);

      setTimeout(() => {
        focusInput?.();
      }, 50);
    }
  };

  return {
    showMentionSuggestions,
    mentionQuery,
    selectionStart,
    filteredMentionUsers,
    setSelectionStart,
    checkForMentions,
    insertMention,
  };
};