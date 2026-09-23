"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { FLOWER_ASSETS } from "@/config/flowerAssets";
import RealButterfly from "@/components/RealButterfly";
import VisitTracker from "@/components/VisitTracker";
import GiftInteraction from "@/components/GiftInteraction";

interface StarParticle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speedY: number;
  speedX: number;
  pulseSpeed: number;
}

interface PlantLeaf {
  t: number; // 0 = base, 1 = tip
  side: "left" | "right";
  length: number;
  angle: number;
  delayOffset: number;
}

interface PlantData {
  id: string;
  name: string;
  flowerSrc: string;
  layer: "back" | "mid" | "front";
  flowerSize: number;
  flowerOffsetY?: number;
  // Cubic Bezier Stem Coordinates in viewBox (0 0 520 620)
  startX: number;
  startY: number;
  cp1X: number;
  cp1Y: number;
  cp2X: number;
  cp2Y: number;
  endX: number;
  endY: number;
  stemWidth: number;
  stemGradId: string;
  // 6-Phase Choreography Timings (in seconds)
  stemStartDelay: number;
  stemDuration: number;
  bloomDelay: number;
  bloomDuration: number;
  // Foliage
  leaves?: PlantLeaf[];
  // Independent breeze sway group
  swayClass: string;
}

// 34 Hand-tied Botanical Plants arranged into a wide, lush florist bouquet
const PLANTS_DATA: PlantData[] = [
  // =========================================================================
  // 1. PHASE 2: FIRST OUTER SPREAD ARCHITECTURE (t = 1.5s - 3.2s)
  // =========================================================================
  {
    id: "eucalyptus-far-left",
    name: "Outer Daisy Left Spread",
    flowerSrc: FLOWER_ASSETS.daisies.white,
    layer: "back",
    flowerSize: 98,
    startX: 242,
    startY: 570,
    cp1X: 160,
    cp1Y: 460,
    cp2X: 70,
    cp2Y: 360,
    endX: 42,
    endY: 275,
    stemWidth: 2.8,
    stemGradId: "stemDark",
    stemStartDelay: 1.5,
    stemDuration: 1.4,
    bloomDelay: 2.4, // Flower emerges as stem tip reaches position
    bloomDuration: 1.2,
    leaves: [
      { t: 0.45, side: "left", length: 32, angle: -42, delayOffset: 0.8 },
      { t: 0.70, side: "right", length: 28, angle: 32, delayOffset: 1.1 },
    ],
    swayClass: "animate-sway-left",
  },
  {
    id: "eucalyptus-far-right",
    name: "Outer Daisy Right Spread",
    flowerSrc: FLOWER_ASSETS.daisies.white,
    layer: "back",
    flowerSize: 98,
    startX: 278,
    startY: 570,
    cp1X: 360,
    cp1Y: 460,
    cp2X: 450,
    cp2Y: 360,
    endX: 478,
    endY: 275,
    stemWidth: 2.8,
    stemGradId: "stemDark",
    stemStartDelay: 1.8,
    stemDuration: 1.4,
    bloomDelay: 2.7,
    bloomDuration: 1.2,
    leaves: [
      { t: 0.45, side: "right", length: 32, angle: 42, delayOffset: 0.8 },
      { t: 0.70, side: "left", length: 28, angle: -32, delayOffset: 1.1 },
    ],
    swayClass: "animate-sway-right",
  },
  {
    id: "babys-breath-outer-left-high",
    name: "High Daisy Outer Left",
    flowerSrc: FLOWER_ASSETS.daisies.white,
    layer: "back",
    flowerSize: 92,
    startX: 246,
    startY: 570,
    cp1X: 170,
    cp1Y: 430,
    cp2X: 95,
    cp2Y: 290,
    endX: 68,
    endY: 180,
    stemWidth: 2.0,
    stemGradId: "stemLight",
    stemStartDelay: 2.2,
    stemDuration: 1.35,
    bloomDelay: 3.0,
    bloomDuration: 1.1,
    swayClass: "animate-sway-delicate",
  },
  {
    id: "babys-breath-outer-right-high",
    name: "High Daisy Outer Right",
    flowerSrc: FLOWER_ASSETS.daisies.white,
    layer: "back",
    flowerSize: 92,
    startX: 274,
    startY: 570,
    cp1X: 350,
    cp1Y: 430,
    cp2X: 425,
    cp2Y: 290,
    endX: 452,
    endY: 180,
    stemWidth: 2.0,
    stemGradId: "stemLight",
    stemStartDelay: 2.5,
    stemDuration: 1.35,
    bloomDelay: 3.3,
    bloomDuration: 1.1,
    swayClass: "animate-sway-delicate",
  },

  // =========================================================================
  // 2. PHASE 3: CANOPY & MID-EXPANSION (t = 3.2s - 6.0s)
  // =========================================================================
  {
    id: "cherry-blossom-top-center",
    name: "Pink Rose Top Canopy",
    flowerSrc: FLOWER_ASSETS.roses.pink,
    layer: "back",
    flowerSize: 135,
    startX: 260,
    startY: 570,
    cp1X: 262,
    cp1Y: 380,
    cp2X: 265,
    cp2Y: 220,
    endX: 260,
    endY: 82,
    stemWidth: 2.4,
    stemGradId: "stemDark",
    stemStartDelay: 3.2,
    stemDuration: 1.5,
    bloomDelay: 4.1,
    bloomDuration: 1.2,
    swayClass: "animate-sway-center",
  },
  {
    id: "cherry-blossom-top-left",
    name: "Pink Rose Top Left Canopy",
    flowerSrc: FLOWER_ASSETS.roses.pink,
    layer: "back",
    flowerSize: 124,
    startX: 252,
    startY: 570,
    cp1X: 210,
    cp1Y: 380,
    cp2X: 175,
    cp2Y: 230,
    endX: 155,
    endY: 115,
    stemWidth: 2.2,
    stemGradId: "stemDark",
    stemStartDelay: 3.4,
    stemDuration: 1.45,
    bloomDelay: 4.3,
    bloomDuration: 1.15,
    swayClass: "animate-sway-left",
  },
  {
    id: "cherry-blossom-top-right",
    name: "Pink Rose Top Right Canopy",
    flowerSrc: FLOWER_ASSETS.roses.pink,
    layer: "back",
    flowerSize: 124,
    startX: 268,
    startY: 570,
    cp1X: 310,
    cp1Y: 380,
    cp2X: 345,
    cp2Y: 230,
    endX: 365,
    endY: 115,
    stemWidth: 2.2,
    stemGradId: "stemDark",
    stemStartDelay: 3.6,
    stemDuration: 1.45,
    bloomDelay: 4.5,
    bloomDuration: 1.15,
    swayClass: "animate-sway-right",
  },
  {
    id: "lavender-mid-left",
    name: "Red Rose Mid Left Tier",
    flowerSrc: FLOWER_ASSETS.roses.red,
    layer: "back",
    flowerSize: 118,
    startX: 244,
    startY: 570,
    cp1X: 180,
    cp1Y: 450,
    cp2X: 125,
    cp2Y: 330,
    endX: 105,
    endY: 235,
    stemWidth: 2.2,
    stemGradId: "stemMid",
    stemStartDelay: 3.8,
    stemDuration: 1.35,
    bloomDelay: 4.7,
    bloomDuration: 1.1,
    swayClass: "animate-sway-delicate",
  },
  {
    id: "lavender-mid-right",
    name: "Red Rose Mid Right Tier",
    flowerSrc: FLOWER_ASSETS.roses.red,
    layer: "back",
    flowerSize: 118,
    startX: 276,
    startY: 570,
    cp1X: 340,
    cp1Y: 450,
    cp2X: 395,
    cp2Y: 330,
    endX: 415,
    endY: 235,
    stemWidth: 2.2,
    stemGradId: "stemMid",
    stemStartDelay: 4.0,
    stemDuration: 1.35,
    bloomDelay: 4.9,
    bloomDuration: 1.1,
    swayClass: "animate-sway-delicate",
  },
  {
    id: "babys-breath-inner-left",
    name: "White Daisy Inner Left High",
    flowerSrc: FLOWER_ASSETS.daisies.white,
    layer: "back",
    flowerSize: 90,
    startX: 254,
    startY: 570,
    cp1X: 215,
    cp1Y: 390,
    cp2X: 200,
    cp2Y: 250,
    endX: 205,
    endY: 150,
    stemWidth: 1.8,
    stemGradId: "stemLight",
    stemStartDelay: 4.2,
    stemDuration: 1.35,
    bloomDelay: 5.1,
    bloomDuration: 1.05,
    swayClass: "animate-sway-delicate",
  },
  {
    id: "babys-breath-inner-right",
    name: "White Daisy Inner Right High",
    flowerSrc: FLOWER_ASSETS.daisies.white,
    layer: "back",
    flowerSize: 90,
    startX: 266,
    startY: 570,
    cp1X: 305,
    cp1Y: 390,
    cp2X: 320,
    cp2Y: 250,
    endX: 315,
    endY: 150,
    stemWidth: 1.8,
    stemGradId: "stemLight",
    stemStartDelay: 4.4,
    stemDuration: 1.35,
    bloomDelay: 5.3,
    bloomDuration: 1.05,
    swayClass: "animate-sway-delicate",
  },

  // =========================================================================
  // 3. PHASE 4: MAIN EMOTIONAL FOCAL BLOOMS (t = 6.0s - 9.0s)
  // =========================================================================
  {
    id: "pink-rose-focal-centerpiece",
    name: "Blush English Rose Centerpiece",
    flowerSrc: FLOWER_ASSETS.roses.pink,
    layer: "front",
    flowerSize: 142,
    startX: 260,
    startY: 570,
    cp1X: 260,
    cp1Y: 460,
    cp2X: 260,
    cp2Y: 380,
    endX: 260,
    endY: 318,
    stemWidth: 4.0,
    stemGradId: "stemMain",
    stemStartDelay: 5.8,
    stemDuration: 1.3,
    bloomDelay: 6.6, // Emotional climax centerpiece
    bloomDuration: 1.35,
    leaves: [
      { t: 0.48, side: "left", length: 32, angle: -24, delayOffset: 0.6 },
      { t: 0.48, side: "right", length: 32, angle: 24, delayOffset: 0.6 },
    ],
    swayClass: "animate-sway-center",
  },
  {
    id: "white-peony-tall-center",
    name: "White Rose Tall Center",
    flowerSrc: FLOWER_ASSETS.roses.white,
    layer: "mid",
    flowerSize: 132,
    startX: 264,
    startY: 570,
    cp1X: 276,
    cp1Y: 400,
    cp2X: 284,
    cp2Y: 280,
    endX: 282,
    endY: 178,
    stemWidth: 3.6,
    stemGradId: "stemMain",
    stemStartDelay: 6.0,
    stemDuration: 1.35,
    bloomDelay: 6.8,
    bloomDuration: 1.3,
    leaves: [
      { t: 0.58, side: "right", length: 36, angle: 30, delayOffset: 0.7 },
    ],
    swayClass: "animate-sway-right",
  },
  {
    id: "red-rose-tall-left",
    name: "Velvety Red Rose Tall Left",
    flowerSrc: FLOWER_ASSETS.roses.red,
    layer: "mid",
    flowerSize: 126,
    startX: 254,
    startY: 570,
    cp1X: 236,
    cp1Y: 400,
    cp2X: 226,
    cp2Y: 280,
    endX: 228,
    endY: 184,
    stemWidth: 3.6,
    stemGradId: "stemMain",
    stemStartDelay: 6.2,
    stemDuration: 1.35,
    bloomDelay: 7.0,
    bloomDuration: 1.3,
    leaves: [
      { t: 0.58, side: "left", length: 36, angle: -30, delayOffset: 0.7 },
    ],
    swayClass: "animate-sway-left",
  },
  {
    id: "pink-tulip-tall-left",
    name: "Pink Rose Tall Left",
    flowerSrc: FLOWER_ASSETS.roses.pink,
    layer: "mid",
    flowerSize: 122,
    startX: 248,
    startY: 570,
    cp1X: 195,
    cp1Y: 410,
    cp2X: 145,
    cp2Y: 280,
    endX: 135,
    endY: 172,
    stemWidth: 3.4,
    stemGradId: "stemMain",
    stemStartDelay: 6.4,
    stemDuration: 1.3,
    bloomDelay: 7.2,
    bloomDuration: 1.2,
    leaves: [
      { t: 0.50, side: "left", length: 34, angle: -35, delayOffset: 0.7 },
      { t: 0.72, side: "right", length: 28, angle: 25, delayOffset: 0.95 },
    ],
    swayClass: "animate-sway-left",
  },
  {
    id: "white-rose-tall-right",
    name: "White Rose Tall Right",
    flowerSrc: FLOWER_ASSETS.roses.white,
    layer: "mid",
    flowerSize: 124,
    startX: 272,
    startY: 570,
    cp1X: 325,
    cp1Y: 410,
    cp2X: 375,
    cp2Y: 280,
    endX: 388,
    endY: 172,
    stemWidth: 3.4,
    stemGradId: "stemMain",
    stemStartDelay: 6.6,
    stemDuration: 1.3,
    bloomDelay: 7.4,
    bloomDuration: 1.2,
    leaves: [
      { t: 0.50, side: "right", length: 34, angle: 35, delayOffset: 0.7 },
      { t: 0.72, side: "left", length: 28, angle: -25, delayOffset: 0.95 },
    ],
    swayClass: "animate-sway-right",
  },
  {
    id: "white-peony-foreground-right",
    name: "White Rose Foreground Right",
    flowerSrc: FLOWER_ASSETS.roses.white,
    layer: "front",
    flowerSize: 126,
    startX: 268,
    startY: 570,
    cp1X: 288,
    cp1Y: 460,
    cp2X: 302,
    cp2Y: 380,
    endX: 308,
    endY: 330,
    stemWidth: 3.6,
    stemGradId: "stemMain",
    stemStartDelay: 6.9,
    stemDuration: 1.25,
    bloomDelay: 7.7,
    bloomDuration: 1.25,
    leaves: [
      { t: 0.52, side: "right", length: 30, angle: 30, delayOffset: 0.6 },
    ],
    swayClass: "animate-sway-right",
  },
  {
    id: "pink-tulip-foreground-left",
    name: "Red Rose Foreground Left",
    flowerSrc: FLOWER_ASSETS.roses.red,
    layer: "front",
    flowerSize: 122,
    startX: 252,
    startY: 570,
    cp1X: 232,
    cp1Y: 460,
    cp2X: 218,
    cp2Y: 380,
    endX: 212,
    endY: 326,
    stemWidth: 3.2,
    stemGradId: "stemMain",
    stemStartDelay: 7.1,
    stemDuration: 1.25,
    bloomDelay: 7.9,
    bloomDuration: 1.2,
    leaves: [
      { t: 0.52, side: "left", length: 30, angle: -30, delayOffset: 0.6 },
    ],
    swayClass: "animate-sway-left",
  },
  {
    id: "red-rose-mid-right-tier",
    name: "Red Rose Mid Right Tier",
    flowerSrc: FLOWER_ASSETS.roses.red,
    layer: "mid",
    flowerSize: 120,
    startX: 270,
    startY: 570,
    cp1X: 300,
    cp1Y: 430,
    cp2X: 320,
    cp2Y: 340,
    endX: 324,
    endY: 265,
    stemWidth: 3.2,
    stemGradId: "stemMain",
    stemStartDelay: 7.4,
    stemDuration: 1.2,
    bloomDelay: 8.2,
    bloomDuration: 1.15,
    leaves: [
      { t: 0.54, side: "right", length: 28, angle: 28, delayOffset: 0.6 },
    ],
    swayClass: "animate-sway-right",
  },
  {
    id: "pink-rose-mid-left-tier",
    name: "Pink English Rose Mid Left Tier",
    flowerSrc: FLOWER_ASSETS.roses.pink,
    layer: "mid",
    flowerSize: 120,
    startX: 250,
    startY: 570,
    cp1X: 220,
    cp1Y: 430,
    cp2X: 200,
    cp2Y: 340,
    endX: 196,
    endY: 260,
    stemWidth: 3.2,
    stemGradId: "stemMain",
    stemStartDelay: 7.6,
    stemDuration: 1.2,
    bloomDelay: 8.4,
    bloomDuration: 1.15,
    leaves: [
      { t: 0.54, side: "left", length: 28, angle: -28, delayOffset: 0.6 },
    ],
    swayClass: "animate-sway-left",
  },

  // =========================================================================
  // 4. PHASE 5: FILLING & DETAILED TEXTURES (t = 9.0s - 11.5s)
  // =========================================================================
  {
    id: "pink-tulip-mid-right",
    name: "Pink Rose Mid Right",
    flowerSrc: FLOWER_ASSETS.roses.pink,
    layer: "mid",
    flowerSize: 120,
    startX: 272,
    startY: 570,
    cp1X: 315,
    cp1Y: 430,
    cp2X: 345,
    cp2Y: 310,
    endX: 350,
    endY: 220,
    stemWidth: 3.0,
    stemGradId: "stemLight",
    stemStartDelay: 8.8,
    stemDuration: 1.15,
    bloomDelay: 9.3,
    bloomDuration: 1.05,
    leaves: [
      { t: 0.52, side: "right", length: 30, angle: 32, delayOffset: 0.55 },
    ],
    swayClass: "animate-sway-right",
  },
  {
    id: "pink-rose-mid-left-high",
    name: "Pink Rose Mid Left High",
    flowerSrc: FLOWER_ASSETS.roses.pink,
    layer: "mid",
    flowerSize: 118,
    startX: 248,
    startY: 570,
    cp1X: 205,
    cp1Y: 430,
    cp2X: 175,
    cp2Y: 310,
    endX: 170,
    endY: 218,
    stemWidth: 3.2,
    stemGradId: "stemMain",
    stemStartDelay: 9.0,
    stemDuration: 1.15,
    bloomDelay: 9.5,
    bloomDuration: 1.05,
    leaves: [
      { t: 0.52, side: "left", length: 30, angle: -32, delayOffset: 0.55 },
    ],
    swayClass: "animate-sway-left",
  },
  {
    id: "white-daisy-mid-left",
    name: "White Daisy Mid Left",
    flowerSrc: FLOWER_ASSETS.daisies.white,
    layer: "mid",
    flowerSize: 100,
    startX: 244,
    startY: 570,
    cp1X: 180,
    cp1Y: 450,
    cp2X: 135,
    cp2Y: 350,
    endX: 125,
    endY: 285,
    stemWidth: 2.6,
    stemGradId: "stemLight",
    stemStartDelay: 9.2,
    stemDuration: 1.1,
    bloomDelay: 9.7,
    bloomDuration: 1.0,
    leaves: [
      { t: 0.48, side: "left", length: 26, angle: -35, delayOffset: 0.5 },
    ],
    swayClass: "animate-sway-left",
  },
  {
    id: "white-daisy-mid-right",
    name: "White Daisy Mid Right",
    flowerSrc: FLOWER_ASSETS.daisies.white,
    layer: "mid",
    flowerSize: 100,
    startX: 276,
    startY: 570,
    cp1X: 340,
    cp1Y: 450,
    cp2X: 385,
    cp2Y: 350,
    endX: 395,
    endY: 285,
    stemWidth: 2.6,
    stemGradId: "stemLight",
    stemStartDelay: 9.4,
    stemDuration: 1.1,
    bloomDelay: 9.9,
    bloomDuration: 1.0,
    leaves: [
      { t: 0.48, side: "right", length: 26, angle: 35, delayOffset: 0.5 },
    ],
    swayClass: "animate-sway-right",
  },
  {
    id: "white-daisy-front-left",
    name: "White Daisy Front Left",
    flowerSrc: FLOWER_ASSETS.daisies.white,
    layer: "front",
    flowerSize: 94,
    startX: 246,
    startY: 570,
    cp1X: 205,
    cp1Y: 480,
    cp2X: 172,
    cp2Y: 420,
    endX: 162,
    endY: 380,
    stemWidth: 2.4,
    stemGradId: "stemLight",
    stemStartDelay: 9.6,
    stemDuration: 1.05,
    bloomDelay: 10.1,
    bloomDuration: 0.95,
    leaves: [
      { t: 0.45, side: "left", length: 24, angle: -32, delayOffset: 0.45 },
    ],
    swayClass: "animate-sway-left",
  },
  {
    id: "white-rose-front-right",
    name: "White Rose Front Right",
    flowerSrc: FLOWER_ASSETS.roses.white,
    layer: "front",
    flowerSize: 110,
    startX: 274,
    startY: 570,
    cp1X: 315,
    cp1Y: 480,
    cp2X: 348,
    cp2Y: 420,
    endX: 358,
    endY: 375,
    stemWidth: 2.8,
    stemGradId: "stemMain",
    stemStartDelay: 9.8,
    stemDuration: 1.05,
    bloomDelay: 10.3,
    bloomDuration: 0.95,
    leaves: [
      { t: 0.45, side: "right", length: 24, angle: 32, delayOffset: 0.45 },
    ],
    swayClass: "animate-sway-right",
  },
  {
    id: "daisy-mid-center-filler",
    name: "White Daisy Mid Center Filler",
    flowerSrc: FLOWER_ASSETS.daisies.white,
    layer: "mid",
    flowerSize: 88,
    startX: 260,
    startY: 570,
    cp1X: 260,
    cp1Y: 440,
    cp2X: 260,
    cp2Y: 330,
    endX: 260,
    endY: 245,
    stemWidth: 1.8,
    stemGradId: "stemLight",
    stemStartDelay: 10.0,
    stemDuration: 1.0,
    bloomDelay: 10.5,
    bloomDuration: 0.9,
    swayClass: "animate-sway-delicate",
  },
  {
    id: "daisy-front-tuck-center",
    name: "White Daisy Front Tuck Center",
    flowerSrc: FLOWER_ASSETS.daisies.white,
    layer: "front",
    flowerSize: 82,
    startX: 260,
    startY: 570,
    cp1X: 260,
    cp1Y: 490,
    cp2X: 260,
    cp2Y: 430,
    endX: 260,
    endY: 405,
    stemWidth: 1.8,
    stemGradId: "stemLight",
    stemStartDelay: 10.2,
    stemDuration: 0.95,
    bloomDelay: 10.7,
    bloomDuration: 0.85,
    swayClass: "animate-sway-delicate",
  },
  {
    id: "low-outer-left-daisy",
    name: "Low Outer Left Daisy",
    flowerSrc: FLOWER_ASSETS.daisies.white,
    layer: "mid",
    flowerSize: 88,
    startX: 240,
    startY: 570,
    cp1X: 160,
    cp1Y: 490,
    cp2X: 105,
    cp2Y: 410,
    endX: 85,
    endY: 345,
    stemWidth: 2.2,
    stemGradId: "stemLight",
    stemStartDelay: 10.4,
    stemDuration: 0.95,
    bloomDelay: 10.9,
    bloomDuration: 0.85,
    swayClass: "animate-sway-left",
  },
  {
    id: "low-outer-right-daisy",
    name: "Low Outer Right Daisy",
    flowerSrc: FLOWER_ASSETS.daisies.white,
    layer: "mid",
    flowerSize: 88,
    startX: 280,
    startY: 570,
    cp1X: 360,
    cp1Y: 490,
    cp2X: 415,
    cp2Y: 410,
    endX: 435,
    endY: 345,
    stemWidth: 2.2,
    stemGradId: "stemLight",
    stemStartDelay: 10.6,
    stemDuration: 0.95,
    bloomDelay: 11.1,
    bloomDuration: 0.85,
    swayClass: "animate-sway-right",
  },
];

// Helper to compute a point on a cubic Bezier curve B(t)
function getCubicBezierPoint(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  t: number
) {
  const invT = 1 - t;
  const invT2 = invT * invT;
  const invT3 = invT2 * invT;
  const t2 = t * t;
  const t3 = t2 * t;

  const x = invT3 * p0.x + 3 * invT2 * t * p1.x + 3 * invT * t2 * p2.x + t3 * p3.x;
  const y = invT3 * p0.y + 3 * invT2 * t * p1.y + 3 * invT * t2 * p2.y + t3 * p3.y;
  return { x, y };
}

const r = (n: number) => Number(n.toFixed(2));

// Helper to compute organic leaf path at tangent point on stem
function generateCubicLeafPath(plant: PlantData, leaf: PlantLeaf) {
  const p0 = { x: plant.startX, y: plant.startY };
  const p1 = { x: plant.cp1X, y: plant.cp1Y };
  const p2 = { x: plant.cp2X, y: plant.cp2Y };
  const p3 = { x: plant.endX, y: plant.endY };
  const origin = getCubicBezierPoint(p0, p1, p2, p3, leaf.t);

  // Compute tangent vector
  const invT = 1 - leaf.t;
  const dx =
    3 * invT * invT * (p1.x - p0.x) +
    6 * invT * leaf.t * (p2.x - p1.x) +
    3 * leaf.t * leaf.t * (p3.x - p2.x);
  const dy =
    3 * invT * invT * (p1.y - p0.y) +
    6 * invT * leaf.t * (p2.y - p1.y) +
    3 * leaf.t * leaf.t * (p3.y - p2.y);
  const stemAngle = Math.atan2(dy, dx);

  const angleRad = (leaf.angle * Math.PI) / 180;
  const leafDir = stemAngle + angleRad + (leaf.side === "left" ? -Math.PI / 2 : Math.PI / 2);

  const tipX = origin.x + Math.cos(leafDir) * leaf.length;
  const tipY = origin.y + Math.sin(leafDir) * leaf.length;

  const midX = (origin.x + tipX) / 2 + (leaf.side === "left" ? -7 : 7);
  const midY = (origin.y + tipY) / 2 - 4;

  const ox = r(origin.x);
  const oy = r(origin.y);
  const mx = r(midX);
  const my = r(midY);
  const tx = r(tipX);
  const ty = r(tipY);
  const qx = r(origin.x + (leaf.side === "left" ? 5 : -5));
  const qy = r(origin.y - 3);

  const d = `M ${ox} ${oy} Q ${mx} ${my} ${tx} ${ty} Q ${qx} ${qy} ${ox} ${oy}`;
  return { d, origin: `${ox}px ${oy}px` };
}

// Subtle Falling Rose Petals
const PETALS_CONFIG = [
  { left: "18%", driftX: "45px", rotDeg: "220deg", dur: "11s", delay: "0s", size: 14 },
  { left: "32%", driftX: "-35px", rotDeg: "-180deg", dur: "13s", delay: "2.5s", size: 16 },
  { left: "54%", driftX: "50px", rotDeg: "260deg", dur: "10.5s", delay: "1.2s", size: 13 },
  { left: "68%", driftX: "-40px", rotDeg: "-210deg", dur: "12s", delay: "3.8s", size: 15 },
  { left: "82%", driftX: "-55px", rotDeg: "190deg", dur: "14s", delay: "1.8s", size: 14 },
  { left: "42%", driftX: "30px", rotDeg: "160deg", dur: "12.5s", delay: "4.5s", size: 12 },
];

interface TapPetal {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  rotInit: number;
  rotFinal: number;
  scale: number;
}

export default function BotanicalMotionBouquet() {
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [started, setStarted] = useState(false);
  const [fullyBloomed, setFullyBloomed] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [tapPetals, setTapPetals] = useState<TapPetal[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Background delicate stardust simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const count = width < 600 ? 20 : 34;
    const particles: StarParticle[] = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.3 + 0.5,
        opacity: Math.random() * 0.45 + 0.15,
        speedY: -(Math.random() * 0.2 + 0.05),
        speedX: (Math.random() - 0.5) * 0.1,
        pulseSpeed: Math.random() * 0.02 + 0.008,
      });
    }

    let frame = 0;
    let animId: number;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        const currentOpacity =
          p.opacity * (0.65 + 0.35 * Math.sin(frame * p.pulseSpeed));

        ctx.save();
        ctx.fillStyle = `rgba(255, 238, 224, ${currentOpacity})`;
        ctx.shadowColor = "rgba(255, 210, 170, 0.5)";
        ctx.shadowBlur = p.size * 2.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Automatic gentle start at 0.8s or immediately upon user tap
  useEffect(() => {
    const timer = setTimeout(() => {
      setStarted(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Full bloom & settle milestone at 13.5s
  useEffect(() => {
    if (started) {
      const timer = setTimeout(() => {
        setFullyBloomed(true);
      }, 13500);
      return () => clearTimeout(timer);
    }
  }, [started]);

  const handleScreenTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!started) {
      setStarted(true);
    }

    const rect = e.currentTarget?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const tapId = Date.now() + Math.random();
    setRipples((prev) => [...prev, { id: tapId, x, y }]);

    // Spawn 3 subtle, delicate drifting micro-petals (NO full flowers)
    const newPetals: TapPetal[] = [
      {
        id: tapId + 0.1,
        x,
        y,
        targetX: (Math.random() - 0.5) * 32,
        targetY: -(Math.random() * 20 + 8),
        rotInit: (Math.random() - 0.5) * 30,
        rotFinal: (Math.random() - 0.5) * 60,
        scale: 0.75 + Math.random() * 0.25,
      },
      {
        id: tapId + 0.2,
        x,
        y,
        targetX: (Math.random() - 0.5) * 36,
        targetY: Math.random() * 24 + 10,
        rotInit: (Math.random() - 0.5) * 40,
        rotFinal: (Math.random() - 0.5) * 70,
        scale: 0.7 + Math.random() * 0.25,
      },
      {
        id: tapId + 0.3,
        x,
        y,
        targetX: (Math.random() - 0.5) * 28,
        targetY: Math.random() * 18 + 6,
        rotInit: (Math.random() - 0.5) * 25,
        rotFinal: (Math.random() - 0.5) * 45,
        scale: 0.65 + Math.random() * 0.2,
      },
    ];
    setTapPetals((prev) => [...prev, ...newPetals]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== tapId));
      setTapPetals((prev) => prev.filter((p) => Math.floor(p.id) !== Math.floor(tapId)));
    }, 1500);
  };

  const isAnimated = mounted && (started || Boolean(prefersReduced));

  return (
    <main
      onClick={handleScreenTap}
      suppressHydrationWarning
      className="relative h-[100svh] w-full bg-[#050505] text-[#ECE6E2] overflow-hidden flex flex-col justify-between items-center cursor-pointer select-none"
    >
      {/* Silent Asynchronous Background Visit Tracker */}
      <VisitTracker />

      {/* Background Star Particle Canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-0 h-full w-full opacity-75"
      />

      {/* PHASE 6: Warm Candlelight / Moonlight Radial Glow Behind Bouquet */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: isAnimated ? (fullyBloomed ? 0.72 : 0.4) : 0,
          scale: isAnimated ? 1 : 0.8,
        }}
        transition={{ duration: 3.2, delay: 5.0, ease: "easeOut" }}
        className="animate-candle-glow absolute bottom-4 left-1/2 -translate-x-1/2 h-[72vh] w-[96vw] max-w-[850px] rounded-full bg-radial from-rose-950/28 via-amber-950/14 to-transparent blur-3xl pointer-events-none z-0"
        aria-hidden="true"
      />

      {/* Floating Petal Drift (Emerges during Phase 5 & 6) */}
      <AnimatePresence>
        {isAnimated && (
          <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
            {PETALS_CONFIG.map((p, idx) => (
              <motion.div
                key={`petal-${idx}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2.0, delay: 9.5 + idx * 0.5 }}
                className="absolute top-0 animate-petal-drift"
                style={
                  {
                    left: p.left,
                    "--drift-x": p.driftX,
                    "--rot-deg": p.rotDeg,
                    "--drift-dur": p.dur,
                    "--drift-delay": p.delay,
                  } as React.CSSProperties
                }
              >
                <svg
                  width={p.size}
                  height={p.size * 1.3}
                  viewBox="0 0 20 26"
                  fill="none"
                  className="drop-shadow-[0_2px_8px_rgba(255,182,193,0.35)]"
                >
                  <path
                    d="M10 0 C16 6, 20 14, 18 20 C16 26, 4 26, 2 20 C0 14, 4 6, 10 0 Z"
                    fill="url(#petalGrad)"
                  />
                  <defs>
                    <linearGradient id="petalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFA6B8" stopOpacity="0.85" />
                      <stop offset="60%" stopColor="#E56B82" stopOpacity="0.75" />
                      <stop offset="100%" stopColor="#9E2A40" stopOpacity="0.65" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Touch Glow Ripples & Delicate Floating Micro-Petals */}
      <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
        {ripples.map((r) => (
          <motion.div
            key={r.id}
            initial={{ scale: 0.2, opacity: 0.6 }}
            animate={{ scale: 1.9, opacity: 0 }}
            transition={{ duration: 0.85, ease: "easeOut" }}
            style={{ left: r.x, top: r.y }}
            className="absolute -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-gradient-to-r from-rose-300/30 via-pink-200/25 to-amber-100/20 blur-sm pointer-events-none"
          />
        ))}

        {tapPetals.map((tp) => (
          <motion.div
            key={tp.id}
            initial={{
              x: tp.x,
              y: tp.y,
              scale: 0.3,
              opacity: 0.85,
              rotate: tp.rotInit,
            }}
            animate={{
              x: tp.x + tp.targetX,
              y: tp.y + tp.targetY,
              scale: tp.scale,
              opacity: 0,
              rotate: tp.rotFinal,
            }}
            transition={{
              duration: 1.35,
              ease: [0.25, 1, 0.5, 1],
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          >
            <svg
              width="12"
              height="16"
              viewBox="0 0 20 26"
              fill="none"
              className="drop-shadow-[0_1px_4px_rgba(255,182,193,0.3)]"
            >
              <path
                d="M10 0 C16 6, 20 14, 18 20 C16 26, 4 26, 2 20 C0 14, 4 6, 10 0 Z"
                fill="url(#tapPetalGrad)"
              />
              <defs>
                <linearGradient id="tapPetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFAEC0" stopOpacity="0.9" />
                  <stop offset="60%" stopColor="#E5728A" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#A83248" stopOpacity="0.7" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        ))}
      </div>

      {/* PHASE 1: Top Header Section */}
      <header className="relative z-30 pt-4 sm:pt-7 px-4 text-center flex flex-col items-center">

        {/* Main Name: "Lena Fathima K" */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="font-script-romantic text-4xl sm:text-5xl md:text-6xl text-[#FFF5F7] drop-shadow-[0_2px_24px_rgba(255,192,203,0.45)] tracking-wide"
        >
          Lena Fathima K
        </motion.h1>

        {/* Subtitle: "For you, Lena" with final calm highlight */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: fullyBloomed ? [1, 1.04, 1] : 1,
          }}
          transition={{
            opacity: { duration: 1.4, delay: 0.7, ease: [0.22, 1, 0.36, 1] },
            scale: { duration: 1.8, ease: "easeInOut" },
          }}
          className="font-serif-luxury text-base sm:text-xl md:text-2xl text-rose-200/90 italic tracking-wide mt-1.5 drop-shadow-[0_0_12px_rgba(244,114,182,0.3)] flex items-center justify-center gap-1.5"
        >
          <span>For you, Lena</span>
        </motion.p>
        {/* Top Note: "Just Because" */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center gap-2.5 mb-1 select-none"
        >
          <span className="h-px w-4 sm:w-7 bg-gradient-to-r from-transparent to-rose-300/40" />
          <span className="font-serif-luxury italic text-xs sm:text-sm tracking-[0.22em] text-rose-200/80 drop-shadow-[0_0_8px_rgba(244,114,182,0.35)]">
            Just Because.
          </span>
          <span className="h-px w-4 sm:w-7 bg-gradient-to-l from-transparent to-rose-300/40" />
        </motion.div>
        {/* Initial Tap Prompt (Fades out immediately when interaction begins) */}
        <AnimatePresence>
          {!started && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.85, 0.3] }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              transition={{ duration: 2.0, repeat: Infinity }}
              className="text-xs text-rose-200/60 font-light tracking-widest uppercase mt-2 font-sans"
            >
              tap to bloom
            </motion.p>
          )}
        </AnimatePresence>
      </header>

      {/* HERO BOUQUET STAGE: Wide, Expansive Hand-Tied Florist Arrangement */}
      <div className="relative z-10 w-[94vw] sm:w-[86vw] md:w-[78vw] max-w-[760px] h-[70vh] sm:h-[74vh] md:h-[78vh] flex items-end justify-center pointer-events-none pb-0">
        <svg
          viewBox="0 0 520 620"
          className="w-full h-full overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Multiple Natural Stem Gradients */}
            <linearGradient id="stemMain" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#0B170D" />
              <stop offset="35%" stopColor="#1C4222" />
              <stop offset="75%" stopColor="#3B6844" />
              <stop offset="100%" stopColor="#5A8863" />
            </linearGradient>

            <linearGradient id="stemDark" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#081409" />
              <stop offset="45%" stopColor="#15331B" />
              <stop offset="100%" stopColor="#2E5335" />
            </linearGradient>

            <linearGradient id="stemLight" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#102614" />
              <stop offset="45%" stopColor="#285430" />
              <stop offset="100%" stopColor="#66946E" />
            </linearGradient>

            {/* Natural Leaf Gradient */}
            <linearGradient id="leafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#122617" />
              <stop offset="50%" stopColor="#2B5031" />
              <stop offset="100%" stopColor="#56805F" />
            </linearGradient>
          </defs>

          {/* Render all 34 botanical plant units */}
          {PLANTS_DATA.map((plant) => {
            const stemD = `M ${plant.startX} ${plant.startY} C ${plant.cp1X} ${plant.cp1Y}, ${plant.cp2X} ${plant.cp2Y}, ${plant.endX} ${plant.endY}`;

            return (
              <g
                key={"plant-" + plant.id}
                className={fullyBloomed ? plant.swayClass : undefined}
                style={{
                  transformOrigin: `260px 520px`,
                }}
              >
                {/* STEM: Physically grows upward from gathered base along organic cubic curve */}
                <motion.path
                  d={stemD}
                  fill="none"
                  stroke={`url(#${plant.stemGradId})`}
                  strokeWidth={plant.stemWidth}
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: isAnimated ? 1 : 0 }}
                  transition={{
                    duration: plant.stemDuration,
                    delay: plant.stemStartDelay,
                    ease: [0.25, 1, 0.35, 1],
                  }}
                />

                {/* LEAVES: Unfold smoothly along stem nodes as stem passes midpoint */}
                {plant.leaves?.map((leaf, lIdx) => {
                  const leafData = generateCubicLeafPath(plant, leaf);

                  return (
                    <motion.path
                      key={`leaf-${plant.id}-${lIdx}`}
                      d={leafData.d}
                      fill="url(#leafGrad)"
                      opacity="0.94"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: isAnimated ? 1 : 0,
                        opacity: isAnimated ? 0.94 : 0,
                      }}
                      transition={{
                        duration: 1.1,
                        delay: plant.stemStartDelay + leaf.delayOffset,
                        ease: [0.34, 1.35, 0.64, 1],
                      }}
                      style={{ transformOrigin: leafData.origin }}
                    />
                  );
                })}

                {/* FLOWER HEAD: Attached directly to the EXACT stem endpoint (endX, endY) */}
                <motion.g
                  initial={{
                    scale: 0.75,
                    opacity: 0,
                    y: 14,
                  }}
                  animate={{
                    scale: isAnimated ? [0.75, 1.05, 1] : 0.75,
                    opacity: isAnimated ? 1 : 0,
                    y: isAnimated ? 0 : 14,
                  }}
                  transition={{
                    duration: plant.bloomDuration,
                    delay: plant.bloomDelay,
                    ease: [0.22, 1.25, 0.36, 1],
                  }}
                  style={{
                    transformOrigin: `${plant.endX}px ${plant.endY}px`,
                  }}
                >
                  <image
                    href={plant.flowerSrc}
                    x={plant.endX - plant.flowerSize / 2}
                    y={plant.endY - plant.flowerSize / 2 + (plant.flowerOffsetY ?? 0)}
                    width={plant.flowerSize}
                    height={plant.flowerSize}
                    preserveAspectRatio="xMidYMid meet"
                  />
                </motion.g>
              </g>
            );
          })}

          {/* ELEGANT BOUQUET WRAP & SILK RIBBON (Wraps around gathered stems at Y=495) */}
          <motion.g
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: isAnimated ? 1 : 0,
              scale: isAnimated ? 1 : 0.8,
            }}
            transition={{
              duration: 1.5,
              delay: 4.8,
              ease: "easeOut",
            }}
            style={{ transformOrigin: "260px 500px" }}
          >
            {/* Ribbon Tie Base Wrap */}
            <path
              d="M 230 492 Q 260 488 290 492 L 292 512 Q 260 516 228 512 Z"
              fill="url(#ribbonGrad)"
              filter="drop-shadow(0 4px 6px rgba(0,0,0,0.6))"
            />
            {/* Center Tie Knot */}
            <ellipse
              cx="260"
              cy="502"
              rx="12"
              ry="9"
              fill="url(#ribbonGrad)"
              stroke="#DDB892"
              strokeWidth="0.8"
            />
            {/* Drooping Silk Ribbon Tails */}
            <path
              d="M 256 508 C 250 535, 240 555, 244 578"
              fill="none"
              stroke="url(#ribbonTailGrad)"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <path
              d="M 264 508 C 270 535, 278 558, 274 582"
              fill="none"
              stroke="url(#ribbonTailGrad)"
              strokeWidth="4.2"
              strokeLinecap="round"
            />
          </motion.g>
        </svg>

        {/* Additive Isolated Real Butterfly Experience (Native GPU Overlay) */}
        <RealButterfly fullyBloomed={fullyBloomed} />
      </div>

      {/* Bottom Minimal Frame Space & Playful Best-Friend Gift */}
      <footer className="relative z-30 pb-6 text-center">
        <GiftInteraction visible={fullyBloomed} />
      </footer>
    </main>
  );
}
