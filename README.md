# Halden Motor House — 3D Car Inventory

A dealership inventory site where every car is a live 3D render. Built with **React**, **three.js**, **GSAP** (ScrollTrigger + Flip) and components adapted from **React Bits**.

## Features

- **3D showroom hero**: a car on a lit turntable, with orbiting light ribbons, drifting dust and an aurora shader sky. Switch between featured models and the current car drives off as the next one rolls in.
- **Scroll-scrubbed walkaround**: the section pins while the camera orbits the car (front three-quarter, side profile, rear, overhead), and spec callouts change at each stop. The story sections snap one scroll at a time.
- **Inventory**: studio renders of each car are generated in the browser. Filter by body style, fuel, condition and budget; search; sort; save favourites. GSAP Flip animates the grid as results change.
- **Vehicle configurator**: a drag-to-rotate 360° viewer with live repainting, a spec sheet, an EMI calculator and a test-drive request form.
- **Finance**: an EMI calculator with a principal/interest split, a scroll-velocity marquee and spotlight service cards.

Every car is generated in code from a side profile (`src/three/carFactory.js`): six body styles (coupé, sedan, SUV, roadster, pickup, hatchback) with real-time paint, rolling wheels and LED light signatures. No model files to download.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Structure

```
src/
  App.jsx                 page + scroll choreography (ScrollTrigger timelines, snapping)
  three/
    carFactory.js         procedural car generator
    studio.js             renderer, lighting, environment, floor
    Stage.js              hero/walkaround scene (ribbons, particles, drive transitions)
    renders.js            inventory studio renders + 360° viewer
  components/reactbits/   SplitText, ShinyText, CountUp, SpotlightCard, Magnet,
                          StarBorder, ScrollVelocity, ClickSpark, Aurora
  sections/               Hero, Showroom, Inventory, CarModal, Finance, Chrome (nav/footer)
  data/inventory.js       sample inventory + INR / EMI helpers
```

To use real stock, replace the array in `src/data/inventory.js` with data from an API. Each car needs a `body` (one of the six styles) and a `paint` colour.

## Credits

- UI components are adapted from [React Bits](https://reactbits.dev) by David Haz.
- 3D: [three.js](https://threejs.org). Motion: [GSAP](https://gsap.com).
- Halden is a fictional brand, and all inventory, prices and addresses are sample data.
