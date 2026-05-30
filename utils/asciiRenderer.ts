// // // ──────────────────────────────────────────────────────────────
// // //  asciiRenderer.ts  (rewrite)
// // //  Two-pass ASCII conversion:
// // //    Pass 1 – luminance → base character
// // //    Pass 2 – Sobel edge detection → overlay edge characters
// // //             ( | / \ - ) so outlines are crisp and recognisable
// // // ──────────────────────────────────────────────────────────────

// // // Ordered lightest → darkest (background = space, bright highlight = @)
// // const DENSITY = " .,'`-_~:;!+=>*?()[]oxczXYCLUQ0OZmwqpdbkh#MW&8%B@$";

// // // Sobel kernels
// // const KX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
// // const KY = [[-1,-2,-1], [ 0, 0, 0], [ 1, 2, 1]];

// // export function pixelsToAscii(
// //   imageData: ImageData,
// //   cols: number,
// //   rows: number,
// // ): string {
// //   const d = imageData.data;

// //   // ── Pass 1: build luminance + alpha arrays ────────────────
// //   const lums  = new Float32Array(cols * rows);
// //   const alphas = new Float32Array(cols * rows);

// //   for (let i = 0; i < cols * rows; i++) {
// //     const p = i * 4;
// //     const a = d[p + 3] / 255;
// //     alphas[i] = a;
// //     if (a < 0.05) { lums[i] = 0; continue; }
// //     const r = d[p] / 255, g = d[p + 1] / 255, b = d[p + 2] / 255;
// //     // Perceived luminance
// //     lums[i] = (0.2126 * r + 0.7152 * g + 0.0722 * b) * a;
// //   }

// //   // ── Pass 2: Sobel edges ───────────────────────────────────
// //   const edges = new Float32Array(cols * rows);
// //   const angles = new Float32Array(cols * rows); // radians

// //   for (let row = 1; row < rows - 1; row++) {
// //     for (let col = 1; col < cols - 1; col++) {
// //       let gx = 0, gy = 0;
// //       for (let ky = -1; ky <= 1; ky++) {
// //         for (let kx = -1; kx <= 1; kx++) {
// //           const l = lums[(row + ky) * cols + (col + kx)];
// //           gx += l * KX[ky + 1][kx + 1];
// //           gy += l * KY[ky + 1][kx + 1];
// //         }
// //       }
// //       const mag = Math.sqrt(gx * gx + gy * gy);
// //       edges[row * cols + col] = mag;
// //       angles[row * cols + col] = Math.atan2(gy, gx);
// //     }
// //   }

// //   // ── Build output string ───────────────────────────────────
// //   const EDGE_THRESH = 0.14;
// //   const lines: string[] = [];

// //   for (let row = 0; row < rows; row++) {
// //     let line = "";
// //     for (let col = 0; col < cols; col++) {
// //       const idx = row * cols + col;

// //       // Transparent background → space
// //       if (alphas[idx] < 0.05) { line += " "; continue; }

// //       // Strong edge → directional character
// //       if (edges[idx] > EDGE_THRESH) {
// //         const ang = angles[idx];
// //         const deg = ((ang * 180 / Math.PI) + 180) % 180;
// //         if      (deg <  22.5 || deg >= 157.5) line += "-";
// //         else if (deg <  67.5)                 line += "/";
// //         else if (deg < 112.5)                 line += "|";
// //         else                                  line += "\\";
// //         continue;
// //       }

// //       const lum = lums[idx];

// //       // Hard floor — dark shadowed areas stay as spaces
// //       if (lum < 0.07) { line += " "; continue; }

// //       // gamma > 1 darkens mid-tones → more empty space, sharper contrast
// //       // (old value 0.65 was BRIGHTENING everything — made it over-dense)
// //       const boosted = Math.pow(lum, 1.25);
// //       const charIdx = Math.min(
// //         Math.floor(boosted * DENSITY.length),
// //         DENSITY.length - 1,
// //       );
// //       line += DENSITY[charIdx];
// //     }
// //     lines.push(line);
// //   }

// //   return lines.join("\n");
// // }



// // ──────────────────────────────────────────────────────────────
// // asciiRenderer.ts
// //
// // Portrait-focused ASCII renderer
// // Optimized for:
// //   • Facial recognizability
// //   • Smooth grayscale shading
// //   • Hair / beard / glasses preservation
// //   • Reduced edge-noise
// //   • Dense cinematic ASCII output
// //
// // IMPORTANT:
// // This version REMOVES Sobel edge overlay completely.
// // Edge-only rendering destroys facial identity.
// //
// // Instead we use:
// //   • High-quality luminance mapping
// //   • Contrast boosting
// //   • Gamma correction
// //   • Dense character ramp
// // ──────────────────────────────────────────────────────────────

// // Ordered lightest → darkest
// // Dense ramp preserves facial gradients much better
// const DENSITY =
//   " .'`^\",:;*#&%@$";

// export function pixelsToAscii(
//   imageData: ImageData,
//   cols: number,
//   rows: number,
// ): string {

//   const d = imageData.data;

//   // Luminance + alpha buffers
//   const lums = new Float32Array(cols * rows);
//   const alphas = new Float32Array(cols * rows);

//   // ────────────────────────────────────────────────────────────
//   // PASS 1: Build luminance buffer
//   // ────────────────────────────────────────────────────────────

//   let minLum = 1;
//   let maxLum = 0;

//   for (let i = 0; i < cols * rows; i++) {

//     const p = i * 4;

//     const r = d[p] / 255;
//     const g = d[p + 1] / 255;
//     const b = d[p + 2] / 255;
//     const a = d[p + 3] / 255;

//     alphas[i] = a;

//     if (a < 0.03) {
//       lums[i] = 0;
//       continue;
//     }

//     // Perceived luminance
//     let lum =
//       (0.2126 * r) +
//       (0.7152 * g) +
//       (0.0722 * b);

//     // Slight contrast boost
//     lum = Math.pow(lum, 0.92);

//     lums[i] = lum;

//     if (lum < minLum) minLum = lum;
//     if (lum > maxLum) maxLum = lum;
//   }

//   // Prevent divide-by-zero
//   const range = Math.max(maxLum - minLum, 0.0001);

//   // ────────────────────────────────────────────────────────────
//   // PASS 2: Build ASCII output
//   // ────────────────────────────────────────────────────────────

//   const lines: string[] = [];

//   for (let row = 0; row < rows; row++) {

//     let line = "";

//     for (let col = 0; col < cols; col++) {

//       const idx = row * cols + col;

//       // Transparent background
//       if (alphas[idx] < 0.03) {
//         line += " ";
//         continue;
//       }

//       // Normalize luminance
//       let lum = (lums[idx] - minLum) / range;

//       // Stronger cinematic contrast
//       lum = Math.pow(lum, 1.35);

//       // Preserve darker facial features
//       // like beard, sunglasses, hair texture
//       if (lum < 0.04) {
//         line += " ";
//         continue;
//       }

//       // Character mapping
//       const charIdx = Math.min(
//         Math.floor(lum * (DENSITY.length - 1)),
//         DENSITY.length - 1
//       );

//       line += DENSITY[charIdx];
//     }

//     lines.push(line);
//   }

//   return lines.join("\n");
// }




// ─────────────────────────────────────────────────────────────
//  asciiRenderer.ts
//
//  Two-pass portrait renderer:
//
//  Pass 1 — luminance + per-frame range normalisation
//    Stretches actual brightness range to the full char ramp
//    every frame. Prevents washed-out or over-dark output
//    regardless of lighting conditions.
//
//  Pass 2 — Sobel edge overlay
//    Facial features (eyes, nose, lips, hairline) live at colour
//    boundaries, not luminance peaks. Sobel finds those edges
//    and stamps directional chars so features read clearly even
//    at 65×44 resolution.
// ─────────────────────────────────────────────────────────────

// 20 characters, light → dense.
// On a dark terminal "dense" = visually bright.
const DENSITY = " .'`,:;=+*!oxc#%&@$";

const KX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
const KY = [[-1,-2,-1], [ 0, 0, 0], [ 1, 2, 1]];

export function pixelsToAscii(
  imageData: ImageData,
  cols: number,
  rows: number,
): string {
  const d = imageData.data;
  const n = cols * rows;

  // ── Pass 1: luminance buffer ──────────────────────────────
  const lums   = new Float32Array(n);
  const alphas = new Float32Array(n);
  let lo = 1.0, hi = 0.0;

  for (let i = 0; i < n; i++) {
    const p = i * 4;
    const a = d[p + 3] / 255;
    alphas[i] = a;
    if (a < 0.04) { lums[i] = 0; continue; }

    const r = d[p] / 255, g = d[p+1] / 255, b = d[p+2] / 255;
    // Perceived luminance (Rec. 709)
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    lums[i] = lum;
    if (lum > 0 && lum < lo) lo = lum;
    if (lum > hi) hi = lum;
  }

  const range = Math.max(hi - lo, 0.001);

  // ── Pass 2: Sobel edges ───────────────────────────────────
  const edges  = new Float32Array(n);
  const angles = new Float32Array(n);

  for (let row = 1; row < rows - 1; row++) {
    for (let col = 1; col < cols - 1; col++) {
      let gx = 0, gy = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const l = lums[(row + ky) * cols + (col + kx)];
          gx += l * KX[ky + 1][kx + 1];
          gy += l * KY[ky + 1][kx + 1];
        }
      }
      const mag = Math.sqrt(gx * gx + gy * gy);
      edges[row * cols + col]  = mag;
      angles[row * cols + col] = Math.atan2(gy, gx);
    }
  }

  // ── Output ────────────────────────────────────────────────
  const EDGE_T = 0.11;
  const lines: string[] = [];

  for (let row = 0; row < rows; row++) {
    let line = "";
    for (let col = 0; col < cols; col++) {
      const idx = row * cols + col;

      if (alphas[idx] < 0.04) { line += " "; continue; }

      // Edge overlay — directional chars for facial contours
      if (edges[idx] > EDGE_T) {
        const deg = ((angles[idx] * 180 / Math.PI) + 180) % 180;
        if      (deg <  22.5 || deg >= 157.5) line += "-";
        else if (deg <  67.5)                 line += "/";
        else if (deg < 112.5)                 line += "|";
        else                                  line += "\\";
        continue;
      }

      // Normalise + contrast curve
      const norm     = (lums[idx] - lo) / range;
      if (norm < 0.05) { line += " "; continue; }

      const contrast = Math.pow(norm, 1.25);
      const charIdx  = Math.min(
        Math.floor(contrast * (DENSITY.length - 1)),
        DENSITY.length - 1,
      );
      line += DENSITY[charIdx];
    }
    lines.push(line);
  }

  return lines.join("\n");
}