"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"] });
const inter = Inter({ subsets: ["latin"] });

const typingPhrases = [
  "Dress Smarter.",
  "Look Stunning.",
  "Feel Confident.",
  "Every Single Day.",
];

const sparkleDots = [
  { top: "8%", left: "8%", delay: "0s" },
  { top: "12%", left: "20%", delay: "0.2s" },
  { top: "18%", left: "35%", delay: "0.4s" },
  { top: "9%", left: "52%", delay: "0.6s" },
  { top: "20%", left: "68%", delay: "0.8s" },
  { top: "14%", left: "82%", delay: "1s" },
  { top: "24%", left: "92%", delay: "1.2s" },
  { top: "36%", left: "10%", delay: "1.4s" },
  { top: "42%", left: "24%", delay: "1.6s" },
  { top: "48%", left: "38%", delay: "1.8s" },
  { top: "40%", left: "55%", delay: "2s" },
  { top: "52%", left: "70%", delay: "2.2s" },
  { top: "46%", left: "88%", delay: "2.4s" },
  { top: "66%", left: "9%", delay: "2.6s" },
  { top: "72%", left: "22%", delay: "2.8s" },
  { top: "78%", left: "40%", delay: "3s" },
  { top: "70%", left: "56%", delay: "3.2s" },
  { top: "82%", left: "72%", delay: "3.4s" },
  { top: "74%", left: "86%", delay: "3.6s" },
  { top: "88%", left: "94%", delay: "3.8s" },
];

type SkinToneKey = "fair" | "medium" | "golden" | "brown" | "deep" | "rich";
type WeatherKey = "hot" | "mild" | "cold" | "rainy";
type DemoCategory = "All" | "Fashion" | "Professional" | "Personal" | "Indian" | "Active" | "Time";
type DemoOccasionId =
  | "party"
  | "brunch"
  | "nightclub"
  | "beach"
  | "concert"
  | "moviedate"
  | "roadtrip"
  | "picnic"
  | "hiking"
  | "office"
  | "interview"
  | "presentation"
  | "businesslunch"
  | "networking"
  | "conference"
  | "firstday"
  | "casual"
  | "firstdate"
  | "datenight"
  | "anniversary"
  | "birthday"
  | "familydinner"
  | "graduation"
  | "farewell"
  | "wedding"
  | "babyshower"
  | "diwali"
  | "holi"
  | "eid"
  | "navratri"
  | "garba"
  | "sangeet"
  | "mehendi"
  | "reception"
  | "puja"
  | "cricket"
  | "gym"
  | "yoga"
  | "sports"
  | "running"
  | "swimming"
  | "morning"
  | "sunday"
  | "latenight"
  | "travel";

const skinToneMeta: Record<SkinToneKey, { label: string; color: string }> = {
  fair: { label: "Fair & Light", color: "#F5DEB3" },
  medium: { label: "Warm Medium", color: "#D4A76A" },
  golden: { label: "Golden Brown", color: "#C68642" },
  brown: { label: "Rich Brown", color: "#8D5524" },
  deep: { label: "Deep Brown", color: "#4A2912" },
  rich: { label: "Deep & Rich", color: "#2C1810" },
};

const occasionData = {
  Party: {
    icon: "🎉",
    name: "Bold Party Look",
    items: ["🎽 Navy Shirt", "👖 Dark Jeans", "👞 Brown Loafers", "⌚ Silver Watch"],
    why: "Navy blue creates stunning contrast against warm skin tones. Perfect for evening events.",
    score: "9.2/10",
  },
  Office: {
    icon: "💼",
    name: "Sharp Professional",
    items: ["👔 White Shirt", "👖 Black Trousers", "👞 Oxford Shoes", "💼 Brown Belt"],
    why: "Clean whites and neutrals project authority while flattering warm undertones.",
    score: "8.8/10",
  },
  Casual: {
    icon: "☀️",
    name: "Effortless Casual",
    items: ["👕 Beige Polo", "🩳 Chino Shorts", "👟 White Sneakers", "🕶️ Sunglasses"],
    why: "Earth tones are a natural complement to warm skin — relaxed yet polished.",
    score: "9.0/10",
  },
  "Date Night": {
    icon: "🌙",
    name: "Romantic Evening",
    items: ["🖤 Black Shirt", "👖 Dark Jeans", "👞 Chelsea Boots", "⌚ Gold Watch"],
    why: "All-dark creates mystery and sophistication — confidence for special evenings.",
    score: "9.4/10",
  },
  Wedding: {
    icon: "💍",
    name: "Elegant Formal",
    items: ["🤵 Cream Blazer", "👖 Beige Trousers", "👞 White Shoes", "👔 Silk Tie"],
    why: "Light tones against warm skin create an ethereal, elegant wedding look.",
    score: "9.1/10",
  },
};
type OccasionKey = keyof typeof occasionData;

const demoOccasions: Array<{
  id: DemoOccasionId;
  emoji: string;
  label: string;
  category: Exclude<DemoCategory, "All">;
}> = [
  { id: "party", emoji: "🎉", label: "Party", category: "Fashion" },
  { id: "brunch", emoji: "🥂", label: "Brunch", category: "Fashion" },
  { id: "nightclub", emoji: "🎵", label: "Night Club", category: "Fashion" },
  { id: "beach", emoji: "🏖️", label: "Beach", category: "Fashion" },
  { id: "concert", emoji: "🎸", label: "Concert", category: "Fashion" },
  { id: "moviedate", emoji: "🎬", label: "Movie Date", category: "Fashion" },
  { id: "roadtrip", emoji: "🚗", label: "Road Trip", category: "Fashion" },
  { id: "picnic", emoji: "🌿", label: "Picnic", category: "Fashion" },
  { id: "hiking", emoji: "🏔️", label: "Hiking", category: "Fashion" },
  { id: "office", emoji: "💼", label: "Office", category: "Professional" },
  { id: "interview", emoji: "⭐", label: "Job Interview", category: "Professional" },
  { id: "presentation", emoji: "📊", label: "Presentation", category: "Professional" },
  { id: "businesslunch", emoji: "🍽️", label: "Business Lunch", category: "Professional" },
  { id: "networking", emoji: "🤝", label: "Networking", category: "Professional" },
  { id: "conference", emoji: "🎤", label: "Conference", category: "Professional" },
  { id: "firstday", emoji: "🆕", label: "First Day Work", category: "Professional" },
  { id: "casual", emoji: "☀️", label: "Casual", category: "Personal" },
  { id: "firstdate", emoji: "💕", label: "First Date", category: "Personal" },
  { id: "datenight", emoji: "🌙", label: "Date Night", category: "Personal" },
  { id: "anniversary", emoji: "💍", label: "Anniversary", category: "Personal" },
  { id: "birthday", emoji: "🎂", label: "Birthday Party", category: "Personal" },
  { id: "familydinner", emoji: "👨‍👩‍👧", label: "Family Dinner", category: "Personal" },
  { id: "graduation", emoji: "🎓", label: "Graduation", category: "Personal" },
  { id: "farewell", emoji: "👋", label: "Farewell Party", category: "Personal" },
  { id: "wedding", emoji: "💒", label: "Wedding", category: "Personal" },
  { id: "babyshower", emoji: "👶", label: "Baby Shower", category: "Personal" },
  { id: "diwali", emoji: "🪔", label: "Diwali", category: "Indian" },
  { id: "holi", emoji: "🎨", label: "Holi", category: "Indian" },
  { id: "eid", emoji: "☪️", label: "Eid", category: "Indian" },
  { id: "navratri", emoji: "💃", label: "Navratri", category: "Indian" },
  { id: "garba", emoji: "🎭", label: "Garba Night", category: "Indian" },
  { id: "sangeet", emoji: "🎵", label: "Sangeet", category: "Indian" },
  { id: "mehendi", emoji: "🌸", label: "Mehendi", category: "Indian" },
  { id: "reception", emoji: "🎊", label: "Reception", category: "Indian" },
  { id: "puja", emoji: "🙏", label: "Puja/Temple", category: "Indian" },
  { id: "cricket", emoji: "🏏", label: "Cricket Match", category: "Indian" },
  { id: "gym", emoji: "💪", label: "Gym", category: "Active" },
  { id: "yoga", emoji: "🧘", label: "Yoga", category: "Active" },
  { id: "sports", emoji: "⚽", label: "Sports", category: "Active" },
  { id: "running", emoji: "🏃", label: "Running", category: "Active" },
  { id: "swimming", emoji: "🏊", label: "Swimming", category: "Active" },
  { id: "morning", emoji: "🌅", label: "Morning Routine", category: "Time" },
  { id: "sunday", emoji: "☕", label: "Sunday Lazy Day", category: "Time" },
  { id: "latenight", emoji: "🌙", label: "Late Night Out", category: "Time" },
  { id: "travel", emoji: "✈️", label: "Travel/Flight", category: "Time" },
];

const demoResults: Record<
  DemoOccasionId,
  {
    outfitName: string;
    items: { icon: string; name: string; reason: string }[];
    aiScore: string;
    skinMatch: string;
    occasionFit: string;
    colorHarmony: string;
    whyText: string;
  }
> = {
  party: {
    outfitName: "Bold Evening Look",
    items: [
      { icon: "👔", name: "Navy Blue Shirt", reason: "Perfect for warm skin tones" },
      { icon: "👖", name: "Dark Slim Jeans", reason: "Creates sharp contrast" },
      { icon: "👞", name: "Brown Leather Loafers", reason: "Earthy warmth matches skin" },
      { icon: "⌚", name: "Silver Watch", reason: "Adds elegance" },
    ],
    aiScore: "9.2",
    skinMatch: "9.5",
    occasionFit: "8.9",
    colorHarmony: "9.1",
    whyText:
      "Navy blue creates a powerful contrast against warm skin tones. The earth-tone shoes tie the warm undertones together beautifully.",
  },
  brunch: {
    outfitName: "Chic Brunch Look",
    items: [
      { icon: "👕", name: "Pastel Blue Shirt", reason: "Light and fresh" },
      { icon: "👖", name: "White Chinos", reason: "Clean and bright" },
      { icon: "👟", name: "Canvas Sneakers", reason: "Casual elegance" },
      { icon: "🕶️", name: "Sunglasses", reason: "Brunch essential" },
    ],
    aiScore: "8.9",
    skinMatch: "9.0",
    occasionFit: "9.1",
    colorHarmony: "8.8",
    whyText: "Light pastels create a fresh, effortless brunch aesthetic.",
  },
  nightclub: {
    outfitName: "Night Club Ready",
    items: [
      { icon: "🖤", name: "Black Fitted Shirt", reason: "Club-ready confidence" },
      { icon: "👖", name: "Black Jeans", reason: "Sleek monochrome" },
      { icon: "👞", name: "Chelsea Boots", reason: "Edge and style" },
      { icon: "⌚", name: "Gold Watch", reason: "Luxury accent" },
    ],
    aiScore: "9.5",
    skinMatch: "8.8",
    occasionFit: "9.8",
    colorHarmony: "9.2",
    whyText: "All-black commands attention and confidence in club settings.",
  },
  beach: {
    outfitName: "Beach Vibes",
    items: [
      { icon: "🎽", name: "White Linen Shirt", reason: "Breathable and bright" },
      { icon: "🩳", name: "Navy Shorts", reason: "Classic beach look" },
      { icon: "👡", name: "Flip Flops", reason: "Beach essential" },
      { icon: "🕶️", name: "Sunglasses", reason: "Sun protection with style" },
    ],
    aiScore: "9.0",
    skinMatch: "9.3",
    occasionFit: "9.4",
    colorHarmony: "8.8",
    whyText:
      "White and navy is the ultimate beach combination for all skin tones.",
  },
  concert: {
    outfitName: "Concert Ready",
    items: [
      { icon: "🎸", name: "Graphic Band Tee", reason: "Concert culture vibes" },
      { icon: "👖", name: "Black Ripped Jeans", reason: "Edgy and cool" },
      { icon: "👟", name: "High Top Sneakers", reason: "Standing all night comfort" },
      { icon: "🧢", name: "Cap", reason: "Casual cool accessory" },
    ],
    aiScore: "9.1",
    skinMatch: "8.7",
    occasionFit: "9.5",
    colorHarmony: "8.9",
    whyText:
      "Graphic tees and dark jeans are the ultimate concert outfit formula.",
  },
  moviedate: {
    outfitName: "Movie Night Look",
    items: [
      { icon: "👔", name: "Casual Button Shirt", reason: "Relaxed but put together" },
      { icon: "👖", name: "Dark Jeans", reason: "Versatile and smart" },
      { icon: "👟", name: "Clean White Sneakers", reason: "Fresh and modern" },
      { icon: "⌚", name: "Simple Watch", reason: "Subtle elegance" },
    ],
    aiScore: "8.8",
    skinMatch: "9.0",
    occasionFit: "8.9",
    colorHarmony: "8.7",
    whyText: "Smart casual hits the perfect note for a movie date.",
  },
  roadtrip: {
    outfitName: "Road Trip Comfort",
    items: [
      { icon: "👕", name: "Comfortable T-Shirt", reason: "All-day comfort" },
      { icon: "👖", name: "Jogger Pants", reason: "Long drive comfort" },
      { icon: "👟", name: "Slip-on Sneakers", reason: "Easy on and off" },
      { icon: "🧢", name: "Baseball Cap", reason: "Sun protection on the go" },
    ],
    aiScore: "8.5",
    skinMatch: "8.8",
    occasionFit: "9.2",
    colorHarmony: "8.3",
    whyText: "Comfort first for long drives without compromising style.",
  },
  picnic: {
    outfitName: "Picnic Perfect",
    items: [
      { icon: "👕", name: "Striped Polo Shirt", reason: "Playful and fresh" },
      { icon: "🩳", name: "Khaki Shorts", reason: "Outdoor comfort" },
      { icon: "👟", name: "Canvas Sneakers", reason: "Grass-friendly footwear" },
      { icon: "🌿", name: "Light Jacket", reason: "For breeze protection" },
    ],
    aiScore: "8.7",
    skinMatch: "9.1",
    occasionFit: "9.0",
    colorHarmony: "8.6",
    whyText:
      "Natural tones complement an outdoor picnic setting beautifully.",
  },
  hiking: {
    outfitName: "Trail Ready",
    items: [
      { icon: "🧥", name: "Moisture-Wicking Tee", reason: "Performance fabric" },
      { icon: "👖", name: "Hiking Pants", reason: "Durability and flexibility" },
      { icon: "👟", name: "Trail Shoes", reason: "Grip and ankle support" },
      { icon: "🧢", name: "Sun Hat", reason: "UV protection on trails" },
    ],
    aiScore: "9.3",
    skinMatch: "8.5",
    occasionFit: "9.8",
    colorHarmony: "8.7",
    whyText:
      "Function meets style on the trail with earth tones that blend naturally.",
  },
  office: {
    outfitName: "Sharp Professional",
    items: [
      { icon: "👔", name: "White Formal Shirt", reason: "Authority and clarity" },
      { icon: "👖", name: "Black Trousers", reason: "Timeless professional look" },
      { icon: "👞", name: "Oxford Shoes", reason: "Classic formal choice" },
      { icon: "💼", name: "Brown Leather Belt", reason: "Warms up the neutral palette" },
    ],
    aiScore: "8.8",
    skinMatch: "9.0",
    occasionFit: "9.2",
    colorHarmony: "8.5",
    whyText:
      "Clean whites and deep blacks create a striking professional silhouette. The brown belt adds warmth that complements your skin tone.",
  },
  interview: {
    outfitName: "Interview Winner",
    items: [
      { icon: "🤵", name: "Navy Blazer", reason: "Authority and trust" },
      { icon: "👔", name: "White Shirt", reason: "Clean and confident" },
      { icon: "👖", name: "Grey Trousers", reason: "Professional neutrals" },
      { icon: "👞", name: "Black Oxford Shoes", reason: "Formal perfection" },
    ],
    aiScore: "9.6",
    skinMatch: "9.2",
    occasionFit: "9.8",
    colorHarmony: "9.4",
    whyText:
      "Navy and white project competence and trustworthiness — perfect for interviews.",
  },
  presentation: {
    outfitName: "Boardroom Ready",
    items: [
      { icon: "🤵", name: "Charcoal Blazer", reason: "Authority and gravitas" },
      { icon: "👔", name: "Light Blue Shirt", reason: "Approachable confidence" },
      { icon: "👖", name: "Dark Trousers", reason: "Sharp and focused" },
      { icon: "👞", name: "Black Derby Shoes", reason: "Executive finish" },
    ],
    aiScore: "9.4",
    skinMatch: "9.1",
    occasionFit: "9.6",
    colorHarmony: "9.2",
    whyText:
      "Charcoal and light blue project leadership while remaining approachable.",
  },
  businesslunch: {
    outfitName: "Business Casual",
    items: [
      { icon: "👔", name: "Checked Shirt", reason: "Professional personality" },
      { icon: "👖", name: "Chino Trousers", reason: "Smart casual bridge" },
      { icon: "👞", name: "Loafers", reason: "Polished without stiff" },
      { icon: "⌚", name: "Classic Watch", reason: "Time is money" },
    ],
    aiScore: "8.9",
    skinMatch: "8.8",
    occasionFit: "9.1",
    colorHarmony: "8.8",
    whyText: "Business casual hits the perfect note for lunch meetings.",
  },
  networking: {
    outfitName: "Memorable First Impression",
    items: [
      { icon: "🤵", name: "Burgundy Blazer", reason: "Stand out memorably" },
      { icon: "👔", name: "White Shirt", reason: "Clean contrast" },
      { icon: "👖", name: "Black Trousers", reason: "Sharp foundation" },
      { icon: "👞", name: "Brown Brogues", reason: "Personality in footwear" },
    ],
    aiScore: "9.3",
    skinMatch: "9.0",
    occasionFit: "9.4",
    colorHarmony: "9.2",
    whyText:
      "Burgundy is a powerful statement colour that creates memorable impressions.",
  },
  conference: {
    outfitName: "Speaker Ready",
    items: [
      { icon: "🤵", name: "Dark Navy Suit", reason: "Stage presence" },
      { icon: "👔", name: "White Shirt", reason: "Camera-friendly contrast" },
      { icon: "👖", name: "Matching Trousers", reason: "Polished head to toe" },
      { icon: "👞", name: "Black Oxford Shoes", reason: "Professional authority" },
    ],
    aiScore: "9.5",
    skinMatch: "9.3",
    occasionFit: "9.7",
    colorHarmony: "9.4",
    whyText: "Navy suits photograph beautifully and command respect on stage.",
  },
  firstday: {
    outfitName: "New Chapter Look",
    items: [
      { icon: "👔", name: "Light Blue Shirt", reason: "Friendly and fresh" },
      { icon: "👖", name: "Grey Trousers", reason: "Neutral and safe" },
      { icon: "👞", name: "Brown Leather Shoes", reason: "Warm and approachable" },
      { icon: "⌚", name: "Simple Watch", reason: "Punctual professional" },
    ],
    aiScore: "9.0",
    skinMatch: "9.2",
    occasionFit: "9.3",
    colorHarmony: "8.9",
    whyText:
      "Light blue and grey project friendliness — perfect for meeting new colleagues.",
  },
  casual: {
    outfitName: "Effortless Weekend",
    items: [
      { icon: "🎽", name: "Beige Polo Shirt", reason: "Earth tones complement warm skin" },
      { icon: "🩳", name: "Chino Shorts", reason: "Relaxed and stylish" },
      { icon: "👟", name: "White Sneakers", reason: "Clean contrast pops nicely" },
      { icon: "🕶️", name: "Sunglasses", reason: "Completes the casual look" },
    ],
    aiScore: "9.0",
    skinMatch: "9.4",
    occasionFit: "8.8",
    colorHarmony: "9.0",
    whyText:
      "Beige and earth tones are a natural harmony with warm undertones. The white sneakers add a fresh contrast that keeps the look modern.",
  },
  firstdate: {
    outfitName: "First Impression Magic",
    items: [
      { icon: "👔", name: "Burgundy Shirt", reason: "Romantic and warm" },
      { icon: "👖", name: "Dark Slim Jeans", reason: "Modern and attractive" },
      { icon: "👞", name: "Brown Chelsea Boots", reason: "Stylish confidence" },
      { icon: "⌚", name: "Leather Watch", reason: "Thoughtful detail" },
    ],
    aiScore: "9.7",
    skinMatch: "9.4",
    occasionFit: "9.8",
    colorHarmony: "9.5",
    whyText:
      "Burgundy is deeply flattering on warm skin tones and signals romance.",
  },
  datenight: {
    outfitName: "Romantic & Mysterious",
    items: [
      { icon: "🖤", name: "All-Black Shirt", reason: "Confidence and mystery" },
      { icon: "👖", name: "Dark Jeans", reason: "Sleek monochrome effect" },
      { icon: "👞", name: "Chelsea Boots", reason: "Adds sophisticated edge" },
      { icon: "⌚", name: "Gold Watch", reason: "Warmth against dark palette" },
    ],
    aiScore: "9.4",
    skinMatch: "8.8",
    occasionFit: "9.6",
    colorHarmony: "9.2",
    whyText:
      "All-dark outfits create mystery and confidence for date nights. The gold watch warms up the look and beautifully complements warm skin undertones.",
  },
  anniversary: {
    outfitName: "Celebration Look",
    items: [
      { icon: "🤵", name: "Deep Blue Blazer", reason: "Special occasion presence" },
      { icon: "👔", name: "White Shirt", reason: "Classic romance" },
      { icon: "👖", name: "Dark Trousers", reason: "Elegant foundation" },
      { icon: "👞", name: "Patent Shoes", reason: "Celebration shine" },
    ],
    aiScore: "9.3",
    skinMatch: "9.1",
    occasionFit: "9.5",
    colorHarmony: "9.2",
    whyText: "Deep blue blazer elevates any occasion to feel truly special.",
  },
  birthday: {
    outfitName: "Birthday Star",
    items: [
      { icon: "✨", name: "Sequin Shirt", reason: "You are the celebration" },
      { icon: "👖", name: "Black Trousers", reason: "Let the top shine" },
      { icon: "👞", name: "Patent Loafers", reason: "Party-ready feet" },
      { icon: "⌚", name: "Statement Watch", reason: "Conversation starter" },
    ],
    aiScore: "9.2",
    skinMatch: "8.9",
    occasionFit: "9.5",
    colorHarmony: "9.0",
    whyText:
      "Metallics and sequins photograph beautifully and command birthday attention.",
  },
  familydinner: {
    outfitName: "Family Approved",
    items: [
      { icon: "👔", name: "Light Cotton Shirt", reason: "Respectful and comfortable" },
      { icon: "👖", name: "Chino Trousers", reason: "Smart but relaxed" },
      { icon: "👞", name: "Loafers", reason: "Comfortable for long dinners" },
      { icon: "⌚", name: "Classic Watch", reason: "Timeless and respected" },
    ],
    aiScore: "8.7",
    skinMatch: "9.0",
    occasionFit: "9.2",
    colorHarmony: "8.6",
    whyText: "Smart casual shows respect for family while staying comfortable.",
  },
  graduation: {
    outfitName: "Achievement Look",
    items: [
      { icon: "🤵", name: "Light Grey Suit", reason: "Celebratory and bright" },
      { icon: "👔", name: "White Shirt", reason: "Clean milestone energy" },
      { icon: "👖", name: "Matching Trousers", reason: "Complete formal look" },
      { icon: "👞", name: "White Oxford Shoes", reason: "Fresh achievement energy" },
    ],
    aiScore: "9.4",
    skinMatch: "9.2",
    occasionFit: "9.6",
    colorHarmony: "9.3",
    whyText:
      "Light grey suits photograph beautifully at graduation ceremonies.",
  },
  farewell: {
    outfitName: "Memorable Send-Off",
    items: [
      { icon: "👔", name: "Your Favourite Shirt", reason: "Be remembered as yourself" },
      { icon: "👖", name: "Best Fitting Jeans", reason: "Comfort in emotion" },
      { icon: "👟", name: "Favourite Sneakers", reason: "Walk away in style" },
      { icon: "⌚", name: "Meaningful Watch", reason: "A reminder of time together" },
    ],
    aiScore: "9.0",
    skinMatch: "9.0",
    occasionFit: "9.0",
    colorHarmony: "9.0",
    whyText: "Wear what makes you feel most like yourself for farewell moments.",
  },
  wedding: {
    outfitName: "Elegant & Radiant",
    items: [
      { icon: "🤵", name: "Cream Blazer", reason: "Ethereal against warm skin" },
      { icon: "👖", name: "Beige Trousers", reason: "Tonal elegance" },
      { icon: "👞", name: "White Oxford Shoes", reason: "Pristine formal finish" },
      { icon: "👔", name: "Silk Pocket Square", reason: "Luxury finishing touch" },
    ],
    aiScore: "9.1",
    skinMatch: "9.3",
    occasionFit: "9.0",
    colorHarmony: "9.2",
    whyText:
      "Light tones against warm skin create an ethereal, glowing wedding look. The tonal cream and beige palette is sophisticated and timeless.",
  },
  babyshower: {
    outfitName: "Soft & Celebratory",
    items: [
      { icon: "👕", name: "Pastel Pink Shirt", reason: "Soft celebration energy" },
      { icon: "👖", name: "White Chinos", reason: "Clean and fresh" },
      { icon: "👟", name: "White Sneakers", reason: "Comfortable for long events" },
      { icon: "🌸", name: "Floral Pocket Square", reason: "Celebratory touch" },
    ],
    aiScore: "8.8",
    skinMatch: "8.9",
    occasionFit: "9.2",
    colorHarmony: "8.7",
    whyText:
      "Soft pastels create a warm, celebratory atmosphere perfect for baby showers.",
  },
  diwali: {
    outfitName: "Festival of Lights",
    items: [
      { icon: "🧥", name: "Gold Embroidered Kurta", reason: "Festival grandeur" },
      { icon: "👖", name: "Ivory Churidar", reason: "Traditional elegance" },
      { icon: "👞", name: "Kolhapuri Sandals", reason: "Authentic Indian style" },
      { icon: "✨", name: "Gold Jewellery", reason: "Festival shine" },
    ],
    aiScore: "9.8",
    skinMatch: "9.7",
    occasionFit: "9.9",
    colorHarmony: "9.6",
    whyText:
      "Gold embroidery glows magnificently against warm Indian skin tones during Diwali.",
  },
  holi: {
    outfitName: "Holi Ready",
    items: [
      { icon: "👕", name: "Old White Kurta", reason: "Canvas for colours" },
      { icon: "👖", name: "White Pyjama", reason: "Traditional Holi wear" },
      { icon: "👡", name: "Simple Sandals", reason: "Easy to clean" },
      { icon: "🎨", name: "Waterproof Jacket", reason: "Colour protection" },
    ],
    aiScore: "9.5",
    skinMatch: "9.0",
    occasionFit: "9.9",
    colorHarmony: "9.2",
    whyText:
      "White is the traditional Holi choice — it becomes a beautiful canvas of colours.",
  },
  eid: {
    outfitName: "Eid Mubarak Look",
    items: [
      { icon: "🧥", name: "White Sherwani", reason: "Purity and celebration" },
      { icon: "👖", name: "Matching Churidar", reason: "Traditional elegance" },
      { icon: "👞", name: "Jutti Shoes", reason: "Authentic traditional style" },
      { icon: "🧢", name: "Taqiyah Cap", reason: "Respectful tradition" },
    ],
    aiScore: "9.7",
    skinMatch: "9.5",
    occasionFit: "9.9",
    colorHarmony: "9.6",
    whyText: "White sherwanis are the most elegant choice for Eid celebrations.",
  },
  navratri: {
    outfitName: "Navratri Colours",
    items: [
      { icon: "🧥", name: "Coloured Kurta", reason: "Match the day's colour" },
      { icon: "👖", name: "White Dhoti", reason: "Traditional foundation" },
      { icon: "👞", name: "Traditional Jutti", reason: "Authentic celebration" },
      { icon: "✨", name: "Matching Dupatta", reason: "Complete traditional look" },
    ],
    aiScore: "9.6",
    skinMatch: "9.4",
    occasionFit: "9.8",
    colorHarmony: "9.5",
    whyText:
      "Navratri colours change each day — CocoStyle matches the correct colour to your skin tone.",
  },
  garba: {
    outfitName: "Garba Night Glam",
    items: [
      { icon: "🧥", name: "Embroidered Kediyu", reason: "Traditional Garba wear" },
      { icon: "👖", name: "Churidar Pants", reason: "Freedom to dance" },
      { icon: "👞", name: "Mojdi Shoes", reason: "Traditional dance footwear" },
      { icon: "✨", name: "Mirror Work Belt", reason: "Garba tradition" },
    ],
    aiScore: "9.7",
    skinMatch: "9.5",
    occasionFit: "9.9",
    colorHarmony: "9.6",
    whyText:
      "Mirror work and embroidery catch the light beautifully during Garba dancing.",
  },
  sangeet: {
    outfitName: "Sangeet Night",
    items: [
      { icon: "🧥", name: "Coloured Sherwani", reason: "Festive and celebratory" },
      { icon: "👖", name: "Matching Churidar", reason: "Traditional elegance" },
      { icon: "👞", name: "Embroidered Jutti", reason: "Festive footwear" },
      { icon: "✨", name: "Brooch", reason: "Statement accessory" },
    ],
    aiScore: "9.5",
    skinMatch: "9.3",
    occasionFit: "9.7",
    colorHarmony: "9.4",
    whyText:
      "Bold sherwanis in jewel tones complement Indian skin beautifully at sangeet.",
  },
  mehendi: {
    outfitName: "Mehendi Morning",
    items: [
      { icon: "🧥", name: "Yellow Kurta", reason: "Traditional mehendi colour" },
      { icon: "👖", name: "White Pyjama", reason: "Easy to manage with mehendi" },
      { icon: "👡", name: "Simple Sandals", reason: "Mehendi-safe footwear" },
      { icon: "🌸", name: "Floral Dupatta", reason: "Festive feminine touch" },
    ],
    aiScore: "9.4",
    skinMatch: "9.2",
    occasionFit: "9.8",
    colorHarmony: "9.3",
    whyText:
      "Yellow is the most auspicious colour for mehendi and glows on Indian skin.",
  },
  reception: {
    outfitName: "Reception Grand",
    items: [
      { icon: "🤵", name: "Velvet Blazer", reason: "Reception grandeur" },
      { icon: "👔", name: "Silk Shirt", reason: "Luxurious texture" },
      { icon: "👖", name: "Formal Trousers", reason: "Complete formal look" },
      { icon: "👞", name: "Patent Leather Shoes", reason: "Grand occasion shine" },
    ],
    aiScore: "9.6",
    skinMatch: "9.4",
    occasionFit: "9.7",
    colorHarmony: "9.5",
    whyText:
      "Velvet and silk textures photograph magnificently at reception events.",
  },
  puja: {
    outfitName: "Devotional Look",
    items: [
      { icon: "🧥", name: "Cotton Kurta", reason: "Pure and respectful" },
      { icon: "👖", name: "White Pyjama", reason: "Traditional purity" },
      { icon: "👡", name: "Simple Sandals", reason: "Easy to remove at temple" },
      { icon: "🙏", name: "Tilak Ready", reason: "Complete devotional look" },
    ],
    aiScore: "9.2",
    skinMatch: "9.0",
    occasionFit: "9.8",
    colorHarmony: "9.1",
    whyText:
      "White and light colours show purity and respect during religious occasions.",
  },
  cricket: {
    outfitName: "Cricket Fan Look",
    items: [
      { icon: "👕", name: "Team Jersey", reason: "Show your team pride" },
      { icon: "👖", name: "Comfortable Jeans", reason: "Long match comfort" },
      { icon: "👟", name: "Sports Sneakers", reason: "Stadium walking comfort" },
      { icon: "🧢", name: "Team Cap", reason: "Cheer in style" },
    ],
    aiScore: "9.0",
    skinMatch: "8.5",
    occasionFit: "9.8",
    colorHarmony: "8.7",
    whyText:
      "Team colours unite fans — wear your team with pride and comfort.",
  },
  gym: {
    outfitName: "Gym Performance",
    items: [
      { icon: "🎽", name: "Dry-Fit T-Shirt", reason: "Sweat-wicking performance" },
      { icon: "🩳", name: "Athletic Shorts", reason: "Full range of motion" },
      { icon: "👟", name: "Training Shoes", reason: "Proper gym support" },
      { icon: "🧢", name: "Gym Cap", reason: "Focus and sweat control" },
    ],
    aiScore: "9.3",
    skinMatch: "8.5",
    occasionFit: "9.9",
    colorHarmony: "8.8",
    whyText:
      "Dark gym wear hides sweat while keeping you looking athletic and focused.",
  },
  yoga: {
    outfitName: "Yoga Flow",
    items: [
      { icon: "🎽", name: "Breathable Tank Top", reason: "Full movement freedom" },
      { icon: "👖", name: "Yoga Leggings", reason: "Stretch and flexibility" },
      { icon: "👡", name: "Yoga Socks", reason: "Grip without shoes" },
      { icon: "🧘", name: "Light Hoodie", reason: "Savasana warmth" },
    ],
    aiScore: "9.1",
    skinMatch: "8.7",
    occasionFit: "9.8",
    colorHarmony: "8.9",
    whyText:
      "Soft, breathable fabrics in calming colours enhance the yoga mindset.",
  },
  sports: {
    outfitName: "Game Day Ready",
    items: [
      { icon: "👕", name: "Sports Jersey", reason: "Team spirit" },
      { icon: "🩳", name: "Athletic Shorts", reason: "Performance movement" },
      { icon: "👟", name: "Sports Shoes", reason: "Performance and support" },
      { icon: "🧢", name: "Sports Cap", reason: "Focus and sun protection" },
    ],
    aiScore: "9.0",
    skinMatch: "8.4",
    occasionFit: "9.9",
    colorHarmony: "8.6",
    whyText:
      "Sport-specific clothing improves performance while showing team identity.",
  },
  running: {
    outfitName: "Morning Run",
    items: [
      { icon: "🎽", name: "Reflective Running Tee", reason: "Visibility and performance" },
      { icon: "🩳", name: "Running Shorts", reason: "Lightweight movement" },
      { icon: "👟", name: "Running Shoes", reason: "Cushioning and support" },
      { icon: "⌚", name: "Sports Watch", reason: "Track your progress" },
    ],
    aiScore: "9.4",
    skinMatch: "8.6",
    occasionFit: "9.9",
    colorHarmony: "8.8",
    whyText:
      "Bright colours for morning runs ensure visibility and boost energy.",
  },
  swimming: {
    outfitName: "Pool Ready",
    items: [
      { icon: "🩱", name: "Swim Shorts", reason: "Quick-dry performance" },
      { icon: "👡", name: "Pool Slippers", reason: "Non-slip safety" },
      { icon: "🕶️", name: "UV Sunglasses", reason: "Eye protection" },
      { icon: "🧴", name: "SPF Shirt", reason: "Skin protection" },
    ],
    aiScore: "8.8",
    skinMatch: "8.5",
    occasionFit: "9.8",
    colorHarmony: "8.6",
    whyText:
      "Bright swim wear against warm skin tones looks vibrant and fresh by the water.",
  },
  morning: {
    outfitName: "Rise & Shine",
    items: [
      { icon: "👕", name: "Comfortable Tee", reason: "Easy morning dressing" },
      { icon: "👖", name: "Jogger Pants", reason: "Morning comfort" },
      { icon: "👡", name: "House Slippers", reason: "Cozy morning feel" },
      { icon: "☕", name: "Coffee in Hand", reason: "Morning essential" },
    ],
    aiScore: "8.5",
    skinMatch: "8.8",
    occasionFit: "9.5",
    colorHarmony: "8.4",
    whyText:
      "Soft comfortable tones ease you into the morning with gentle energy.",
  },
  sunday: {
    outfitName: "Sunday Cozy",
    items: [
      { icon: "🧥", name: "Oversized Hoodie", reason: "Maximum Sunday comfort" },
      { icon: "👖", name: "Sweatpants", reason: "All-day relaxation" },
      { icon: "👡", name: "Fluffy Slippers", reason: "Ultimate cozy" },
      { icon: "☕", name: "Mug in Hand", reason: "Sunday essential" },
    ],
    aiScore: "8.3",
    skinMatch: "8.6",
    occasionFit: "9.7",
    colorHarmony: "8.2",
    whyText:
      "Soft neutral tones create the perfect cozy Sunday atmosphere.",
  },
  latenight: {
    outfitName: "After Midnight",
    items: [
      { icon: "🖤", name: "Black Leather Jacket", reason: "Night-time edge" },
      { icon: "👔", name: "Dark Shirt", reason: "Mysterious confidence" },
      { icon: "👖", name: "Black Jeans", reason: "Night-ready foundation" },
      { icon: "👞", name: "Black Boots", reason: "Complete dark look" },
    ],
    aiScore: "9.6",
    skinMatch: "8.9",
    occasionFit: "9.8",
    colorHarmony: "9.5",
    whyText:
      "All-dark leather looks command late-night venues with effortless confidence.",
  },
  travel: {
    outfitName: "Airport Chic",
    items: [
      { icon: "🧥", name: "Light Trench Coat", reason: "Style meets layering" },
      { icon: "👕", name: "Comfortable Tee", reason: "Long flight comfort" },
      { icon: "👖", name: "Stretch Jeans", reason: "Comfortable for hours" },
      { icon: "👟", name: "Slip-on Sneakers", reason: "Easy security checks" },
    ],
    aiScore: "9.0",
    skinMatch: "8.8",
    occasionFit: "9.5",
    colorHarmony: "8.9",
    whyText:
      "Neutral trench coats look stylish in any airport and work as a versatile layer.",
  },
};

const faqs = [
  {
    q: "Is my wardrobe data safe and private?",
    a: "Absolutely. Your photos and data are stored in private, encrypted cloud storage. Only you can see your wardrobe. We use bank-level security and you can delete everything anytime.",
  },
  {
    q: "What happens when I delete a clothing item?",
    a: "When you delete an item, it's immediately removed from future outfit suggestions. Your past outfit history is preserved but shows the item as 'removed'. You can add and delete clothes anytime.",
  },
  {
    q: "Does CocoStyle work for both men and women?",
    a: "Yes! CocoStyle works for everyone. Our AI understands fashion for all genders and suggests outfits based on your personal wardrobe, skin tone and occasion — not gender stereotypes.",
  },
  {
    q: "How accurate is the skin tone detection?",
    a: "Our AI has 98% accuracy in detecting skin tone and undertone from a clear photo. We detect 6 skin tones and 3 undertones (warm, cool, neutral) to give you the most personalised suggestions.",
  },
  {
    q: "Can I use CocoStyle without premium?",
    a: "Yes! Our free plan includes 50 clothing items and 3 outfit suggestions per day — completely free forever. Upgrade to premium for 150 items, unlimited suggestions and virtual try-on.",
  },
  {
    q: "What is the 7% donation about?",
    a: "Every month, 7% of CocoStyle's profits go directly to homeless shelters and elderly care homes. We publish full donation reports so you can see exactly how your subscription helps real people.",
  },
];

const testimonialsData: Array<[string, string, string, string, string]> = [
  [
    "P",
    "bg-[#e8a598]/30",
    "I used to spend 30 minutes every morning choosing what to wear. CocoStyle suggests the perfect outfit in seconds. My confidence has completely changed!",
    "Priya Sharma",
    "Mumbai, India",
  ],
  [
    "A",
    "bg-[#8b5cf6]/30",
    "Finally an app that actually understands my skin tone! The outfit suggestions are perfect for my complexion. I get compliments every single day now.",
    "Aisha Rahman",
    "London, UK",
  ],
  [
    "S",
    "bg-gradient-to-r from-[#e8a598]/30 to-[#8b5cf6]/30",
    "I love that it only uses clothes I already own. No pressure to buy anything. Just smart styling from my existing wardrobe. Absolutely brilliant!",
    "Arjun K",
    "Bangalore, India",
  ],
  [
    "E",
    "bg-[#e8a598]/30",
    "The virtual try-on feature blew my mind. I can see exactly how an outfit looks before wearing it. This is the future of fashion!",
    "Emma Thompson",
    "New York, USA",
  ],
];

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [showProductHunt, setShowProductHunt] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState<"EN" | "HI">("EN");
  const [selectedSkin, setSelectedSkin] = useState<SkinToneKey>("medium");
  const [selectedDemoOccasion, setSelectedDemoOccasion] = useState<DemoOccasionId>("party");
  const [selectedWeather, setSelectedWeather] = useState<WeatherKey>("mild");
  const [selectedCategory, setSelectedCategory] = useState<DemoCategory>("All");
  const [activeTab, setActiveTab] = useState<"tab1" | "tab2" | "tab3">("tab1");
  const [eventInput, setEventInput] = useState("");
  const [eventLoading, setEventLoading] = useState(false);
  const [eventLoadingMessage, setEventLoadingMessage] = useState(0);
  const [eventShowResult, setEventShowResult] = useState(false);
  const [detectedOccasion, setDetectedOccasion] = useState<DemoOccasionId>("casual");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingLoadingMessage, setRatingLoadingMessage] = useState(0);
  const [ratingShowResult, setRatingShowResult] = useState(false);
  const [ratingScore, setRatingScore] = useState(8.4);
  const [ratingOccasion, setRatingOccasion] = useState<DemoOccasionId>("casual");
  const [ratingPositives, setRatingPositives] = useState<string[]>([]);
  const [ratingImprovements, setRatingImprovements] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [_loadingMessage, setLoadingMessage] = useState(0);
  const [aiStep, setAiStep] = useState(0);
  const [showBanner, setShowBanner] = useState(true);
  const [heroParallaxY, setHeroParallaxY] = useState(0);
  const [selectedOccasion, setSelectedOccasion] = useState<OccasionKey>("Party");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isYearly, setIsYearly] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastIndex, setToastIndex] = useState(0);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [offerSeconds, setOfferSeconds] = useState(47 * 3600 + 23 * 60 + 15);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [cookieAccepted, setCookieAccepted] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistCount, setWaitlistCount] = useState(1247);
  const [copiedLink, setCopiedLink] = useState(false);
  const [visitors, setVisitors] = useState(247);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoNotifyEmail, setVideoNotifyEmail] = useState("");
  const [videoNotifySubscribed, setVideoNotifySubscribed] = useState(false);
  const [uploadSecurityToast, setUploadSecurityToast] = useState(false);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [livePeopleCount, setLivePeopleCount] = useState(9847);
  const [statsAnimated, setStatsAnimated] = useState(false);
  const exitIntentShownRef = useRef(false);
  const statsRef = useRef<HTMLElement | null>(null);
  const demoSectionRef = useRef<HTMLElement | null>(null);
  const ratingUploadInputRef = useRef<HTMLInputElement | null>(null);

  const socialProofMessages = useMemo(
    () => [
      "✨ Priya from Mumbai just signed up!",
      "👔 Rahul from Delhi got his first outfit suggestion",
      "🎉 Aisha from London upgraded to Premium",
      "👗 Sara from Bangalore styled her first outfit",
      "⭐ James from New York rated his outfit 9/10",
      "💄 Meera from Chennai just joined CocoStyle",
      "🌟 Ahmed from Dubai got 3 outfit suggestions",
      "👠 Emma from Sydney upgraded to Premium",
    ],
    []
  );
  const positiveComments = useMemo(
    () => [
      "Great colour choice for your skin tone",
      "The combination works well together",
      "Appropriate for the selected occasion",
      "Good contrast between top and bottom",
      "Footwear complements the outfit well",
      "Accessories are well balanced",
      "The fit looks confident and put-together",
    ],
    []
  );
  const improvementComments = useMemo(
    () => [
      "Adding a belt could define your silhouette better",
      "A watch would elevate this look significantly",
      "Consider swapping to a slightly darker bottom",
      "A jacket or blazer would take this to the next level",
      "Try tucking in your shirt for a sharper look",
      "Brown shoes would complement this better than black",
      "A pocket square would add sophistication",
      "Roll up your sleeves slightly for a relaxed look",
    ],
    []
  );

  const heroPhrases = useMemo(
    () =>
      language === "HI"
        ? ["स्मार्ट पहनें।", "शानदार दिखें।", "हर रोज़।", "हर रोज़।"]
        : typingPhrases,
    [language]
  );

  const triggerConfetti = () => {
    const colors = ["#e8a598", "#8b5cf6", "#f5d0d4", "#c084fc", "#fbbf24"];
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement("div");
      confetti.style.cssText = `
      position: fixed;
      width: ${Math.random() * 10 + 5}px;
      height: ${Math.random() * 10 + 5}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${Math.random() * 100}vw;
      top: -20px;
      border-radius: ${Math.random() > 0.5 ? "50%" : "0"};
      pointer-events: none;
      z-index: 9999;
      animation: confettiFall ${Math.random() * 3 + 2}s linear forwards;
      transform: rotate(${Math.random() * 360}deg);
    `;
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 5000);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    try {
      const value = localStorage.getItem("cookies");
      if (value === "accepted" || value === "declined") {
        setCookieAccepted(true);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    const current = heroPhrases[phraseIndex];
    const speed = 50;
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && typedText.length < current.length) {
      timeout = setTimeout(() => {
        setTypedText(current.slice(0, typedText.length + 1));
      }, speed);
    } else if (!isDeleting && typedText.length === current.length) {
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 2000);
    } else if (isDeleting && typedText.length > 0) {
      timeout = setTimeout(() => {
        setTypedText(current.slice(0, typedText.length - 1));
      }, speed);
    } else {
      timeout = setTimeout(() => {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % heroPhrases.length);
      }, 300);
    }

    return () => clearTimeout(timeout);
  }, [typedText, isDeleting, phraseIndex, heroPhrases]);

  useEffect(() => {
    if (!isLoading) return;
    setLoadingMessage(0);
    const messageInterval = setInterval(() => {
      setLoadingMessage((prev) => (prev + 1) % 3);
    }, 500);

    const finishTimeout = setTimeout(() => {
      setIsLoading(false);
      setShowResult(true);
      clearInterval(messageInterval);
    }, 1500);

    return () => {
      clearInterval(messageInterval);
      clearTimeout(finishTimeout);
    };
  }, [isLoading]);

  useEffect(() => {
    if (!eventLoading) return;
    setEventLoadingMessage(0);
    const messages = window.setInterval(() => {
      setEventLoadingMessage((prev) => (prev + 1) % 4);
    }, 500);
    const done = window.setTimeout(() => {
      setEventLoading(false);
      setEventShowResult(true);
      window.clearInterval(messages);
    }, 1500);
    return () => {
      window.clearInterval(messages);
      window.clearTimeout(done);
    };
  }, [eventLoading]);

  useEffect(() => {
    if (!ratingLoading) return;
    setRatingLoadingMessage(0);
    const messages = window.setInterval(() => {
      setRatingLoadingMessage((prev) => (prev + 1) % 4);
    }, 500);
    const done = window.setTimeout(() => {
      const nextScore = Number((6.5 + Math.random() * 3).toFixed(1));
      setRatingScore(nextScore);
      const shuffledPos = [...positiveComments].sort(() => Math.random() - 0.5);
      const shuffledImp = [...improvementComments].sort(() => Math.random() - 0.5);
      setRatingPositives(shuffledPos.slice(0, 3));
      setRatingImprovements(shuffledImp.slice(0, 2));
      setRatingLoading(false);
      setRatingShowResult(true);
      window.clearInterval(messages);
    }, 2000);
    return () => {
      window.clearInterval(messages);
      window.clearTimeout(done);
    };
  }, [ratingLoading, positiveComments, improvementComments]);

  useEffect(() => {
    if (!isLoading) return;
    setAiStep(0);
    const interval = setInterval(() => {
      setAiStep((prev) => (prev < 6 ? prev + 1 : prev));
    }, 250);
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    const interval = setInterval(() => {
      setOfferSeconds((prev) => (prev <= 0 ? 23 * 3600 + 59 * 60 + 59 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWaitlistCount((prev) => prev + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisitors((prev) => {
        const delta = Math.floor(Math.random() * 3) + 1;
        const next = prev + (Math.random() > 0.5 ? delta : -delta);
        return Math.max(180, Math.min(350, next));
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let cycleInterval: ReturnType<typeof setInterval> | null = null;
    let hideTimeout: ReturnType<typeof setTimeout> | null = null;
    const startTimeout = setTimeout(() => {
      setShowToast(true);
      hideTimeout = setTimeout(() => setShowToast(false), 4000);
      cycleInterval = setInterval(() => {
        setToastIndex((prev) => (prev + 1) % socialProofMessages.length);
        setShowToast(true);
        if (hideTimeout) clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => setShowToast(false), 4000);
      }, 30000);
    }, 1000);

    return () => {
      clearTimeout(startTimeout);
      if (cycleInterval) clearInterval(cycleInterval);
      if (hideTimeout) clearTimeout(hideTimeout);
    };
  }, [socialProofMessages.length]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (event.clientY < 20 && !exitIntentShownRef.current) {
        exitIntentShownRef.current = true;
        setShowExitPopup(true);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowExitPopup(false);
        setCookieAccepted(true);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
      setScrollProgress(Math.max(0, Math.min(progress, 100)));
      setShowBackToTop(window.scrollY > 500);
      setHeroParallaxY(window.scrollY * 0.5);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !statsAnimated) {
            setStatsAnimated(true);
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [statsAnimated]);

  useEffect(() => {
    if (!statsAnimated) return;
    const start = 9847;
    const end = 10293;
    const duration = 2000;
    const startAt = performance.now();
    let frame = 0;

    const animate = (now: number) => {
      const elapsed = now - startAt;
      const progress = Math.min(elapsed / duration, 1);
      const next = Math.round(start + (end - start) * progress);
      setLivePeopleCount(next);
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [statsAnimated]);

  useEffect(() => {
    const isDesktop = () => window.innerWidth > 768;
    let last = 0;
    const colors = ["#fb7185", "#a855f7", "#facc15"];
    let colorIndex = 0;

    const handler = (event: MouseEvent) => {
      if (!isDesktop()) return;
      const now = Date.now();
      if (now - last < 50) return;
      last = now;

      const sparkle = document.createElement("div");
      sparkle.style.position = "fixed";
      sparkle.style.left = `${event.clientX - 4}px`;
      sparkle.style.top = `${event.clientY - 4}px`;
      sparkle.style.width = "8px";
      sparkle.style.height = "8px";
      sparkle.style.borderRadius = "9999px";
      sparkle.style.pointerEvents = "none";
      sparkle.style.zIndex = "300";
      sparkle.style.background = colors[colorIndex % colors.length];
      sparkle.style.transition = "opacity 600ms ease, transform 600ms ease";
      sparkle.style.opacity = "1";
      sparkle.style.transform = "scale(1)";
      document.body.appendChild(sparkle);
      colorIndex += 1;

      requestAnimationFrame(() => {
        sparkle.style.opacity = "0";
        sparkle.style.transform = "scale(0.3)";
      });
      window.setTimeout(() => sparkle.remove(), 620);
    };

    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  useEffect(() => {
    const targets = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.15 }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const navLinks = useMemo(
    () => [
      { label: "Features", href: "#features" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Style DNA", href: "#style-dna" },
      { label: "Pricing", href: "#pricing" },
    ],
    []
  );

  const offerCountdown = useMemo(() => {
    const hours = String(Math.floor(offerSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((offerSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(offerSeconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }, [offerSeconds]);

  const filteredDemoOccasions = useMemo(() => {
    if (selectedCategory === "All") return demoOccasions;
    return demoOccasions.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  const detectOccasion = (text: string): DemoOccasionId => {
    const lower = text.toLowerCase();
    if (lower.includes("interview") || lower.includes("job")) return "interview";
    if (lower.includes("wedding") || lower.includes("shaadi")) return "wedding";
    if (lower.includes("date") || lower.includes("romantic")) return "firstdate";
    if (lower.includes("beach") || lower.includes("pool")) return "beach";
    if (lower.includes("gym") || lower.includes("workout")) return "gym";
    if (lower.includes("diwali") || lower.includes("festival")) return "diwali";
    if (lower.includes("office") || lower.includes("work") || lower.includes("first day"))
      return "firstday";
    if (lower.includes("party") || lower.includes("birthday")) return "birthday";
    if (lower.includes("casual") || lower.includes("chill")) return "casual";
    if (lower.includes("dinner") || lower.includes("restaurant")) return "businesslunch";
    if (lower.includes("presentation") || lower.includes("meeting")) return "presentation";
    if (lower.includes("eid") || lower.includes("puja") || lower.includes("temple"))
      return "puja";
    if (lower.includes("concert") || lower.includes("music")) return "concert";
    if (lower.includes("travel") || lower.includes("flight") || lower.includes("airport"))
      return "travel";
    return "casual";
  };

  const readImagePreview = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setUploadedImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`${inter.className} min-h-screen bg-[#0a0a0a] text-white`}>
      

      <div
        className="fixed left-0 top-0 z-[200] h-[3px] bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] transition-[width] duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      <div
        className={`fixed inset-0 z-[500] flex items-center justify-center bg-black transition-opacity duration-500 ${loading ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <div className="text-center">
          <h1
            className={`${playfair.className} bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] bg-clip-text text-6xl font-bold italic text-transparent`}
          >
            CocoStyle
          </h1>
          <p className="mt-3 text-lg text-white/60">Your AI Personal Stylist</p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#e8a598] animate-bounce" />
            <span className="h-3 w-3 rounded-full bg-[#e8a598] animate-bounce [animation-delay:150ms]" />
            <span className="h-3 w-3 rounded-full bg-[#e8a598] animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      </div>

      {showProductHunt && (
        <div className="relative cursor-pointer bg-orange-500 px-4 py-2 text-center">
          <p
            className="text-sm font-medium text-white"
            onClick={() => window.open("https://www.producthunt.com", "_blank")}
          >
            🚀 CocoStyle is launching soon! Sign up free to be first →
          </p>
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/30 px-2 py-0.5 text-xs text-white"
            onClick={() => setShowProductHunt(false)}
            aria-label="Close product hunt banner"
          >
            ✕
          </button>
        </div>
      )}

      {showBanner && (
        <div className="relative overflow-hidden bg-gradient-to-r from-[#e8a598] to-[#8b5cf6]">
          <div className="marquee-track flex w-[200%] py-2">
            <p className="w-1/2 whitespace-nowrap text-center text-sm font-medium text-white">
              🚀 CocoStyle is launching soon! Sign up free to be first → · ⏰
              Countdown: {offerCountdown} · 🚀 CocoStyle is launching soon! Sign
              up free to be first → ·
            </p>
            <p className="w-1/2 whitespace-nowrap text-center text-sm font-medium text-white">
              🚀 CocoStyle is launching soon! Sign up free to be first → · ⏰
              Countdown: {offerCountdown} · 🚀 CocoStyle is launching soon! Sign
              up free to be first → ·
            </p>
          </div>
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/30 px-2 py-0.5 text-xs text-white transition-all duration-300 hover:scale-105"
            onClick={() => setShowBanner(false)}
            aria-label="Close launch banner"
          >
            ✕
          </button>
        </div>
      )}

      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a
            href="#"
            className={`${playfair.className} logo-shimmer text-2xl font-bold italic`}
          >
            CocoStyle
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center gap-2 text-sm text-white/80 transition-all duration-300 hover:scale-105 hover:text-white"
              >
                {link.label}
                {link.label === "Style DNA" && (
                  <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-bold text-green-400">
                    FREE
                  </span>
                )}
              </a>
            ))}
          </div>

          <div className="hidden items-center md:flex">
            <div className="flex items-center rounded-full border border-white/10 bg-white/5 p-1">
              <button
                onClick={() => setLanguage("EN")}
                className={`rounded-full px-3 py-1 text-xs transition-all duration-300 ${
                  language === "EN"
                    ? "bg-white/10 text-white"
                    : "text-white/60"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("HI")}
                className={`rounded-full px-3 py-1 text-xs transition-all duration-300 ${
                  language === "HI"
                    ? "bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] text-white"
                    : "text-white/60"
                }`}
              >
                हि
              </button>
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <span title="Bank-level security" className="text-xs text-white/40">
              🔒
            </span>
            <button
              onClick={() => (window.location.href = "/auth/login")}
              className="rounded-full border border-white px-5 py-2 text-sm font-medium text-white transition-all duration-300 hover:scale-105"
            >
              Login
            </button>
            <div className="relative">
              <span className="pointer-events-none absolute inset-0 rounded-full bg-rose-400/20 animate-ping" />
              <button
                onClick={() => (window.location.href = "/auth/login")}
                className="relative rounded-full bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-rose-500/60"
              >
                Get Started
              </button>
            </div>
          </div>

          <button
            type="button"
            className="rounded-md p-2 text-white transition-all duration-300 hover:scale-105 hover:bg-white/10 md:hidden"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>
        </nav>

        {isMenuOpen && (
          <div className="border-t border-white/10 bg-black/90 px-4 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="flex items-center gap-2 text-sm text-white/80 transition-all duration-300 hover:scale-105 hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                  {link.label === "Style DNA" && (
                    <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-bold text-green-400">
                      FREE
                    </span>
                  )}
                </a>
              ))}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => (window.location.href = "/auth/login")}
                  className="rounded-full border border-white px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:scale-105"
                >
                  Login
                </button>
                <button
                  onClick={() => (window.location.href = "/auth/login")}
                  className="rounded-full bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:scale-105"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        <section
          className="relative flex min-h-screen items-center overflow-hidden px-4 py-20 sm:px-6 lg:px-8"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1920&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundPositionY: `${heroParallaxY}px`,
          }}
        >
          <div className="absolute inset-0 bg-black/55" />

          {sparkleDots.map((dot, idx) => (
            <span
              key={idx}
              className="absolute h-1 w-1 rounded-full bg-rose-300/60 animate-ping"
              style={{ top: dot.top, left: dot.left, animationDelay: dot.delay }}
            />
          ))}

          <span className="absolute left-10 top-20 text-3xl animate-bounce">👗</span>
          <span className="absolute right-10 top-20 text-3xl animate-bounce [animation-delay:0.2s]">
            👠
          </span>
          <span className="absolute left-5 top-1/2 text-3xl animate-bounce [animation-delay:0.4s]">
            ✨
          </span>
          <span className="absolute right-5 top-1/2 text-3xl animate-bounce [animation-delay:0.6s]">
            💄
          </span>
          <span className="absolute bottom-32 left-10 text-3xl animate-bounce [animation-delay:0.8s]">
            👔
          </span>
          <span className="absolute bottom-32 right-10 text-3xl animate-bounce [animation-delay:1s]">
            🌟
          </span>

          <div className="relative mx-auto w-full max-w-5xl text-center">
            <div className="mx-auto inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white backdrop-blur-md">
              ✨ AI-Powered Personal Stylist
            </div>

            <h1
              className={`${playfair.className} mt-8 min-h-[88px] bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] bg-clip-text text-5xl font-bold text-transparent sm:min-h-[96px] sm:text-6xl lg:min-h-[110px]`}
            >
              {typedText}
              <span className="typing-cursor">|</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base text-white/90 sm:text-lg">
              {language === "HI"
                ? "CocoStyle आपके स्किन टोन को समझकर आपके कपड़ों से परफेक्ट आउटफिट बनाता है।"
                : "CocoStyle analyses your skin tone and builds perfect outfits from clothes you already own. No shopping needed. Just style."}
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                onClick={() => (window.location.href = "/auth/login")}
                className="rounded-full bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-rose-500/60"
              >
                {language === "HI" ? "मुफ्त शुरू करें →" : "Start Styling Free →"}
              </button>
              <button className="rounded-full border border-white bg-transparent px-8 py-4 text-sm font-semibold text-white transition-all duration-300 hover:scale-105">
                ▶ Watch Demo
              </button>
            </div>

            <p className="mt-5 text-sm text-white/60">
              Free forever · No credit card needed · Premium features coming soon
            </p>

            <div className="mx-auto mt-4 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3">
              <span className="animate-pulse">🧬</span>
              <span className="text-sm text-white/70">
                Get your free Style DNA Report when you sign up
              </span>
              <span className="text-sm font-bold text-[#e8a598]">Free →</span>
            </div>

            <div className="mx-auto mt-10 flex max-w-3xl items-end justify-center">
              <div className="relative h-44 w-28 rotate-3 overflow-hidden rounded-2xl border border-white/10 shadow-xl sm:h-52 sm:w-36">
                <Image
                  src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&q=80"
                  alt="Fashion person one"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 112px, 144px"
                />
              </div>
              <div className="relative -mx-3 h-52 w-32 -rotate-2 scale-110 overflow-hidden rounded-2xl border border-white/10 shadow-2xl sm:h-60 sm:w-40">
                <Image
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&q=80"
                  alt="Fashion person two"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 128px, 160px"
                />
              </div>
              <div className="relative h-44 w-28 rotate-3 overflow-hidden rounded-2xl border border-white/10 shadow-xl sm:h-52 sm:w-36">
                <Image
                  src="https://images.unsplash.com/photo-1488161628813-04466f872be2?w=300&q=80"
                  alt="Fashion person three"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 112px, 144px"
                />
              </div>
            </div>
            <p className="mt-4 text-sm text-white/70">
              Real people. Real wardrobes. Real style. ✨
            </p>
          </div>
        </section>

        <section ref={demoSectionRef} className="bg-black px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2
              className={`${playfair.className} mb-4 text-center text-4xl font-bold text-white sm:text-5xl`}
            >
              See The Magic In 3 Clicks
            </h2>
            <div className="mb-4 flex items-center justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-red-500/50 bg-red-500/20 px-3 py-1 text-xs font-bold text-red-400">
                <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                LIVE DEMO
              </span>
            </div>
            <p className="mb-12 text-center text-white/70">
              No signup. No download. Just try it right now.
            </p>
            <div className="mb-8 flex items-center justify-center gap-6">
              {[
                ["tab1", "🎯 Pick Occasion"],
                ["tab2", "⚡ I Have An Event!"],
                ["tab3", "📸 Rate My Outfit"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as "tab1" | "tab2" | "tab3")}
                  className={`border-b-2 pb-2 text-sm transition-all duration-300 ${
                    activeTab === id
                      ? "border-rose-400 bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] bg-clip-text text-transparent"
                      : "border-transparent text-white/50 hover:text-white/80"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mx-auto mb-8 max-w-3xl">
              <div className="flex items-center justify-between text-xs text-white/70">
                {["Step 1", "Step 2", "Step 3", "Result"].map((step, idx) => {
                  const activeIndex = showResult ? 3 : isLoading ? 2 : selectedWeather ? 2 : selectedDemoOccasion ? 1 : 0;
                  return (
                    <span
                      key={step}
                      className={`${idx < activeIndex ? "text-[#e8a598]" : idx === activeIndex ? "text-[#e8a598] animate-pulse" : "text-white/40"}`}
                    >
                      {step}
                    </span>
                  );
                })}
              </div>
              <div className="mt-2 h-1 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] transition-all duration-500"
                  style={{ width: `${showResult ? 100 : isLoading ? 75 : 50}%` }}
                />
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                {activeTab === "tab1" && (
                  <>
                <p className="mb-3 font-bold text-white">01. Your Skin Tone</p>
                <div className="flex flex-wrap gap-3">
                  {(Object.keys(skinToneMeta) as SkinToneKey[]).map((tone) => (
                    <button
                      key={tone}
                      aria-label={skinToneMeta[tone].label}
                      onClick={() => setSelectedSkin(tone)}
                      className={`h-12 w-12 rounded-full border-2 transition-all duration-300 hover:scale-110 ${
                        selectedSkin === tone
                          ? "scale-110 border-white"
                          : "border-white/20"
                      }`}
                      style={{ backgroundColor: skinToneMeta[tone].color }}
                    />
                  ))}
                </div>
                <p className="mt-3 font-medium text-[#e8a598]">
                  {skinToneMeta[selectedSkin].label}
                </p>

                <p className="mb-3 mt-8 font-bold text-white">02. Your Occasion</p>
                <div className="mb-3 flex flex-wrap gap-2">
                  {(["All", "Fashion", "Professional", "Personal", "Indian", "Active", "Time"] as DemoCategory[]).map(
                    (tab) => (
                      <button
                        key={tab}
                        onClick={() => setSelectedCategory(tab)}
                        className={`rounded-full px-4 py-2 text-xs transition-all duration-300 hover:scale-105 ${
                          selectedCategory === tab
                            ? "bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] text-white"
                            : "border border-white/10 bg-white/5 text-white/70"
                        }`}
                      >
                        {tab}
                      </button>
                    )
                  )}
                </div>
                <div className="demo-scrollbar grid max-h-64 grid-cols-2 gap-2 overflow-y-auto pr-1 md:grid-cols-3 lg:grid-cols-4">
                  {filteredDemoOccasions.map((occasion) => (
                    <button
                      key={occasion.id}
                      onClick={() => setSelectedDemoOccasion(occasion.id)}
                      className={`rounded-xl px-3 py-2 text-center text-sm transition-all duration-300 hover:bg-white/10 ${
                        selectedDemoOccasion === occasion.id
                          ? "border-2 border-[#e8a598] bg-white/10"
                          : "border border-white/10 bg-white/5"
                      }`}
                    >
                      <span className="mb-1 block text-2xl">{occasion.emoji}</span>
                      <span className="text-xs text-white/80">{occasion.label}</span>
                    </button>
                  ))}
                </div>

                <p className="mb-3 mt-8 font-bold text-white">03. Today&apos;s Weather</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "hot", label: "🌞 Hot" },
                    { key: "mild", label: "🌤 Mild" },
                    { key: "cold", label: "🧊 Cold" },
                    { key: "rainy", label: "🌧 Rainy" },
                  ].map((weather) => (
                    <button
                      key={weather.key}
                      onClick={() => setSelectedWeather(weather.key as WeatherKey)}
                      className={`rounded-xl border px-4 py-2 text-sm transition-all duration-300 ${
                        selectedWeather === weather.key
                          ? "border-transparent bg-[#e8a598] text-black"
                          : "border-white/10 bg-white/5 text-white"
                      }`}
                    >
                      {weather.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setShowResult(false);
                    setIsLoading(true);
                  }}
                  className="mt-8 w-full rounded-xl bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] py-4 text-lg font-bold text-white transition-all duration-300 hover:scale-105"
                >
                  ✨ Get My AI Outfit
                </button>
                  </>
                )}

                {activeTab === "tab2" && (
                  <>
                    <p className="mb-4 text-lg font-bold text-white">
                      Tell us what&apos;s happening 💬
                    </p>
                    <textarea
                      value={eventInput}
                      onChange={(e) => setEventInput(e.target.value)}
                      placeholder={`Type anything... 
Examples:
- Job interview in 2 hours
- Friend's surprise birthday party tonight  
- First day at new office tomorrow
- Date with someone special this evening
- Diwali family gathering this weekend
- Beach trip tomorrow morning`}
                      className="min-h-32 w-full resize-none rounded-2xl border border-white/20 bg-white/5 p-5 text-sm text-white placeholder-white/30 focus:border-rose-400 focus:outline-none"
                    />
                    <p className="mb-2 mt-3 text-xs text-white/40">Quick suggestions</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Job interview tomorrow 💼",
                        "Date tonight 💕",
                        "Friend's wedding 💍",
                        "Beach trip 🏖️",
                        "Diwali party 🪔",
                        "Gym session 💪",
                      ].map((item) => (
                        <button
                          key={item}
                          onClick={() => setEventInput(item)}
                          className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/60 transition hover:bg-white/10"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                    <p className="mb-2 mt-4 text-sm text-white/60">Your skin tone</p>
                    <div className="flex flex-wrap gap-3">
                      {(Object.keys(skinToneMeta) as SkinToneKey[]).map((tone) => (
                        <button
                          key={tone}
                          onClick={() => setSelectedSkin(tone)}
                          className={`h-10 w-10 rounded-full border-2 transition-all ${
                            selectedSkin === tone ? "border-white scale-110" : "border-white/20"
                          }`}
                          style={{ backgroundColor: skinToneMeta[tone].color }}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        setDetectedOccasion(detectOccasion(eventInput));
                        setEventShowResult(false);
                        setEventLoading(true);
                      }}
                      className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] py-4 text-lg font-bold text-white transition hover:scale-105"
                    >
                      ⚡ Analyse & Style Me Instantly
                    </button>
                  </>
                )}

                {activeTab === "tab3" && (
                  <>
                    <p className="mb-4 text-lg font-bold text-white">
                      Upload what you&apos;re wearing right now 📸
                    </p>
                    <div
                      className="block cursor-pointer rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-10 text-center transition hover:border-rose-400/50"
                      onClick={() => {
                        setUploadSecurityToast(true);
                        setTimeout(() => {
                          setUploadSecurityToast(false);
                          ratingUploadInputRef.current?.click();
                        }, 2000);
                      }}
                    >
                      {!uploadedImage ? (
                        <>
                          <p className="mb-3 text-5xl">📸</p>
                          <p className="font-medium text-white">Drop your photo here</p>
                          <p className="mt-1 text-sm text-white/50">or click to upload</p>
                          <p className="mt-2 text-xs text-white/30">JPG, PNG supported · Max 10MB</p>
                        </>
                      ) : (
                        <div className="relative">
                          <Image
                            src={uploadedImage}
                            alt="Outfit preview"
                            width={400}
                            height={300}
                            unoptimized
                            className="h-48 w-full rounded-xl object-cover"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setUploadedImage(null);
                            }}
                            className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                      <input
                        ref={ratingUploadInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) readImagePreview(file);
                        }}
                      />
                      <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-left">
                        <p className="text-xs font-bold text-red-300">
                          ⚠️ Content Safety Notice
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-red-300/60">
                          All uploads are automatically scanned for inappropriate
                          content. Violations result in immediate permanent account
                          suspension. Our AI moderation system operates 24/7.
                        </p>
                      </div>
                    </div>
                    <p className="mb-2 mt-4 text-sm text-white/60">What&apos;s the occasion for this outfit?</p>
                    <div className="demo-scrollbar flex max-h-20 gap-2 overflow-x-auto">
                      {demoOccasions.slice(0, 15).map((occasion) => (
                        <button
                          key={occasion.id}
                          onClick={() => setRatingOccasion(occasion.id)}
                          className={`whitespace-nowrap rounded-full px-3 py-1 text-xs ${
                            ratingOccasion === occasion.id
                              ? "bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] text-white"
                              : "bg-white/5 text-white/60"
                          }`}
                        >
                          {occasion.emoji} {occasion.label}
                        </button>
                      ))}
                    </div>
                    <p className="mb-2 mt-4 text-sm text-white/60">Your skin tone</p>
                    <div className="flex flex-wrap gap-3">
                      {(Object.keys(skinToneMeta) as SkinToneKey[]).map((tone) => (
                        <button
                          key={tone}
                          onClick={() => setSelectedSkin(tone)}
                          className={`h-10 w-10 rounded-full border-2 transition-all ${
                            selectedSkin === tone ? "border-white scale-110" : "border-white/20"
                          }`}
                          style={{ backgroundColor: skinToneMeta[tone].color }}
                        />
                      ))}
                    </div>
                    <button
                      disabled={!uploadedImage}
                      onClick={() => {
                        setRatingShowResult(false);
                        setRatingLoading(true);
                      }}
                      className={`mt-6 w-full rounded-xl py-4 text-lg font-bold text-white transition ${
                        uploadedImage
                          ? "bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] hover:scale-105"
                          : "cursor-not-allowed bg-white/20"
                      }`}
                    >
                      🤖 Rate My Outfit Now
                    </button>
                  </>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                {activeTab === "tab1" && (
                  <>
                {!isLoading && !showResult && (
                  <div className="flex min-h-96 flex-col items-center justify-center text-center">
                    <p className="text-6xl">👗</p>
                    <p className="mt-4 text-lg text-white/40">Your outfit suggestion</p>
                    <p className="text-white/40">will appear here</p>
                    <p className="mt-2 text-sm text-white/30">← Select your preferences</p>
                  </div>
                )}

                {isLoading && (
                  <div className="flex min-h-96 flex-col justify-center">
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-full origin-left bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] transition-transform duration-[1500ms]" />
                    </div>
                    <div className="mt-6 space-y-2">
                      {[
                        "🎨 Color Theory Agent - analyzing...",
                        "👗 Wardrobe Agent - scanning...",
                        "🌤️ Weather Agent - checking...",
                        "🎯 Occasion Agent - matching...",
                        "✨ Combination Agent - building...",
                        "⭐ Rating Agent - scoring...",
                      ].map((line, idx) => (
                        <div key={line} className="text-white/80">
                          <p className={`${idx <= aiStep ? "opacity-100" : "opacity-40"} text-sm`}>{line}</p>
                          <div className="mt-1 h-1 rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] transition-all duration-300"
                              style={{ width: idx <= aiStep ? "100%" : "0%" }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {showResult && !isLoading && (
                  <div
                    key={`${selectedDemoOccasion}-${selectedSkin}-${selectedWeather}`}
                    className="animate-[fadeInUp_0.7s_ease_forwards]"
                  >
                    <div className="mb-2 text-center text-sm text-[#e8a598]">
                      Based on your {skinToneMeta[selectedSkin].label} skin tone with warm
                      undertones
                    </div>
                    <div className="mb-3 flex justify-center">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                        {selectedCategory === "All" ? "🎊 Occasion" : `🎊 ${selectedCategory}`}
                      </span>
                    </div>
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <p className="text-xl font-bold text-white">
                        {demoResults[selectedDemoOccasion].outfitName}
                      </p>
                      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-right">
                        <p className="text-xs text-white/60">AI Score</p>
                        <p className="text-2xl font-bold text-[#e8a598]">
                          {demoResults[selectedDemoOccasion].aiScore}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {demoResults[selectedDemoOccasion].items.map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center gap-3 rounded-xl bg-white/5 p-3"
                        >
                          <span className="text-3xl">{item.icon}</span>
                          <div>
                            <p className="text-sm font-medium text-white">{item.name}</p>
                            <p className="text-xs text-white/50">{item.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 space-y-3">
                      {[
                        ["Skin Tone Match", demoResults[selectedDemoOccasion].skinMatch],
                        ["Occasion Fit", demoResults[selectedDemoOccasion].occasionFit],
                        ["Color Harmony", demoResults[selectedDemoOccasion].colorHarmony],
                      ].map(([label, score]) => (
                        <div key={label}>
                          <div className="mb-1 flex items-center justify-between text-xs text-white/70">
                            <span>{label}</span>
                            <span>{score}</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] transition-all duration-1000"
                              style={{ width: `${Number(score) * 10}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 rounded-xl bg-white/5 p-4">
                      <p className="mb-2 text-sm font-bold text-rose-300">
                        💡 Why This Works
                      </p>
                      <p className="text-sm leading-relaxed text-white/70">
                        {demoResults[selectedDemoOccasion].whyText}
                      </p>
                    </div>

                    <button className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] py-3 font-medium text-white transition-all duration-300 hover:scale-105">
                      Love this? Get suggestions from YOUR wardrobe →
                    </button>
                    <button
                      onClick={() =>
                        window.open(
                          "https://wa.me/?text=CocoStyle suggested this amazing outfit for me! Try it free at cocostyle.com 🌟",
                          "_blank"
                        )
                      }
                      className="mt-3 w-full rounded-xl border border-white/20 bg-white/5 py-3 font-medium text-white transition-all duration-300 hover:scale-105"
                    >
                      Share on WhatsApp 📱
                    </button>
                  </div>
                )}
                  </>
                )}

                {activeTab === "tab2" && (
                  <>
                    {!eventLoading && !eventShowResult && (
                      <div className="flex min-h-96 flex-col items-center justify-center text-center">
                        <p className="text-5xl">⚡</p>
                        <p className="mt-3 text-white/40">Describe your event and we&apos;ll</p>
                        <p className="text-white/30">build your perfect outfit instantly</p>
                      </div>
                    )}
                    {eventLoading && (
                      <div className="flex min-h-96 flex-col justify-center text-center text-white/80">
                        {[
                          "🤖 Reading your situation...",
                          "🎯 Identifying the occasion...",
                          "🎨 Matching to your skin tone...",
                          "✨ Building perfect outfit...",
                        ][eventLoadingMessage]}
                      </div>
                    )}
                    {eventShowResult && !eventLoading && (
                      <div className="animate-[fadeInUp_0.7s_ease_forwards]">
                        <div className="mb-3 flex justify-center">
                          <span className="rounded-full bg-[#e8a598]/20 px-3 py-1 text-xs text-[#e8a598]">
                            🎯 We detected:{" "}
                            {demoOccasions.find((o) => o.id === detectedOccasion)?.label ?? "Casual"}
                          </span>
                        </div>
                        <p className="mb-3 text-center text-xs text-white/30">
                          Based on: &quot;{eventInput.slice(0, 60)}&quot;
                        </p>
                        <p className="mb-2 text-sm text-[#e8a598]">
                          Based on your {skinToneMeta[selectedSkin].label} skin tone with warm undertones
                        </p>
                        <p className="text-xl font-bold text-white">
                          {demoResults[detectedOccasion].outfitName}
                        </p>
                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                          {demoResults[detectedOccasion].items.map((item) => (
                            <div key={item.name} className="rounded-xl bg-white/5 p-3 text-sm text-white/80">
                              {item.icon} {item.name}
                            </div>
                          ))}
                        </div>
                        <p className="mt-4 text-sm text-white/70">{demoResults[detectedOccasion].whyText}</p>
                        {/(2 hours|tonight|now)/i.test(eventInput) && (
                          <p className="mt-3 text-sm text-amber-300">
                            ⏰ Quick tip: This outfit takes less than 5 minutes to put together!
                          </p>
                        )}
                        {/tomorrow/i.test(eventInput) && (
                          <p className="mt-3 text-sm text-white/80">
                            💡 Pro tip: Prepare this outfit tonight so your morning is stress-free!
                          </p>
                        )}
                        {/first/i.test(eventInput) && (
                          <p className="mt-3 text-sm text-white/80">
                            ✨ First impressions matter. This outfit will make you remembered!
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}

                {activeTab === "tab3" && (
                  <>
                    {!ratingLoading && !ratingShowResult && (
                      <div className="flex min-h-96 flex-col items-center justify-center text-center">
                        <p className="text-5xl">📊</p>
                        <p className="mt-3 text-white/40">Upload your outfit photo</p>
                        <p className="text-white/30">and get an honest AI rating</p>
                        <p className="text-xs text-white/30">with tips to improve</p>
                      </div>
                    )}
                    {ratingLoading && (
                      <div className="flex min-h-96 flex-col justify-center text-center text-white/80">
                        {[
                          "🔍 Analysing your outfit colours...",
                          "🎨 Checking skin tone compatibility...",
                          "👔 Evaluating occasion appropriateness...",
                          "💡 Preparing improvement tips...",
                        ][ratingLoadingMessage]}
                      </div>
                    )}
                    {ratingShowResult && !ratingLoading && (
                      <div className="animate-[fadeInUp_0.7s_ease_forwards]">
                        <div className="mx-auto flex h-32 w-32 flex-col items-center justify-center rounded-full border-4 border-transparent bg-[linear-gradient(#0a0a0a,#0a0a0a)_padding-box,linear-gradient(135deg,#e8a598,#8b5cf6)_border-box]">
                          <p className="text-5xl font-bold text-white">{ratingScore.toFixed(1)}</p>
                          <p className="text-lg text-white/50">/10</p>
                        </div>
                        <p className="mt-3 text-center font-medium text-rose-300">
                          {ratingScore >= 9
                            ? "🔥 Absolutely Stunning!"
                            : ratingScore >= 7
                              ? "✨ Looking Great!"
                              : ratingScore >= 5
                                ? "👍 Pretty Good!"
                                : ratingScore >= 3
                                  ? "🔧 Needs Some Work"
                                  : "💡 Let's Improve This!"}
                        </p>
                        <div className="mt-5 grid gap-3">
                          {[
                            ["Skin Tone Match", Math.max(6.5, ratingScore - 0.2)],
                            ["Occasion Fit", Math.max(6.2, ratingScore - 0.4)],
                            ["Colour Harmony", Math.max(6.4, ratingScore - 0.3)],
                            ["Overall Style", ratingScore],
                          ].map(([label, score]) => (
                            <div key={label}>
                              <div className="mb-1 flex justify-between text-xs text-white/70">
                                <span>{label}</span>
                                <span>{Number(score).toFixed(1)}</span>
                              </div>
                              <div className="h-2 rounded-full bg-white/10">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-[#e8a598] to-[#8b5cf6]"
                                  style={{ width: `${Number(score) * 10}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 rounded-xl bg-white/5 p-4">
                          <p className="mb-2 font-semibold text-white">What&apos;s Working ✅</p>
                          <ul className="space-y-1 text-sm text-white/80">
                            {ratingPositives.map((item) => (
                              <li key={item}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="mt-4 rounded-xl bg-white/5 p-4">
                          <p className="mb-2 font-semibold text-white">What Could Be Better 💡</p>
                          <ul className="space-y-1 text-sm text-white/80">
                            {ratingImprovements.map((item) => (
                              <li key={item}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                        <button className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] py-3 font-medium text-white transition-all duration-300 hover:scale-105">
                          Sign up free and get personalised ratings every day →
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-white/40">
              This is just a preview. Real CocoStyle analyses your actual wardrobe
              and gives 3 complete outfit combinations personalised to YOUR clothes.
            </p>
          </div>
        </section>

        <section className="bg-black px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2
              className={`${playfair.className} text-center text-4xl font-bold text-white sm:text-5xl`}
            >
              Your Daily Style Companion 🌅
            </h2>
            <p className="mt-3 text-center text-white/70">
              Two features people use every single morning
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <article className="rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(232,165,152,0.15),rgba(232,165,152,0.05))] p-8 transition-all duration-300 hover:-translate-y-2">
                <p className="text-5xl">⚡</p>
                <h3 className="mt-3 text-2xl font-bold text-white">Surprise Event? No Panic.</h3>
                <p className="mt-3 text-white/80">
                  Got a last-minute invitation? Just type what&apos;s happening and
                  our AI instantly builds the perfect outfit from your wardrobe.
                  In under 10 seconds.
                </p>
                <div className="mt-5 space-y-2 text-sm text-white/70">
                  <p>&quot;Job interview in 2 hours&quot; → interview outfit</p>
                  <p>&quot;Date tonight&quot; → date outfit</p>
                  <p>&quot;Wedding tomorrow&quot; → wedding outfit</p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab("tab2");
                    demoSectionRef.current?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="mt-5 rounded-full bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] px-6 py-2 text-white transition-all duration-300 hover:scale-105"
                >
                  Try It Now →
                </button>
              </article>
              <article className="rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(139,92,246,0.15),rgba(139,92,246,0.05))] p-8 transition-all duration-300 hover:-translate-y-2">
                <p className="text-5xl">📸</p>
                <h3 className="mt-3 text-2xl font-bold text-white">
                  Rate My Outfit — Every Morning
                </h3>
                <p className="mt-3 text-white/80">
                  Stand in front of the mirror and wonder &quot;do I look good?&quot;
                  Never again. Upload your outfit and get an honest AI score out
                  of 10 with tips to improve instantly.
                </p>
                <div className="mt-5 rounded-xl bg-white/5 p-4">
                  <p className="text-3xl font-bold text-[#e8a598]">8.4/10</p>
                  <p className="text-white/80">Looking Great! ✨</p>
                  <div className="mt-3 space-y-2">
                    <div className="h-2 rounded-full bg-white/10">
                      <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-[#e8a598] to-[#8b5cf6]" />
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-[#e8a598] to-[#8b5cf6]" />
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#e8a598] to-[#8b5cf6]" />
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveTab("tab3");
                    demoSectionRef.current?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="mt-5 rounded-full bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] px-6 py-2 text-white transition-all duration-300 hover:scale-105"
                >
                  Rate My Outfit →
                </button>
              </article>
            </div>
          </div>
        </section>

        <section className="bg-black px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl text-center">
            <h2
              className={`${playfair.className} text-4xl font-bold text-white sm:text-5xl`}
            >
              See CocoStyle In Action
            </h2>
            <p className="mt-3 text-white/70">
              Watch how 10 seconds changes your entire day
            </p>
            <div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <div
                className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1920&q=80')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-black/60" />
                <button
                  onClick={() => setShowVideoModal(true)}
                  className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] text-3xl text-white transition-all duration-300 hover:scale-105"
                >
                  ▶
                </button>
                <p className="absolute bottom-6 text-white/60">Watch 60-second demo</p>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                {["⚡ Takes 10 seconds", "🎯 Only from your wardrobe", "✨ Matches your skin tone"].map(
                  (point) => (
                    <span
                      key={point}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
                    >
                      {point}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-rose-400/30 to-transparent" />

        <section className="bg-black/50 py-6">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-3 px-4 sm:px-6 md:grid-cols-3 lg:grid-cols-5 lg:px-8">
            {[
              "🔒 Bank-Level Security",
              "⭐ 4.9 Star Rating",
              "👗 10,000+ Outfits Created",
              "🌍 Used in 50+ Countries",
              "🔒 SSL Secured",
              "🛡️ GDPR Compliant",
              "🚫 Data Never Sold",
            ].map((badge) => (
              <div
                key={badge}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-medium text-white backdrop-blur-md"
              >
                {badge}
              </div>
            ))}
            <div className="col-span-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-medium text-white backdrop-blur-md md:col-span-3 lg:col-span-2">
              <p>😊 97% Would Recommend</p>
              <div className="mt-2 flex items-center justify-center">
                {["P", "A", "S", "R", "E"].map((letter, idx) => (
                  <span
                    key={letter}
                    className={`-ml-2 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white ${idx % 2 === 0 ? "bg-[#e8a598]" : "bg-[#8b5cf6]"}`}
                  >
                    {letter}
                  </span>
                ))}
              </div>
              <a href="#" className="mt-1 inline-block text-xs text-white/70">
                Join them →
              </a>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-rose-400/30 to-transparent" />

        <section className="bg-black/50 py-8">
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-xs uppercase tracking-widest text-white/30">Coming Soon</p>
            <p className="mt-2 text-sm uppercase tracking-widest text-white/40">As Seen In</p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-8">
              <span className="font-serif text-2xl font-bold italic text-white/30 transition-all duration-300 hover:text-white/60">
                VOGUE
              </span>
              <span className="text-xl font-light tracking-widest text-white/30 transition-all duration-300 hover:text-white/60">
                ELLE
              </span>
              <span className="font-serif text-lg text-white/30 transition-all duration-300 hover:text-white/60">
                Times of India
              </span>
              <span className="text-xl font-bold text-white/30 transition-all duration-300 hover:text-white/60">
                TechCrunch
              </span>
              <span className="text-lg text-white/30 transition-all duration-300 hover:text-white/60">
                Product Hunt
              </span>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-rose-400/30 to-transparent" />

        <section
          ref={statsRef}
          className="reveal border-y border-white/10 bg-white/5 py-8 backdrop-blur-md"
        >
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-0 sm:px-6 lg:px-8">
            <div className="text-center sm:border-r sm:border-white/10">
              <div className="flex items-center justify-center gap-2">
                <p className="text-3xl font-bold text-[#e8a598]">
                  {livePeopleCount.toLocaleString()} 👥
                </p>
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-green-400">live</span>
              </div>
              <p className="mt-2 text-sm text-white/60">
                {language === "HI" ? "लोग स्टाइल किए" : "People Styled Daily"}
              </p>
            </div>
            <div className="text-center sm:border-r sm:border-white/10">
              <p className="text-3xl font-bold text-[#e8a598]">98%</p>
              <p className="mt-2 text-sm text-white/60">
                {language === "HI" ? "स्किन टोन सटीकता" : "Skin Tone Accuracy"}
              </p>
            </div>
            <div className="text-center lg:border-r lg:border-white/10">
              <p className="text-3xl font-bold text-[#e8a598]">4.9 ★</p>
              <p className="mt-2 text-sm text-white/60">
                {language === "HI" ? "यूज़र रेटिंग" : "User Rating"}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <p className="text-3xl font-bold text-green-400">{visitors}</p>
              </div>
              <p className="mt-2 text-sm text-white/60">People Viewing Now 👀</p>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-rose-400/30 to-transparent" />

        <section className="bg-black/95 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl text-center">
            <h2
              className={`${playfair.className} text-4xl font-bold text-white sm:text-5xl`}
            >
              See CocoStyle In Action
            </h2>
            <p className="mt-3 text-white/70">
              Pick an occasion and see what AI suggests
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {(Object.keys(occasionData) as OccasionKey[]).map((key) => {
                const active = selectedOccasion === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedOccasion(key)}
                    className={`rounded-full border px-5 py-2 text-sm font-medium transition-all duration-300 hover:scale-105 ${
                      active
                        ? "border-transparent bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] text-white"
                        : "border-white/30 bg-white/5 text-white"
                    }`}
                  >
                    {occasionData[key].icon} {key}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-8 text-left backdrop-blur-md">
              <h3 className="text-2xl font-bold text-white">
                {occasionData[selectedOccasion].name}
              </h3>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {occasionData[selectedOccasion].items.map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-white/10 bg-white/5 p-3 text-center text-white/90"
                  >
                    {item}
                  </div>
                ))}
              </div>
              <p className="mt-5 text-white/80">
                <span className="font-semibold text-white">Why this works: </span>
                {occasionData[selectedOccasion].why}
              </p>
              <p className="mt-3 text-white/90">
                AI confidence score:{" "}
                <span className="font-bold text-[#e8a598]">
                  {occasionData[selectedOccasion].score}
                </span>
              </p>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-rose-400/30 to-transparent" />

        <section
          id="features"
          className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1920&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/80" />
          <div className="relative mx-auto max-w-6xl">
            <h2
              className={`${playfair.className} text-center text-4xl font-bold text-white sm:text-5xl`}
            >
              Everything You Need To Look Amazing
            </h2>
            <p className="mt-3 text-center text-white/70">
              Powered by 6 AI agents working together
            </p>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <div className="reveal" style={{ animation: "float 3s ease-in-out infinite" }}>
                <article className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md transition-all duration-300 hover:-translate-y-1">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#e8a598]/25 text-3xl">
                    🎨
                  </div>
                  <h3 className="text-xl font-bold text-white">Skin Tone AI</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/80">
                    Upload one photo. Our AI detects your exact skin tone and
                    undertone — then matches every outfit to make you glow.
                  </p>
                </article>
              </div>

              <div
                className="reveal"
                style={{ animation: "float 3s ease-in-out infinite 1s" }}
              >
                <article className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md transition-all duration-300 hover:-translate-y-1">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#8b5cf6]/25 text-3xl">
                    👗
                  </div>
                  <h3 className="text-xl font-bold text-white">Smart Wardrobe</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/80">
                    Add your clothes once. AI auto-tags everything. Add or delete
                    anytime. 50 items free, 150 on premium.
                  </p>
                </article>
              </div>

              <div
                className="reveal"
                style={{ animation: "float 3s ease-in-out infinite 2s" }}
              >
                <article className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md transition-all duration-300 hover:-translate-y-1">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#e8a598]/30 to-[#8b5cf6]/30 text-3xl">
                    ✨
                  </div>
                  <h3 className="text-xl font-bold text-white">Virtual Try-On</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/80">
                    See photorealistic outfits on YOUR body before wearing them.
                    Powered by advanced AI fabric rendering.
                  </p>
                </article>
              </div>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-rose-400/30 to-transparent" />

        <section className="bg-black px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2
              className={`${playfair.className} text-center text-4xl font-bold text-white sm:text-5xl`}
            >
              Made For Every Skin Tone
            </h2>
            <p className="mx-auto mt-3 max-w-3xl text-center text-white/80">
              CocoStyle celebrates all skin tones. Every person deserves to look
              their best.
            </p>
            <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3">
              {[
                ["#F5DEB3", "Fair & Light", "Pastels & Jewel Tones"],
                ["#D4A76A", "Warm Medium", "Earth Tones & Navy"],
                ["#C68642", "Golden Brown", "Rust & Olive Tones"],
                ["#8D5524", "Rich Brown", "Emerald & Gold Tones"],
                ["#4A2912", "Deep Brown", "Bright Colours & White"],
                ["#2C1810", "Deep & Rich", "Bold Contrasts"],
              ].map(([color, tone, badge]) => (
                <div
                  key={tone}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-rose-300/50 hover:shadow-lg hover:shadow-rose-400/20"
                >
                  <div
                    className="mx-auto h-14 w-14 rounded-full border border-white/20"
                    style={{ backgroundColor: color }}
                  />
                  <p className="mt-4 font-bold text-white">{tone}</p>
                  <p className="mt-2 text-sm text-white/80">{badge}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-rose-400/30 to-transparent" />

        <section id="how-it-works" className="bg-black px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2
              className={`${playfair.className} text-center text-4xl font-bold text-white sm:text-5xl`}
            >
              Get Styled In 3 Simple Steps
            </h2>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <article className="reveal overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-48 w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80"
                    alt="Upload your photo"
                    fill
                    className="rounded-t-2xl object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-7">
                  <p className="text-6xl font-bold text-rose-300">01</p>
                  <h3 className="mt-3 text-xl font-bold text-white">Upload Your Photo</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/80">
                    CocoStyle instantly detects your skin tone and undertone from
                    one clear photo.
                  </p>
                </div>
              </article>

              <article className="reveal overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-48 w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1467043198406-dc953a3defa0?w=400&q=80"
                    alt="Build your closet"
                    fill
                    className="rounded-t-2xl object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-7">
                  <p className="text-6xl font-bold text-rose-300">02</p>
                  <h3 className="mt-3 text-xl font-bold text-white">Build Your Closet</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/80">
                    Upload photos of your clothes. AI auto-removes background and
                    tags each item automatically.
                  </p>
                </div>
              </article>

              <article className="reveal overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-48 w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80"
                    alt="Get styled instantly"
                    fill
                    className="rounded-t-2xl object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-7">
                  <p className="text-6xl font-bold text-rose-300">03</p>
                  <h3 className="mt-3 text-xl font-bold text-white">
                    Get Styled Instantly
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/80">
                    Pick an occasion. Our AI suggests 3 perfect outfit
                    combinations — only from what you own.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-rose-400/30 to-transparent" />

        <section className="bg-black px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2
              className={`${playfair.className} text-center text-4xl font-bold text-white sm:text-5xl`}
            >
              What Our Users Say
            </h2>
            <p className="mt-3 text-center text-white/70">
              Real people. Real style transformations.
            </p>
            <div className="mt-12 hidden gap-6 md:grid md:grid-cols-2">
              {testimonialsData.map(([letter, avatarBg, quote, name, location]) => (
                <article
                  key={name}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1"
                >
                  <p className="text-white">⭐⭐⭐⭐⭐</p>
                  <p className="mt-4 text-white/90">{quote}</p>
                  <div className="mt-5 flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${avatarBg}`}
                    >
                      {letter}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{name}</p>
                      <p className="text-sm text-white/70">{location}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-12 md:hidden">
              {testimonialsData.slice(currentTestimonialIndex, currentTestimonialIndex + 1).map(
                ([letter, avatarBg, quote, name, location]) => (
                  <article
                    key={name}
                    className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
                  >
                    <p className="text-white">⭐⭐⭐⭐⭐</p>
                    <p className="mt-4 text-white/90">{quote}</p>
                    <div className="mt-5 flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${avatarBg}`}
                      >
                        {letter}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{name}</p>
                        <p className="text-sm text-white/70">{location}</p>
                      </div>
                    </div>
                  </article>
                )
              )}
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  onClick={() =>
                    setCurrentTestimonialIndex((prev) => (prev - 1 + testimonialsData.length) % testimonialsData.length)
                  }
                  className="rounded-full border border-white/20 px-3 py-1 text-white"
                >
                  ←
                </button>
                <div className="flex items-center gap-1">
                  {testimonialsData.map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-2 w-2 rounded-full ${idx === currentTestimonialIndex ? "bg-[#e8a598]" : "bg-white/30"}`}
                    />
                  ))}
                </div>
                <button
                  onClick={() =>
                    setCurrentTestimonialIndex((prev) => (prev + 1) % testimonialsData.length)
                  }
                  className="rounded-full border border-white/20 px-3 py-1 text-white"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-rose-400/30 to-transparent" />

        <section className="bg-black px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2
              className={`${playfair.className} text-center text-4xl font-bold text-white sm:text-5xl`}
            >
              The CocoStyle Transformation
            </h2>
            <p className="mt-3 text-center text-white/70">
              See the difference AI styling makes
            </p>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                [
                  "Morning Rush",
                  "😫",
                  "30 minutes deciding. Late for work. Mismatched outfit.",
                  "😍",
                  "10 seconds. Perfect outfit. Compliments all day.",
                ],
                [
                  "The Party Problem",
                  "😰",
                  "Standing at closet for an hour. Nothing feels right. Skip the party.",
                  "🎉",
                  "3 AI suggestions instantly. Confident. Life of the party.",
                ],
                [
                  "The Skin Tone Struggle",
                  "😕",
                  "Buying clothes that look great in store but wrong on me.",
                  "✨",
                  "Every suggestion matches my skin tone perfectly. Always glowing.",
                ],
              ].map(([title, bEmoji, bText, aEmoji, aText]) => (
                <article
                  key={title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md"
                >
                  <p className="mb-4 text-center text-lg font-bold text-white">{title}</p>
                  <div className="relative grid overflow-hidden rounded-xl md:grid-cols-2">
                    <div className="bg-gray-800 p-6 text-center">
                      <p className="text-5xl">{bEmoji}</p>
                      <p className="mt-2 text-xs font-bold tracking-widest text-red-400">
                        BEFORE
                      </p>
                      <p className="mt-3 text-sm text-white/80">{bText}</p>
                    </div>
                    <div className="bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] p-6 text-center">
                      <p className="text-5xl">{aEmoji}</p>
                      <p className="mt-2 text-xs font-bold tracking-widest text-white">
                        AFTER
                      </p>
                      <p className="mt-3 text-sm text-white">{aText}</p>
                    </div>
                    <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-black/80 px-2 py-1 text-xs font-bold text-white">
                      VS
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-black px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2
              className={`${playfair.className} text-center text-4xl font-bold text-white sm:text-5xl`}
            >
              Why Choose CocoStyle?
            </h2>
            <p className="mt-3 text-center text-white/70">
              See how we compare to other wardrobe apps
            </p>
            <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
              <div className="grid grid-cols-5 bg-white/10 text-center text-sm font-semibold text-white">
                <div className="p-3">Feature</div>
                <div className="bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] p-3 font-bold text-white">
                  CocoStyle 👑
                </div>
                <div className="p-3">Acloset</div>
                <div className="p-3">Pureple</div>
                <div className="p-3">Robe</div>
              </div>
              {[
                ["Skin Tone Detection", "✅", "❌", "❌", "❌"],
                ["AI Outfit Rating", "✅", "❌", "❌", "❌"],
                ["Virtual Try-On", "✅", "❌", "❌", "❌"],
                ["Only Your Wardrobe", "✅", "✅", "✅", "❌"],
                ["Free Forever Plan", "✅", "✅", "❌", "❌"],
                ["7% Donated to Charity", "✅", "❌", "❌", "❌"],
                ["Occasion-Based AI", "✅", "❌", "✅", "❌"],
                ["Weather Integration", "✅", "✅", "❌", "❌"],
                ["Price", "Free Forever", "Coming Soon", "Coming Soon", "Paid only"],
              ].map((row, idx) => (
                <div
                  key={row[0]}
                  className={`grid grid-cols-5 text-center text-sm ${
                    idx % 2 === 0 ? "bg-white/5" : "bg-transparent"
                  }`}
                >
                  <div className="p-3 text-white/80">{row[0]}</div>
                  <div className="p-3 font-bold text-[#e8a598]">
                    {row[1] === "✅" ? <span className="text-lg text-green-400">✅</span> : row[1]}
                  </div>
                  <div className="p-3">
                    {row[2] === "✅" ? (
                      <span className="text-lg font-bold text-green-400">✅</span>
                    ) : row[2] === "❌" ? (
                      <span className="text-lg text-red-400/60">❌</span>
                    ) : (
                      <span className="text-white/80">{row[2]}</span>
                    )}
                  </div>
                  <div className="p-3">
                    {row[3] === "✅" ? (
                      <span className="text-lg font-bold text-green-400">✅</span>
                    ) : row[3] === "❌" ? (
                      <span className="text-lg text-red-400/60">❌</span>
                    ) : (
                      <span className="text-white/80">{row[3]}</span>
                    )}
                  </div>
                  <div className="p-3">
                    {row[4] === "✅" ? (
                      <span className="text-lg font-bold text-green-400">✅</span>
                    ) : row[4] === "❌" ? (
                      <span className="text-lg text-red-400/60">❌</span>
                    ) : (
                      <span className="text-white/80">{row[4]}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center italic text-white/80">
              CocoStyle is the only app that combines skin tone AI, outfit
              rating, virtual try-on AND donates to charity.
            </p>
          </div>
        </section>

        <section className="bg-black/95 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div>
              <p className="text-8xl leading-none text-[#e8a598]">&quot;</p>
              <h3 className={`${playfair.className} text-3xl font-bold text-white`}>
                Why I Built CocoStyle
              </h3>
              <div className="mt-4 space-y-4 leading-relaxed text-white/80">
                <p>
                  Every morning I stood in front of my wardrobe for 30 minutes. I
                  had plenty of clothes but never knew what to wear. I kept buying
                  new things thinking that would help. It didn&apos;t.
                </p>
                <p>
                  Then I realised the problem wasn&apos;t my wardrobe. It was that I
                  didn&apos;t know which colours suited my skin tone. And I had no
                  system for putting outfits together.
                </p>
                <p>
                  So I built CocoStyle. An AI that knows your skin tone, knows
                  your wardrobe, and builds perfect outfits in seconds. From what
                  you already own.
                </p>
              </div>
              <div className="relative mt-8 rounded-2xl border border-rose-400/30 bg-[linear-gradient(135deg,rgba(232,165,152,0.15),rgba(139,92,246,0.15))] p-8 backdrop-blur-sm">
                <span className="absolute left-4 top-4 h-2 w-2 rounded-full bg-rose-400/40 animate-ping" />
                <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-rose-400/40 animate-ping [animation-delay:300ms]" />
                <span className="absolute bottom-4 left-4 h-2 w-2 rounded-full bg-rose-400/40 animate-ping [animation-delay:600ms]" />
                <span className="absolute bottom-4 right-4 h-2 w-2 rounded-full bg-rose-400/40 animate-ping [animation-delay:900ms]" />

                <p className="text-8xl leading-none text-[#e8a598]/30">&quot;</p>
                <p className="mb-4 text-2xl font-bold text-white">
                  Today, CocoStyle helps thousands of people wake up confident —
                </p>
                <p
                  className="mb-4 bg-clip-text text-3xl font-bold text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #e8a598, #8b5cf6, #e8a598, #e8a598)",
                    backgroundSize: "300% auto",
                    animation: "shimmer 4s linear infinite",
                  }}
                >
                  knowing exactly what to wear, feeling attractive, feeling THEM.
                </p>
                <p className="mb-6 text-xl text-white/90">
                  Not because they bought new clothes. But because they finally
                  understood the ones they had.
                </p>

                <div className="mx-auto my-6 h-1 w-24 bg-gradient-to-r from-[#e8a598] to-[#8b5cf6]" />

                <div className="rounded-xl bg-white/5 p-6">
                  <div className="grid gap-4 text-center sm:grid-cols-3">
                    <div>
                      <p className="bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] bg-clip-text text-3xl font-bold text-transparent">
                        10,000+
                      </p>
                      <p className="text-sm text-white/60">People styled daily</p>
                    </div>
                    <div>
                      <p className="bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] bg-clip-text text-3xl font-bold text-transparent">
                        7%
                      </p>
                      <p className="text-sm text-white/60">
                        Profits to homeless &amp; elderly
                      </p>
                    </div>
                    <div>
                      <p className="bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] bg-clip-text text-3xl font-bold text-transparent">
                        ∞
                      </p>
                      <p className="text-sm text-white/60">Confidence built</p>
                    </div>
                  </div>
                  <p className="mt-4 animate-pulse text-center text-sm font-medium italic text-rose-300">
                    ✨ Every outfit suggestion changes someone&apos;s day. Every
                    subscription changes someone&apos;s life.
                  </p>
                </div>
              </div>
              <p className="mt-8 text-center text-xl font-medium italic text-rose-300">
                — The CocoStyle Team 🇮🇳
              </p>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-rose-400/30 to-transparent" />

        <section id="pricing" className="bg-[#111111] px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2
              className={`${playfair.className} text-center text-4xl font-bold text-white sm:text-5xl`}
            >
              Simple, Honest Pricing
            </h2>
            <p className="mt-3 text-center text-white/80">
              Start free. Upgrade when you&apos;re ready.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3">
              <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
                Best Value
              </span>
            </div>

            <div className="mx-auto mt-6 flex max-w-2xl items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
              <span className="text-4xl">💰</span>
              <div className="flex-1">
                <p className="text-xl font-bold text-white">30-Day Money Back Guarantee</p>
                <p className="text-sm text-white/70">
                  Not happy with CocoStyle? Get a full refund within 30 days. No
                  questions asked. No forms. Just email us.
                </p>
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                ✓
              </span>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              <article className="reveal flex h-full flex-col rounded-2xl border border-white/20 bg-white/5 p-8 transition-all duration-300 hover:-translate-y-1">
                <span className="inline-block w-fit rounded-full border border-white/40 px-3 py-1 text-xs font-semibold text-white">
                  Free Forever
                </span>
                <p className="mt-4 text-5xl font-bold text-white transition-all duration-300">
                  Free Forever
                </p>
                <ul className="mt-6 space-y-3 text-sm text-white/90">
                  <li>✓ 50 clothing items</li>
                  <li>✓ 3 outfit suggestions per day</li>
                  <li>✓ Skin tone detection</li>
                  <li>✓ Basic wardrobe management</li>
                  <li>✓ Add &amp; delete clothes anytime</li>
                </ul>
                <button className="mt-auto w-full rounded-full border border-white px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-105">
                  Get Started Free
                </button>
              </article>

              <article className="reveal flex h-full scale-100 flex-col rounded-2xl border-2 border-rose-400/50 bg-white/5 p-8 transition-all duration-300 hover:-translate-y-1 lg:scale-105">
                <span className="mb-3 inline-block w-fit rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
                  Premium Plan
                </span>
                <span className="inline-block w-fit rounded-full bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] px-3 py-1 text-xs font-semibold text-white">
                  Coming Soon
                </span>
                <div className="mt-4 flex items-end gap-2">
                  <p className="bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] bg-clip-text text-3xl font-bold text-transparent">
                    Join Waitlist
                  </p>
                </div>
                <p className="mt-2 text-sm text-white/60">
                  Be first to know when Premium launches
                </p>
                <ul className="mt-6 space-y-3 text-sm text-white/90">
                  <li>✓ 150 clothing items</li>
                  <li>✓ Unlimited outfit suggestions</li>
                  <li>✓ Virtual Try-On (photorealistic)</li>
                  <li>✓ AI outfit rating out of 10</li>
                  <li>✓ Outfit history &amp; weekly planner</li>
                  <li>✓ OOTD morning notifications</li>
                  <li>✓ Wardrobe insights &amp; analytics</li>
                  <li>✓ Priority support</li>
                </ul>
                <button className="mt-auto w-full rounded-full bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-105">
                  Join Waitlist
                </button>
                <p className="mt-3 text-center text-sm font-medium text-rose-300">
                  🔥 Premium plan is coming soon
                </p>
                <p className="mt-4 text-center text-xs text-white/60">
                  Cancel anytime · No hidden fees
                </p>
              </article>
            </div>

            <div className="mt-6 text-center">
              <p className="mb-4 text-xs text-white/40">Secure Payment Methods Accepted</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {["💳 VISA", "💳 Mastercard", "📱 UPI", "📱 GPay", "📱 Paytm", "🅿️ PayPal"].map(
                  (method) => (
                    <span
                      key={method}
                      className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/60 transition-all duration-300 hover:bg-white/10"
                    >
                      {method}
                    </span>
                  )
                )}
              </div>
              <p className="mt-3 text-xs text-white/40">
                🔒 256-bit SSL encryption · Your payment is 100% secure
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  <span className="text-4xl">🎁</span>
                  <div>
                    <p className="text-xl font-bold text-white">
                      Refer a Friend · Exclusive early access
                    </p>
                    <p className="text-sm text-white/70">
                      Share CocoStyle with a friend. When they sign up, you both
                      get exclusive early access.
                    </p>
                  </div>
                </div>
                <button className="rounded-full bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-105">
                  Share Now →
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-rose-400/30 to-transparent" />

        <section
          className="reveal relative overflow-hidden bg-black px-4 py-20 sm:px-6 lg:px-8"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1920&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/75" />
          <div className="relative mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-md sm:p-10">
            <p className="text-6xl animate-pulse">🌟</p>
            <h2
              className={`${playfair.className} mt-4 text-4xl font-bold text-white sm:text-5xl`}
            >
              Style That Changes Lives
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
              Every month, 7% of CocoStyle&apos;s profits go directly to homeless
              shelters and elderly care homes — providing meals, warmth, and
              dignity to people who need it most. Your style journey helps
              someone else&apos;s life journey.
            </p>
            <p className="mt-4 text-sm text-white/70">
              We publish full donation reports every month so you can see exactly
              who you helped. Real impact. Real people. Real change. 🧡
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/90">
                🏠 Homeless shelters supported
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/90">
                🍽️ Meals provided monthly
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/90">
                👴 Elderly care homes helped
              </div>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-rose-400/30 to-transparent" />

        <section className="bg-black px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2
              className={`${playfair.className} text-center text-4xl font-bold text-white sm:text-5xl`}
            >
              Frequently Asked Questions
            </h2>
            <div className="mx-auto mt-10 max-w-4xl space-y-4">
              {faqs.map((faq, idx) => {
                const open = openFaq === idx;
                return (
                  <div
                    key={faq.q}
                    className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
                  >
                    <button
                      onClick={() => setOpenFaq(open ? null : idx)}
                      className="flex w-full items-center justify-between text-left text-white"
                    >
                      <span className="font-semibold">{faq.q}</span>
                      <span
                        className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                      >
                        ⌄
                      </span>
                    </button>
                    <div
                      className={`grid transition-all duration-300 ${
                        open ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <p className="overflow-hidden text-white/80">{faq.a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-rose-400/30 to-transparent" />

        <section id="style-dna" className="bg-black px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <span className="inline-flex items-center rounded-full border border-rose-400/30 bg-rose-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-rose-300">
                Your Style DNA Report
              </span>
              <h2
                className={`${playfair.className} mt-4 text-4xl font-bold text-white sm:text-5xl`}
              >
                Understand Why Outfits Work For You
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-white/70">
                CocoStyle builds your personal style blueprint from your skin tone,
                fit preferences, favorite colors, and event patterns so every
                recommendation feels naturally you.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "Tone Signature",
                  desc: "Detects your undertone and ranks colors by confidence score for day and night looks.",
                  icon: "🎨",
                },
                {
                  title: "Occasion Mapping",
                  desc: "Learns what works for office, weddings, travel, and casual hangouts from your real choices.",
                  icon: "📍",
                },
                {
                  title: "Fit Intelligence",
                  desc: "Understands silhouettes you repeat and avoids cuts you skip, so suggestions stay wearable.",
                  icon: "✨",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
                >
                  <p className="text-3xl">{item.icon}</p>
                  <h3 className="mt-4 text-xl font-bold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5 py-3">
              <div className="dna-ticker-track whitespace-nowrap text-sm text-white/70">
                <span className="mx-5">Skin Tone Accuracy: 94.7%</span>
                <span className="mx-5">Fit Match Confidence: 91.2%</span>
                <span className="mx-5">Occasion Relevance: 96.1%</span>
                <span className="mx-5">Style Satisfaction: 4.9/5</span>
                <span className="mx-5">Data Never Sold</span>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-6">
              <h3 className="text-xl font-bold text-white">Your Data. Your Privacy. Always.</h3>
              <p className="mt-2 text-sm text-white/75">
                Uploads are encrypted in transit and at rest. We use your photos
                only to generate your results and never share or sell personal
                wardrobe data.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["🔒 End-to-end encrypted", "✅ Privacy-first AI", "🛡️ Safe upload scanning"].map(
                  (badge) => (
                    <span
                      key={badge}
                      className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/80"
                    >
                      {badge}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-black px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl rounded-2xl border border-rose-400/20 bg-[linear-gradient(135deg,rgba(232,165,152,0.1),rgba(139,92,246,0.1))] p-10 text-center backdrop-blur-md">
            <p className="text-5xl">💌</p>
            <h3 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
              Get Weekly Style Tips — Free Forever
            </h3>
            <p className="mx-auto mt-3 max-w-lg text-white/70">
              Join 5,000+ people getting weekly outfit ideas, colour tips and
              style hacks delivered straight to their inbox. Free. Always.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 rounded-full border border-white/20 bg-white/10 px-6 py-4 text-sm text-white placeholder-white/40 focus:border-rose-400 focus:outline-none"
              />
              <button
                onClick={() => {
                  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)) {
                    setSubscribed(true);
                  }
                }}
                className="whitespace-nowrap rounded-full bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] px-8 py-4 font-medium text-white transition-all duration-300 hover:scale-105"
              >
                Subscribe Free →
              </button>
            </div>
            {subscribed && (
              <p className="mt-3 text-sm text-green-400">
                🎉 Welcome to CocoStyle! Check your inbox.
              </p>
            )}
            <p className="mt-4 text-center text-xs text-white/40">
              🔒 No spam ever · Unsubscribe anytime · Join 5,000+ subscribers
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {["💡 Weekly Outfit Ideas", "🎨 Colour Theory Tips", "✨ Exclusive Style Hacks"].map(
                (benefit) => (
                  <span
                    key={benefit}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70"
                  >
                    {benefit}
                  </span>
                )
              )}
            </div>
          </div>
        </section>
      </main>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-rose-400/30 to-transparent" />

      <footer className="border-t border-white/10 bg-black px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-3">
          <div>
            <p
              className={`${playfair.className} bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] bg-clip-text text-3xl font-bold italic text-transparent`}
            >
              CocoStyle
            </p>
            <p className="mt-2 text-sm text-white/50">
              Look your best from what you own
            </p>
            <div className="mt-5 flex items-center gap-6">
              <a href="#" className="flex items-center gap-2 text-sm text-white/50 transition hover:text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram
              </a>
              <a href="#" className="flex items-center gap-2 text-sm text-white/50 transition hover:text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Twitter
              </a>
              <a href="#" className="flex items-center gap-2 text-sm text-white/50 transition hover:text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="mb-3 text-xs uppercase tracking-widest text-white/40">Product</p>
              <div className="space-y-2 text-sm text-white/50">
                <a href="#features" className="block transition hover:text-white">Features</a>
                <a href="#pricing" className="block transition hover:text-white">Pricing</a>
                <a href="#how-it-works" className="block transition hover:text-white">How It Works</a>
                <a href="#" className="block transition hover:text-white">Virtual Try-On</a>
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs uppercase tracking-widest text-white/40">Company</p>
              <div className="space-y-2 text-sm text-white/50">
                <a href="#" className="block transition hover:text-white">About Us</a>
                <a href="#" className="block transition hover:text-white">Privacy Policy</a>
                <a href="#" className="block transition hover:text-white">Terms of Service</a>
                <a href="#" className="block transition hover:text-white">Contact Us</a>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs uppercase tracking-widest text-white/40">Stay in the loop</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none"
              />
              <button className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-white/70 transition hover:text-white">
                →
              </button>
            </div>
            <div className="mt-6 border-t border-white/10 pt-6">
              <p className="mb-3 text-center text-xs text-white/30">Share CocoStyle</p>
              <div className="flex items-center justify-center gap-3">
                <a
                  href="https://wa.me/?text=Check%20out%20CocoStyle%20-%20AI%20wardrobe%20styling%20app!%20Look%20your%20best%20from%20what%20you%20own%20🌟"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Share on WhatsApp"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition hover:bg-white/10 hover:text-white"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText("https://cocostyle.app");
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    } catch {
                      // ignore clipboard failure
                    }
                  }}
                  title="Copy link"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition hover:bg-white/10 hover:text-white"
                >
                  🔗
                </button>
                <a
                  href="mailto:?subject=Check out CocoStyle&body=I found this amazing AI styling app!"
                  title="Share via email"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition hover:bg-white/10 hover:text-white"
                >
                  ✉️
                </a>
              </div>
              {copiedLink && (
                <p className="mt-2 text-center text-xs text-green-400">Copied!</p>
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 flex w-full max-w-6xl flex-col items-center gap-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="rounded-xl border border-white/20 bg-black px-6 py-3 text-white">
              <p className="text-xs text-white/60">🍎 Coming Soon to</p>
              <p className="font-semibold">App Store</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-black px-6 py-3 text-white">
              <p className="text-xs text-white/60">▶ Coming Soon to</p>
              <p className="font-semibold">Google Play</p>
            </div>
          </div>
          <p className="text-center text-sm text-white/50">
            iOS &amp; Android apps launching soon. Sign up to be notified first!
          </p>
          <div className="mt-3 w-full max-w-xl">
            <p className="mb-2 text-center text-white/70">
              📱 Join the waitlist for our iOS & Android app
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                value={waitlistEmail}
                onChange={(e) => setWaitlistEmail(e.target.value)}
                placeholder="Your email"
                className="flex-1 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm text-white placeholder-white/40 focus:outline-none"
              />
              <button className="rounded-full bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] px-5 py-2 text-sm text-white transition-all duration-300 hover:scale-105">
                Join Waitlist
              </button>
            </div>
            <p className="mt-2 text-center text-sm text-white/60">
              {waitlistCount.toLocaleString()} people already on the waitlist
            </p>
          </div>
        </div>

        <div className="mx-auto mt-8 w-full max-w-6xl border-t border-white/5 pt-6 text-xs text-white/40">
          <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
            <p>© 2025 CocoStyle. All rights reserved.</p>
            <p>🧡 7% of profits donated to those in need</p>
            <p>Made with ❤️ in India 🇮🇳</p>
          </div>
          <p className="mt-3 text-center text-[11px] text-white/35">
            🔐 Your style data is encrypted and never sold.
          </p>
        </div>
      </footer>

      {showToast && (
        <div
          className="fixed bottom-6 left-6 z-40 w-full max-w-xs rounded-xl border border-white/20 bg-gray-900/95 p-4 text-white backdrop-blur"
          style={{ animation: "toastIn 300ms ease forwards" }}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] text-xs font-bold">
              {socialProofMessages[toastIndex].replace(/^\S+\s/, "").charAt(0)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{socialProofMessages[toastIndex]}</p>
              <p className="mt-1 text-xs text-white/50">just now</p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="text-xs text-white/70 transition-all duration-300 hover:scale-105"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {uploadSecurityToast && (
        <div className="fixed bottom-24 left-6 z-[70] rounded-lg border border-emerald-400/30 bg-emerald-500/15 px-4 py-2 text-sm text-emerald-200 backdrop-blur">
          🔐 Upload secured and scanned safely.
        </div>
      )}

      {showVideoModal && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 px-4"
          onClick={() => setShowVideoModal(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute right-3 top-3 rounded-full border border-white/20 px-3 py-1 text-white"
              aria-label="Close video modal"
            >
              ✕
            </button>
            <p className="mb-4 text-6xl">🎬</p>
            <h3 className="mb-3 text-2xl font-bold text-white">Demo Video Coming Soon!</h3>
            <p className="mb-6 text-sm text-white/70">
              We are recording our app demo video. Sign up to be notified when it
              launches!
            </p>
            <input
              type="email"
              placeholder="Your email address"
              value={videoNotifyEmail}
              onChange={(e) => setVideoNotifyEmail(e.target.value)}
              className="mb-3 w-full rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm text-white placeholder-white/40 focus:border-rose-400 focus:outline-none"
            />
            <button
              onClick={() => setVideoNotifySubscribed(true)}
              className="w-full rounded-full bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] py-3 font-medium text-white transition-all duration-300 hover:scale-105"
            >
              Notify Me When Ready 🔔
            </button>
            {videoNotifySubscribed && (
              <p className="mt-3 text-sm text-green-400">
                ✅ You&apos;re on the list! We&apos;ll notify you first.
              </p>
            )}
          </div>
        </div>
      )}

      {showExitPopup && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur">
          <div className="mx-auto flex min-h-full max-w-md items-center px-4">
            <div className="relative w-full rounded-2xl border border-white/20 bg-gray-900/95 p-6 backdrop-blur-md">
              <button
                onClick={() => setShowExitPopup(false)}
                className="absolute right-3 top-3 text-white/70 transition-all duration-300 hover:scale-105"
                aria-label="Close popup"
              >
                ✕
              </button>
              <h3 className="text-2xl font-bold text-white">🎁 Wait! Don&apos;t Leave Yet...</h3>
              <p className="mt-3 text-xl font-bold text-white">Get 1 Month Premium FREE</p>
              <p className="mt-2 text-sm text-white/80">
                Sign up today and get your first month of CocoStyle Premium
                completely free. No credit card needed.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                <li>✓ 150 clothing items</li>
                <li>✓ Unlimited outfit suggestions</li>
                <li>✓ Virtual Try-On included</li>
                <li>✓ Cancel anytime</li>
              </ul>
              <button
                onClick={() => {
                  triggerConfetti();
                  setShowExitPopup(false);
                }}
                className="mt-5 w-full rounded-full bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] px-6 py-3 font-semibold text-white transition-all duration-300 hover:scale-105"
              >
                Claim My Free Month →
              </button>
              <button
                onClick={() => setShowExitPopup(false)}
                className="mt-3 w-full text-center text-sm text-white/50 transition-all duration-300 hover:scale-105"
              >
                No thanks, I&apos;ll stick with basic
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-gray-900/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <p className="text-xs text-white/80">Free to start · No credit card</p>
          <button
            onClick={triggerConfetti}
            className="rounded-full bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] px-6 py-2 text-sm font-semibold text-white transition-all duration-300 hover:scale-105"
          >
            Get Started →
          </button>
        </div>
      </div>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-24 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] text-xl font-bold text-white shadow-lg shadow-rose-500/30 transition-all duration-300 ${
          showBackToTop ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-label="Back to top"
      >
        ↑
      </button>

      <button
        onClick={() =>
          window.open(
            "https://wa.me/+919999999999?text=Hi! I have a question about CocoStyle",
            "_blank"
          )
        }
        className="fixed bottom-24 right-24 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-xl text-white shadow-lg shadow-green-500/30 transition-all duration-300 hover:scale-105 hover:bg-green-600"
        aria-label="Chat with us on WhatsApp"
        title="Chat with us on WhatsApp"
      >
        💬
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500 animate-ping" />
      </button>

      {!cookieAccepted && (
        <div className="fixed bottom-16 left-0 right-0 z-[90] border-t border-white/10 bg-gray-900/95 px-6 py-4 backdrop-blur md:bottom-0">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-white/70">
              🍪 We use cookies to improve your experience and remember your
              preferences. By using CocoStyle you agree to our Privacy Policy.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setCookieAccepted(true);
                  try {
                    localStorage.setItem("cookies", "accepted");
                  } catch {
                    // ignore storage errors
                  }
                }}
                className="rounded-full bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] px-6 py-2 text-sm text-white transition-all duration-300 hover:scale-105"
              >
                Accept All
              </button>
              <button
                onClick={() => {
                  setCookieAccepted(true);
                  try {
                    localStorage.setItem("cookies", "declined");
                  } catch {
                    // ignore storage errors
                  }
                }}
                className="rounded-full border border-white px-6 py-2 text-sm text-white/60 transition-all duration-300 hover:scale-105"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

