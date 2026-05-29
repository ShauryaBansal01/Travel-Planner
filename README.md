# 🗺️ Travel Planner

Travel Planner is a modern, full-stack Next.js web application designed to help users seamlessly plan their perfect trips, organize day-by-day itineraries with interactive mapping, visual 3D globes, and effortless drag-and-drop organization. 

---

## ✨ Features

- **📊 Comprehensive Dashboard**: A clean and modern user workspace showing upcoming trips, statistics (e.g., total trips, upcoming journeys), and recently updated plans.
- **🗺️ Interactive Itinerary Mapping**: Built-in maps showing detailed location markers for every stop on a trip, centering on itinerary points dynamically.
- **📍 Dynamic Drag-and-Drop Planning**: Visually rearrange itinerary stops on the fly. Reordering items automatically recalculates stop orders and persists them instantly in the database.
- **🌍 Interactive 3D Journey Globe**: A beautiful 3D globe visualization under `/globe` that fetches all visited coordinates, reverse-geocodes them, and showcases interactive markers across the world alongside total countries visited.
- **🔐 Secure Authentication**: Integrated Next-Auth (v5) for secure user sessions, guarding all trips and planner routes.
- **🎨 Sleek Responsive UI**: Premium responsive layout built with curated styling, featuring custom hero animations and a clean dark/light semantic design system.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Database ORM**: [Prisma ORM](https://www.prisma.io/)
- **Database**: PostgreSQL (connected via `@prisma/adapter-pg`)
- **Authentication**: [Next-Auth v5](https://authjs.dev/)
- **Map Visualizations**: [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/)
- **3D Globe Engine**: [React-Globe.gl](https://github.com/vasturiano/react-globe.gl)
- **Drag-and-Drop Mechanics**: [@dnd-kit/core](https://dnd-kit.com/) & `@dnd-kit/sortable`
- **Component Styling**: Vanilla CSS and curated modern theme utilities

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
First, clone the repository and install the required modules. Because React 19 is utilized, resolve peer dependencies securely:
```bash
npm install --legacy-peer-deps
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory and configure the database and authentication secrets:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/travel_planner"
NEXTAUTH_SECRET="your-next-auth-secret-key"
AUTH_TRUST_HOST=true
```

### 3. Setup Database Schema
Initialize database tables using Prisma migration:
```bash
npx prisma db push
```

### 4. Run the Development Server
Launch the local Turbopack development environment:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to start exploring your Travel Planner.

---

## 🧠 Challenges Faced & Key Technical Resolutions

During development, we navigated several complex framework, API, and database-level integration challenges. Below is an overview of these issues and how we engineered clean, robust resolutions:

### 1. Migrating from Paid Google Maps to Free Leaflet & Nominatim
* **The Challenge**: The project originally relied on the paid **Google Maps Platform** for map rendering (`@react-google-maps/api`) and geocoding (`maps.googleapis.com/maps/api/geocode/json`). This required credit card billing, API key generation, and threw fatal crashes in environments without configured keys.
* **The Resolution**: We swapped the entire geolocation stack out in favor of completely free, open-source alternatives:
  - **Map Layer**: Replaced Google Maps with **Leaflet** and **React-Leaflet** utilizing free **OpenStreetMap** tile layers.
  - **Geocoding Engine**: Developed server-side and client-side forward and reverse geocoding integrations powered by the open-source **OSM Nominatim API**. We set customized headers (e.g. `User-Agent`) to comply with Nominatim's fair-use rules, eliminating the need for developer accounts or API keys.

### 2. Handling Leaflet Server-Side Rendering (SSR) Hydration Crashes
* **The Challenge**: Leaflet is a client-side library that references browser globals like `window` and `document`. When Next.js tried to pre-render the map on the server, it would crash instantly with a `ReferenceError: window is not defined` exception.
* **The Resolution**: We wrapped the Leaflet `Map` component inside a Next.js **dynamic import** with **`ssr: false`** in [trip-detail.tsx](file:///c:/MyProjects/Travel-Planner/TRAVEL-PLANNER/components/trip-detail.tsx):
  ```typescript
  import dynamic from "next/dynamic";
  
  const Map = dynamic(() => import("@/components/map"), {
    ssr: false,
    loading: () => <div className="loading-fallback">Loading map...</div>,
  });
  ```
  This guarantees that the Leaflet script loads exclusively in the browser context, ensuring smooth hydration.

### 3. Leaflet Default Marker Bundle Image Resolutions
* **The Challenge**: Next.js bundlers (Webpack/Turbopack) compile and relocate image assets, which breaks Leaflet's internal relative paths for marker pin icons, resulting in missing marker images on the map.
* **The Resolution**: We bypassed the path bundler resolution by explicitly resetting Leaflet's default marker icons to use static, CDN-hosted icons directly inside [map.tsx](file:///c:/MyProjects/Travel-Planner/TRAVEL-PLANNER/components/map.tsx):
  ```typescript
  import L from "leaflet";
  
  const defaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });
  ```

### 4. PostgreSQL Adapter Transaction & Savepoint Errors
* **The Challenge**: In [reorder-itineraty.ts](file:///c:/MyProjects/Travel-Planner/TRAVEL-PLANNER/lib/actions/reorder-itineraty.ts), calling parallel update operations wrapped in a `prisma.$transaction([])` triggered a fatal error: `Nested transactions are not supported by adapter "pg" (postgresql): createSavepoint is not implemented.` due to driver adapter limitations in Prisma.
* **The Resolution**: We refactored the bulk updates inside the Server Action to execute **sequentially** using a standard, highly performant `for` loop:
  ```typescript
  for (let i = 0; i < newOrder.length; i++) {
    await prisma.location.update({
      where: { id: newOrder[i] },
      data: { order: i },
    });
  }
  ```
  This completely resolved transaction driver savepoint constraints, assuring perfect compatibility and reliability across all database engines.

### 5. Next.js Dynamic Route Param Casing Mismatch
* **The Challenge**: The dynamic route folder for adding an itinerary location was named lowercase **`[tripid]`**, but the route page destructured the `params` object using camelCase: `const { tripId } = await params;`. Destructuring an unmatched case resulted in `tripId` evaluating to `undefined`, which violated database schema nullability constraints and threw `500` server errors.
* **The Resolution**: We corrected [page.tsx](file:///c:/MyProjects/Travel-Planner/TRAVEL-PLANNER/app/trips/%5Btripid%5D/itinerary/new/page.tsx) to destructure `tripid` in exact lowercase alignment with the folder naming:
  ```typescript
  export default async function NewLocation({ params }: { params: Promise<{ tripid: string }> }) {
    const { tripid } = await params;
    return <NewLocationClient tripId={tripid} />;
  }
  ```

### 6. Awaiting Server Action Transitions in React 19
* **The Challenge**: Submitting the location form inside `useTransition` without awaiting the async action triggered unhandled background promise rejections when the action called `redirect()`. This caused background routing crashes and returned `500` page status codes.
* **The Resolution**: Under **React 19**, `startTransition` natively handles promises. We updated the form handler in [new-location.tsx](file:///c:/MyProjects/Travel-Planner/TRAVEL-PLANNER/components/new-location.tsx) to be an asynchronous callback and fully `await` the action:
  ```tsx
  action={async (formData: FormData) => {
    startTransition(async () => {
      await addLocation(formData, tripId);
    });
  }}
  ```
  This allows Next.js to elegantly intercept the redirect event, handling client-side routing safely.
