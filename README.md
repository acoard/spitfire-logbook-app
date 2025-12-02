# The Pilot's Journey: Spitfire Logbook

An immersive React application that brings a World War II RAF pilot's logbook to life. This project combines historical data with modern web technologies to create an interactive experience, featuring flight tracking, statistical analysis, and AI-generated historical context.

## 🚀 Features

- **Digital Logbook Interface**: Browse through detailed flight records, including dates, aircraft types, flight times, and pilot remarks.
- **Interactive Flight Map**: Visualize flight paths, origins, and destinations on an interactive map using Leaflet.
- **Mission Statistics**: View comprehensive breakdowns of flight hours, aircraft usage, and duty types with interactive charts.
- **AI-Powered Historical Context**: Integrated with Google's Gemini AI (Flash model) to provide educational historical context and expert insights for each specific logbook entry, acting as a virtual aviation historian.
- **Pilot Profile & Gallery**: Explore the pilot's service record and view historical photographs from the era.
- **Responsive Design**: Built with Tailwind CSS for a seamless experience across devices.

## 🛠️ Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **Mapping**: Leaflet / React-Leaflet
- **Data Visualization**: Recharts
- **AI Integration**: Google GenAI SDK (Gemini 2.0 Flash)
- **Routing**: React Router DOM

## 🏁 Getting Started

### Prerequisites
- Node.js (Latest LTS recommended)
- A Google Gemini API Key

### Installation

1. **Clone the repository** (or download source)
   ```bash
   git clone <repository-url>
   cd spitfire-logbook-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
   *(Note: The application is configured to map `GEMINI_API_KEY` to the internal usage in `vite.config.ts`)*

4. **Run the Application**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

## 📁 Project Structure

- `components/`: React components for various UI elements (LogbookPanel, MapPanel, StatsPanel, etc.)
- `services/`: Logic for data handling and AI integration (`flightData.ts`, `aiService.ts`).
- `types.ts`: TypeScript definitions for log entries and data structures.
- `App.tsx`: Main application layout and routing logic.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source.
