# Halden Motor House — Car Inventory

A pre-owned car dealership site for a fictional showroom in Bengaluru, with real cars from a Maruti Swift to a Ferrari 458. Built with **React**, **three.js**, **GSAP** and components adapted from **React Bits**.

**Live:** https://car-inventory-woad.vercel.app

## Features

- **3D feature car**: a Ferrari 458 Italia glTF model in a studio viewer. Drag to rotate it and preview it in six factory paint colours.
- **Quick search**: pick a make, body type and budget, and the inventory filters to match.
- **Inventory**: 13 real cars with photos, odometer readings, owner counts, prices and an EMI estimate. Filter by make, body, fuel and budget, then search, sort and save cars. GSAP Flip animates the grid as results change.
- **Listing sheet**: a large photo, the full spec table, an inspection report, a finance estimate and a test-drive booking form.
- **Motion**: GSAP ScrollSmoother scrolling, stacked-card transitions between sections, and a 3D Ferrari that drives in, brakes and turns as you scroll.
- **Cut-out stickers**: `npm run build` first runs `scripts/cutouts.mjs`, which downloads each photo and removes its background (`@imgly/background-removal-node` + `sharp`). If that step fails, the site falls back to the original photos.
- **EMI calculator**, a **trade-in form** and showroom details.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Structure

```
src/
  App.jsx                    page layout and shared state (filters, saved cars, open listing)
  data/inventory.js          the cars, plus price / EMI helpers
  three/FerrariViewer.js     three.js studio viewer for the Ferrari model
  sections/                  Header, Hero, Inventory, CarSheet, Services (brands, how it works, finance, sell, footer)
  components/reactbits/      SplitText, CountUp, ScrollVelocity (adapted from React Bits)
public/
  models/ferrari.glb         3D model (+ ambient-occlusion shadow)
  draco/                     Draco decoder used to load the compressed model
```

## Credits

- Car photos come from Wikimedia Commons and are used under their free licences. Each photographer is credited in the listing and in the site footer.
- The Ferrari 458 Italia 3D model is by [vicent091036](https://sketchfab.com/models/57bf6cc56931426e87494f554df1dab6), taken from the three.js examples.
- UI components are adapted from [React Bits](https://reactbits.dev) by David Haz.
- Halden Motor House is fictional. Car specs are real, but prices, kilometres and owner counts are sample data.
