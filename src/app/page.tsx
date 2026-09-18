"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  t: number; // 0 to 1 along stem
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
  // Cubic Bezier Stem Geometry (viewBox: 0 0 400 580)
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
  // Sequence timing
  startDelay: number;
  stemDuration: number;
  bloomDelay: number;
  bloomDuration: number;
  // Foliage
  leaves?: PlantLeaf[];
  // Independent natural sway class
  swayClass: string;
}

// 36 Meticulously Orchestrated Botanical Plants forming a massive, wide, lush, hand-tied florist bouquet
const PLANTS_DATA: PlantData[] = [
  // =========================================================================
  // 1. FAR-LEFT & FAR-RIGHT OUTER ARCHITECTURE (Grows t = 0.3s - 2.5s)
  // =========================================================================
  {
    id: "eucalyptus-far-left-1",
    name: "Eucalyptus Far Left Low",
    flowerSrc: "/flowers/eucalyptus.png",
    layer: "back",
    flowerSize: 130,
    startX: 172,
    startY: 565,
    cp1X: 110,
    cp1Y: 460,
    cp2X: 55,
    cp2Y: 340,
    endX: 30,
    endY: 260,
    stemWidth: 2.8,
    stemGradId: "stemDark",
    startDelay: 0.3,
    stemDuration: 2.2,
    bloomDelay: 1.8,
    bloomDuration: 1.6,
    leaves: [
      { t: 0.45, side: "left", length: 30, angle: -40, delayOffset: 0.9 },
      { t: 0.70, side: "right", length: 26, angle: 30, delayOffset: 1.3 },
    ],
    swayClass: "animate-sway-2",
  },
  {
    id: "eucalyptus-far-right-1",
    name: "Eucalyptus Far Right Low",
    flowerSrc: "/flowers/eucalyptus.png",
    layer: "back",
    flowerSize: 130,
    startX: 228,
    startY: 565,
    cp1X: 290,
    cp1Y: 460,
    cp2X: 345,
    cp2Y: 340,
    endX: 370,
    endY: 260,
    stemWidth: 2.8,
    stemGradId: "stemDark",
    startDelay: 0.6,
    stemDuration: 2.2,
    bloomDelay: 2.1,
    bloomDuration: 1.6,
    leaves: [
      { t: 0.45, side: "right", length: 30, angle: 40, delayOffset: 0.9 },
      { t: 0.70, side: "left", length: 26, angle: -30, delayOffset: 1.3 },
    ],
    swayClass: "animate-sway-3",
  },
  {
    id: "babys-breath-outer-left-high",
    name: "Baby's Breath Outer Left High",
    flowerSrc: "/flowers/babys_breath.png",
    layer: "back",
    flowerSize: 115,
    startX: 178,
    startY: 565,
    cp1X: 120,
    cp1Y: 420,
    cp2X: 70,
    cp2Y: 280,
    endX: 48,
    endY: 175,
    stemWidth: 2.0,
    stemGradId: "stemLight",
    startDelay: 0.9,
    stemDuration: 2.1,
    bloomDelay: 2.4,
    bloomDuration: 1.5,
    swayClass: "animate-sway-1",
  },
  {
    id: "babys-breath-outer-right-high",
    name: "Baby's Breath Outer Right High",
    flowerSrc: "/flowers/babys_breath.png",
    layer: "back",
    flowerSize: 115,
    startX: 222,
    startY: 565,
    cp1X: 280,
    cp1Y: 420,
    cp2X: 330,
    cp2Y: 280,
    endX: 352,
    endY: 175,
    stemWidth: 2.0,
    stemGradId: "stemLight",
    startDelay: 1.2,
    stemDuration: 2.1,
    bloomDelay: 2.7,
    bloomDuration: 1.5,
    swayClass: "animate-sway-2",
  },
  {
    id: "lavender-far-left",
    name: "Lavender Far Left",
    flowerSrc: "/flowers/lavender.png",
    layer: "back",
    flowerSize: 105,
    startX: 174,
    startY: 565,
    cp1X: 130,
    cp1Y: 450,
    cp2X: 85,
    cp2Y: 320,
    endX: 72,
    endY: 225,
    stemWidth: 2.2,
    stemGradId: "stemMid",
    startDelay: 1.5,
    stemDuration: 2.0,
    bloomDelay: 2.9,
    bloomDuration: 1.4,
    swayClass: "animate-sway-3",
  },
  {
    id: "lavender-far-right",
    name: "Lavender Far Right",
    flowerSrc: "/flowers/lavender.png",
    layer: "back",
    flowerSize: 105,
    startX: 226,
    startY: 565,
    cp1X: 270,
    cp1Y: 450,
    cp2X: 315,
    cp2Y: 320,
    endX: 328,
    endY: 225,
    stemWidth: 2.2,
    stemGradId: "stemMid",
    startDelay: 1.8,
    stemDuration: 2.0,
    bloomDelay: 3.2,
    bloomDuration: 1.4,
    swayClass: "animate-sway-1",
  },

  // =========================================================================
  // 2. TALL BACKGROUND STATEMENT ARCHITECTURE (Grows t = 2.1s - 4.5s)
  // =========================================================================
  {
    id: "cherry-blossom-top-center",
    name: "Cherry Blossom Branch Top Center",
    flowerSrc: "/flowers/cherry_blossom.png",
    layer: "back",
    flowerSize: 145,
    startX: 202,
    startY: 565,
    cp1X: 206,
    cp1Y: 380,
    cp2X: 212,
    cp2Y: 220,
    endX: 205,
    endY: 82,
    stemWidth: 2.4,
    stemGradId: "stemDark",
    startDelay: 2.1,
    stemDuration: 2.3,
    bloomDelay: 3.7,
    bloomDuration: 1.8,
    swayClass: "animate-sway-1",
  },
  {
    id: "cherry-blossom-top-left",
    name: "Cherry Blossom Branch Left High",
    flowerSrc: "/flowers/cherry_blossom.png",
    layer: "back",
    flowerSize: 125,
    startX: 190,
    startY: 565,
    cp1X: 160,
    cp1Y: 380,
    cp2X: 135,
    cp2Y: 230,
    endX: 120,
    endY: 115,
    stemWidth: 2.2,
    stemGradId: "stemDark",
    startDelay: 2.4,
    stemDuration: 2.2,
    bloomDelay: 4.0,
    bloomDuration: 1.6,
    swayClass: "animate-sway-2",
  },
  {
    id: "cherry-blossom-top-right",
    name: "Cherry Blossom Branch Right High",
    flowerSrc: "/flowers/cherry_blossom.png",
    layer: "back",
    flowerSize: 125,
    startX: 210,
    startY: 565,
    cp1X: 240,
    cp1Y: 380,
    cp2X: 265,
    cp2Y: 230,
    endX: 280,
    endY: 115,
    stemWidth: 2.2,
    stemGradId: "stemDark",
    startDelay: 2.7,
    stemDuration: 2.2,
    bloomDelay: 4.3,
    bloomDuration: 1.6,
    swayClass: "animate-sway-3",
  },
  {
    id: "babys-breath-inner-left",
    name: "Baby's Breath Inner Left High",
    flowerSrc: "/flowers/babys_breath.png",
    layer: "back",
    flowerSize: 105,
    startX: 185,
    startY: 565,
    cp1X: 155,
    cp1Y: 390,
    cp2X: 150,
    cp2Y: 250,
    endX: 155,
    endY: 145,
    stemWidth: 1.8,
    stemGradId: "stemLight",
    startDelay: 3.0,
    stemDuration: 1.9,
    bloomDelay: 4.5,
    bloomDuration: 1.4,
    swayClass: "animate-sway-1",
  },
  {
    id: "babys-breath-inner-right",
    name: "Baby's Breath Inner Right High",
    flowerSrc: "/flowers/babys_breath.png",
    layer: "back",
    flowerSize: 105,
    startX: 215,
    startY: 565,
    cp1X: 245,
    cp1Y: 390,
    cp2X: 250,
    cp2Y: 250,
    endX: 245,
    endY: 145,
    stemWidth: 1.8,
    stemGradId: "stemLight",
    startDelay: 3.3,
    stemDuration: 1.9,
    bloomDelay: 4.8,
    bloomDuration: 1.4,
    swayClass: "animate-sway-2",
  },

  // =========================================================================
  // 3. TALL & UPPER MIDGROUND ROSES, TULIPS & PEONIES (Grows t = 3.6s - 6.0s)
  // =========================================================================
  {
    id: "pink-tulip-tall-left",
    name: "Pink Tulip Tall Left",
    flowerSrc: "/flowers/pink_tulip.png",
    layer: "mid",
    flowerSize: 108,
    startX: 184,
    startY: 565,
    cp1X: 145,
    cp1Y: 410,
    cp2X: 108,
    cp2Y: 280,
    endX: 98,
    endY: 168,
    stemWidth: 3.4,
    stemGradId: "stemMain",
    startDelay: 3.6,
    stemDuration: 2.0,
    bloomDelay: 5.1,
    bloomDuration: 1.6,
    leaves: [
      { t: 0.50, side: "left", length: 34, angle: -35, delayOffset: 1.0 },
      { t: 0.72, side: "right", length: 28, angle: 25, delayOffset: 1.3 },
    ],
    swayClass: "animate-sway-3",
  },
  {
    id: "white-rose-tall-right",
    name: "White Rose Tall Right",
    flowerSrc: "/flowers/white_rose.png",
    layer: "mid",
    flowerSize: 118,
    startX: 216,
    startY: 565,
    cp1X: 255,
    cp1Y: 410,
    cp2X: 292,
    cp2Y: 280,
    endX: 302,
    endY: 168,
    stemWidth: 3.4,
    stemGradId: "stemMain",
    startDelay: 3.9,
    stemDuration: 2.0,
    bloomDelay: 5.4,
    bloomDuration: 1.6,
    leaves: [
      { t: 0.50, side: "right", length: 34, angle: 35, delayOffset: 1.0 },
      { t: 0.72, side: "left", length: 28, angle: -25, delayOffset: 1.3 },
    ],
    swayClass: "animate-sway-1",
  },
  {
    id: "white-peony-tall-center",
    name: "White Peony Tall Center",
    flowerSrc: "/flowers/white_peony.png",
    layer: "mid",
    flowerSize: 130,
    startX: 206,
    startY: 565,
    cp1X: 218,
    cp1Y: 400,
    cp2X: 226,
    cp2Y: 280,
    endX: 224,
    endY: 178,
    stemWidth: 3.6,
    stemGradId: "stemMain",
    startDelay: 4.2,
    stemDuration: 2.0,
    bloomDelay: 5.7,
    bloomDuration: 1.6,
    leaves: [
      { t: 0.58, side: "right", length: 36, angle: 30, delayOffset: 1.1 },
    ],
    swayClass: "animate-sway-2",
  },
  {
    id: "red-rose-tall-left",
    name: "Velvety Red Rose Tall Left",
    flowerSrc: "/flowers/red_rose.png",
    layer: "mid",
    flowerSize: 120,
    startX: 194,
    startY: 565,
    cp1X: 182,
    cp1Y: 400,
    cp2X: 174,
    cp2Y: 280,
    endX: 176,
    endY: 182,
    stemWidth: 3.6,
    stemGradId: "stemMain",
    startDelay: 4.5,
    stemDuration: 2.0,
    bloomDelay: 6.0,
    bloomDuration: 1.6,
    leaves: [
      { t: 0.58, side: "left", length: 36, angle: -30, delayOffset: 1.1 },
    ],
    swayClass: "animate-sway-1",
  },
  {
    id: "pink-tulip-mid-right",
    name: "Pink Tulip Mid Right",
    flowerSrc: "/flowers/pink_tulip.png",
    layer: "mid",
    flowerSize: 104,
    startX: 212,
    startY: 565,
    cp1X: 242,
    cp1Y: 420,
    cp2X: 260,
    cp2Y: 300,
    endX: 262,
    endY: 210,
    stemWidth: 3.0,
    stemGradId: "stemLight",
    startDelay: 4.8,
    stemDuration: 1.8,
    bloomDelay: 6.2,
    bloomDuration: 1.5,
    leaves: [
      { t: 0.52, side: "right", length: 30, angle: 32, delayOffset: 0.9 },
    ],
    swayClass: "animate-sway-3",
  },
  {
    id: "pink-rose-mid-left-high",
    name: "Pink Rose Mid Left High",
    flowerSrc: "/flowers/pink_rose.png",
    layer: "mid",
    flowerSize: 115,
    startX: 186,
    startY: 565,
    cp1X: 156,
    cp1Y: 420,
    cp2X: 138,
    cp2Y: 300,
    endX: 136,
    endY: 212,
    stemWidth: 3.2,
    stemGradId: "stemMain",
    startDelay: 5.1,
    stemDuration: 1.8,
    bloomDelay: 6.5,
    bloomDuration: 1.5,
    leaves: [
      { t: 0.52, side: "left", length: 30, angle: -32, delayOffset: 0.9 },
    ],
    swayClass: "animate-sway-2",
  },

  // =========================================================================
  // 4. MID-FOREGROUND VIBRANT DAISIES, FILLERS & ROSES (Grows t = 5.4s - 7.5s)
  // =========================================================================
  {
    id: "white-daisy-mid-left",
    name: "White Daisy Mid Left",
    flowerSrc: "/flowers/white_daisy.png",
    layer: "mid",
    flowerSize: 96,
    startX: 178,
    startY: 565,
    cp1X: 132,
    cp1Y: 440,
    cp2X: 102,
    cp2Y: 330,
    endX: 96,
    endY: 252,
    stemWidth: 2.6,
    stemGradId: "stemLight",
    startDelay: 5.4,
    stemDuration: 1.7,
    bloomDelay: 6.7,
    bloomDuration: 1.4,
    leaves: [
      { t: 0.48, side: "left", length: 26, angle: -35, delayOffset: 0.8 },
    ],
    swayClass: "animate-sway-1",
  },
  {
    id: "white-daisy-mid-right",
    name: "White Daisy Mid Right",
    flowerSrc: "/flowers/white_daisy.png",
    layer: "mid",
    flowerSize: 96,
    startX: 222,
    startY: 565,
    cp1X: 268,
    cp1Y: 440,
    cp2X: 298,
    cp2Y: 330,
    endX: 304,
    endY: 252,
    stemWidth: 2.6,
    stemGradId: "stemLight",
    startDelay: 5.7,
    stemDuration: 1.7,
    bloomDelay: 7.0,
    bloomDuration: 1.4,
    leaves: [
      { t: 0.48, side: "right", length: 26, angle: 35, delayOffset: 0.8 },
    ],
    swayClass: "animate-sway-2",
  },
  {
    id: "pink-rose-mid-left-tier",
    name: "Pink English Rose Mid Left Tier",
    flowerSrc: "/flowers/pink_rose.png",
    layer: "mid",
    flowerSize: 116,
    startX: 188,
    startY: 565,
    cp1X: 168,
    cp1Y: 440,
    cp2X: 154,
    cp2Y: 340,
    endX: 152,
    endY: 262,
    stemWidth: 3.2,
    stemGradId: "stemMain",
    startDelay: 6.0,
    stemDuration: 1.7,
    bloomDelay: 7.3,
    bloomDuration: 1.5,
    leaves: [
      { t: 0.54, side: "left", length: 28, angle: -28, delayOffset: 0.8 },
    ],
    swayClass: "animate-sway-3",
  },
  {
    id: "red-rose-mid-right-tier",
    name: "Red Rose Mid Right Tier",
    flowerSrc: "/flowers/red_rose.png",
    layer: "mid",
    flowerSize: 116,
    startX: 212,
    startY: 565,
    cp1X: 232,
    cp1Y: 440,
    cp2X: 246,
    cp2Y: 340,
    endX: 248,
    endY: 264,
    stemWidth: 3.2,
    stemGradId: "stemMain",
    startDelay: 6.3,
    stemDuration: 1.7,
    bloomDelay: 7.6,
    bloomDuration: 1.5,
    leaves: [
      { t: 0.54, side: "right", length: 28, angle: 28, delayOffset: 0.8 },
    ],
    swayClass: "animate-sway-1",
  },
  {
    id: "babys-breath-mid-center-filler",
    name: "Baby's Breath Mid Center Filler",
    flowerSrc: "/flowers/babys_breath.png",
    layer: "mid",
    flowerSize: 110,
    startX: 200,
    startY: 565,
    cp1X: 200,
    cp1Y: 430,
    cp2X: 200,
    cp2Y: 330,
    endX: 200,
    endY: 246,
    stemWidth: 1.8,
    stemGradId: "stemLight",
    startDelay: 6.6,
    stemDuration: 1.6,
    bloomDelay: 7.8,
    bloomDuration: 1.3,
    swayClass: "animate-sway-2",
  },

  // =========================================================================
  // 5. FOREGROUND LUSH FOCAL BLOOMS & PEONIES (Grows t = 6.9s - 8.8s)
  // =========================================================================
  {
    id: "pink-tulip-foreground-left",
    name: "Pink Tulip Foreground Left",
    flowerSrc: "/flowers/pink_tulip.png",
    layer: "front",
    flowerSize: 106,
    startX: 190,
    startY: 565,
    cp1X: 174,
    cp1Y: 460,
    cp2X: 164,
    cp2Y: 380,
    endX: 160,
    endY: 318,
    stemWidth: 3.2,
    stemGradId: "stemMain",
    startDelay: 6.9,
    stemDuration: 1.5,
    bloomDelay: 8.0,
    bloomDuration: 1.4,
    leaves: [
      { t: 0.52, side: "left", length: 30, angle: -30, delayOffset: 0.7 },
    ],
    swayClass: "animate-sway-2",
  },
  {
    id: "white-peony-foreground-right",
    name: "White Peony Foreground Right",
    flowerSrc: "/flowers/white_peony.png",
    layer: "front",
    flowerSize: 124,
    startX: 210,
    startY: 565,
    cp1X: 226,
    cp1Y: 460,
    cp2X: 236,
    cp2Y: 380,
    endX: 240,
    endY: 320,
    stemWidth: 3.5,
    stemGradId: "stemMain",
    startDelay: 7.2,
    stemDuration: 1.5,
    bloomDelay: 8.3,
    bloomDuration: 1.4,
    leaves: [
      { t: 0.52, side: "right", length: 30, angle: 30, delayOffset: 0.7 },
    ],
    swayClass: "animate-sway-3",
  },
  {
    id: "pink-rose-focal-center",
    name: "Blush English Rose Centerpiece",
    flowerSrc: "/flowers/pink_rose.png",
    layer: "front",
    flowerSize: 130,
    startX: 200,
    startY: 565,
    cp1X: 200,
    cp1Y: 470,
    cp2X: 200,
    cp2Y: 390,
    endX: 200,
    endY: 332,
    stemWidth: 3.8,
    stemGradId: "stemMain",
    startDelay: 7.5,
    stemDuration: 1.5,
    bloomDelay: 8.6,
    bloomDuration: 1.5,
    leaves: [
      { t: 0.48, side: "left", length: 28, angle: -24, delayOffset: 0.7 },
      { t: 0.48, side: "right", length: 28, angle: 24, delayOffset: 0.7 },
    ],
    swayClass: "animate-sway-1",
  },
  {
    id: "white-daisy-front-left",
    name: "White Daisy Front Left",
    flowerSrc: "/flowers/white_daisy.png",
    layer: "front",
    flowerSize: 90,
    startX: 184,
    startY: 565,
    cp1X: 162,
    cp1Y: 480,
    cp2X: 148,
    cp2Y: 420,
    endX: 144,
    endY: 374,
    stemWidth: 2.4,
    stemGradId: "stemLight",
    startDelay: 7.8,
    stemDuration: 1.4,
    bloomDelay: 8.9,
    bloomDuration: 1.3,
    swayClass: "animate-sway-2",
  },
  {
    id: "white-rose-front-right",
    name: "White Rose Front Right",
    flowerSrc: "/flowers/white_rose.png",
    layer: "front",
    flowerSize: 105,
    startX: 216,
    startY: 565,
    cp1X: 238,
    cp1Y: 480,
    cp2X: 252,
    cp2Y: 420,
    endX: 256,
    endY: 374,
    stemWidth: 2.8,
    stemGradId: "stemMain",
    startDelay: 8.1,
    stemDuration: 1.4,
    bloomDelay: 9.2,
    bloomDuration: 1.3,
    swayClass: "animate-sway-3",
  },
  {
    id: "babys-breath-front-tuck-center",
    name: "Baby's Breath Front Tuck Center",
    flowerSrc: "/flowers/babys_breath.png",
    layer: "front",
    flowerSize: 100,
    startX: 200,
    startY: 565,
    cp1X: 200,
    cp1Y: 490,
    cp2X: 200,
    cp2Y: 430,
    endX: 200,
    endY: 402,
    stemWidth: 1.8,
    stemGradId: "stemLight",
    startDelay: 8.4,
    stemDuration: 1.3,
    bloomDelay: 9.4,
    bloomDuration: 1.2,
    swayClass: "animate-sway-1",
  },
];

// Helper to compute a point on a cubic bezier curve B(t)
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

  const midX = (origin.x + tipX) / 2 + (leaf.side === "left" ? -6 : 6);
  const midY = (origin.y + tipY) / 2 - 4;

  const d = `M ${origin.x} ${origin.y} Q ${midX} ${midY} ${tipX} ${tipY} Q ${origin.x + (leaf.side === "left" ? 4 : -4)} ${origin.y - 2} ${origin.x} ${origin.y}`;
  return { d, origin: `${origin.x}px ${origin.y}px` };
}

export default function MassiveBotanicalBouquet() {
  const [started, setStarted] = useState(false);
  const [bloomComplete, setBloomComplete] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Background subtle stardust simulation
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

    const count = width < 600 ? 25 : 45;
    const particles: StarParticle[] = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.6,
        opacity: Math.random() * 0.6 + 0.2,
        speedY: -(Math.random() * 0.26 + 0.08),
        speedX: (Math.random() - 0.5) * 0.15,
        pulseSpeed: Math.random() * 0.03 + 0.01,
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
          p.opacity * (0.6 + 0.4 * Math.sin(frame * p.pulseSpeed));

        ctx.save();
        ctx.fillStyle = `rgba(255, 238, 220, ${currentOpacity})`;
        ctx.shadowColor = "rgba(255, 205, 160, 0.75)";
        ctx.shadowBlur = p.size * 3;
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

  // Auto-start after 1.2s or on user tap
  useEffect(() => {
    const timer = setTimeout(() => {
      setStarted(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Completion marker at 10.5s
  useEffect(() => {
    if (started) {
      const timer = setTimeout(() => {
        setBloomComplete(true);
      }, 10500);
      return () => clearTimeout(timer);
    }
  }, [started]);

  const handleScreenTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!started) {
      setStarted(true);
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setRipples((prev) => [...prev, { id: Date.now() + Math.random(), x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.slice(1));
    }, 1200);
  };

  return (
    <main
      onClick={handleScreenTap}
      className="relative h-[100svh] w-full bg-[#050505] text-[#ECE6E2] overflow-hidden flex flex-col justify-between items-center cursor-pointer select-none"
    >
      {/* Background Star Particle Canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-0 h-full w-full"
      />

      {/* Subtle Cinematic Soft Ambient Lighting behind the Bouquet */}
      <div
        className="absolute bottom-2 left-1/2 -translate-x-1/2 h-[70vh] w-[98vw] max-w-[850px] rounded-full bg-radial from-rose-950/22 via-amber-950/12 to-transparent blur-3xl pointer-events-none z-0"
        aria-hidden="true"
      />

      {/* Touch Glow Ripples */}
      <div className="absolute inset-0 pointer-events-none z-40">
        {ripples.map((r) => (
          <motion.div
            key={r.id}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ left: r.x, top: r.y }}
            className="absolute -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-full bg-gradient-to-r from-rose-300/40 to-amber-200/40 blur-md"
          />
        ))}
      </div>

      {/* Top Header Section: Lena Fathima K & "For you, Lena ❤️" */}
      <header className="relative z-30 pt-6 sm:pt-10 px-4 text-center flex flex-col items-center">
        {/* Name: Lena Fathima K */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.8, delay: 0.2, ease: "easeOut" }}
          className="font-script-romantic text-4xl sm:text-5xl md:text-6xl text-[#FFF5F7] drop-shadow-[0_2px_22px_rgba(255,182,193,0.45)] tracking-wide"
        >
          Lena Fathima K
        </motion.h1>

        {/* Subtitle: "For you, Lena ❤️" */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.6, delay: 0.7, ease: "easeOut" }}
          className="font-serif-luxury text-base sm:text-xl md:text-2xl text-rose-200/90 italic tracking-wide mt-1 drop-shadow-[0_0_12px_rgba(244,114,182,0.3)]"
        >
          For you, Lena ❤️
        </motion.p>

        {/* Initial Tap Prompt (Disappears immediately when interaction begins) */}
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

      {/* MASSIVE HERO BOUQUET STAGE: Occupies 88-94% width on mobile, 75-80% on desktop */}
      <div className="relative z-10 w-[92vw] sm:w-[84vw] md:w-[76vw] max-w-[750px] h-[72vh] sm:h-[76vh] flex items-end justify-center pointer-events-none pb-0">
        <svg
          viewBox="0 0 400 580"
          className="w-full h-full overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Multiple Natural Stem Gradients */}
            <linearGradient id="stemMain" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#0E1F11" />
              <stop offset="40%" stopColor="#1E4525" />
              <stop offset="80%" stopColor="#3E6B48" />
              <stop offset="100%" stopColor="#5D8B66" />
            </linearGradient>

            <linearGradient id="stemDark" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#0A170C" />
              <stop offset="50%" stopColor="#17361D" />
              <stop offset="100%" stopColor="#325939" />
            </linearGradient>

            <linearGradient id="stemLight" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#132B17" />
              <stop offset="50%" stopColor="#2D5C35" />
              <stop offset="100%" stopColor="#6C9A74" />
            </linearGradient>

            {/* Leaf gradient */}
            <linearGradient id="leafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#142B1A" />
              <stop offset="50%" stopColor="#2E5535" />
              <stop offset="100%" stopColor="#5B8764" />
            </linearGradient>
          </defs>

          {/* Render all 27+ botanical plant units */}
          {PLANTS_DATA.map((plant) => {
            const stemD = `M ${plant.startX} ${plant.startY} C ${plant.cp1X} ${plant.cp1Y}, ${plant.cp2X} ${plant.cp2Y}, ${plant.endX} ${plant.endY}`;

            return (
              <g
                key={"plant-" + plant.id}
                className={plant.swayClass}
                style={{
                  transformOrigin: `${plant.startX}px ${plant.startY}px`,
                }}
              >
                {/* 1. Stem growing upward from base */}
                <motion.path
                  d={stemD}
                  fill="none"
                  stroke={`url(#${plant.stemGradId})`}
                  strokeWidth={plant.stemWidth}
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: started ? 1 : 0 }}
                  transition={{
                    duration: plant.stemDuration,
                    delay: plant.startDelay,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />

                {/* 2. Leaves unfolding along stem */}
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
                        scale: started ? 1 : 0,
                        opacity: started ? 0.94 : 0,
                      }}
                      transition={{
                        duration: 1.2,
                        delay: plant.startDelay + leaf.delayOffset,
                        ease: "easeOut",
                      }}
                      style={{ transformOrigin: leafData.origin }}
                    />
                  );
                })}

                {/* 3. Flower Head blooming at the EXACT stem endpoint (endX, endY) */}
                <motion.g
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: started ? [0, 1.12, 1] : 0,
                    opacity: started ? 1 : 0,
                  }}
                  transition={{
                    duration: plant.bloomDuration,
                    delay: plant.bloomDelay,
                    ease: [0.34, 1.56, 0.64, 1],
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
        </svg>
      </div>

      {/* Bottom Minimal Space */}
      <footer className="relative z-30 pb-2 text-center" />
    </main>
  );
}
