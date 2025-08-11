export const getWordCount = (text: string): number => {
  return text
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0).length;
};

export const shouldShowEnhanceButton = (text: string): boolean => {
  const wordCount = getWordCount(text);
  return wordCount > 0 && wordCount <= 100;
};