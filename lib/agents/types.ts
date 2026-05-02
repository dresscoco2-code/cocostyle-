export type StyleAnalystResult = {
  name: string;
  color: string;
  style: string;
  occasion: string;
  tip: string;
};

export type SkinToneResult = {
  skinTone: string;
  undertone: string;
  bestColors: string[];
};

export type OutfitBuilderResult = {
  title: string;
  items: string[];
  rationale: string;
};
