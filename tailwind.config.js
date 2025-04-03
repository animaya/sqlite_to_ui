export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./routes/**/*.{js,ts,jsx,tsx}",
    "./islands/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB', // blue-600
          dark: '#1E40AF',    // blue-800
          light: '#DBEAFE',   // blue-100
        },
        success: '#10B981',   // emerald-500
        warning: '#F59E0B',   // amber-500
        error: '#EF4444',     // red-500
        info: '#0EA5E9',      // sky-500
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      // Add other custom theme extensions here
    },
  },
  plugins: [
    // Add tailwind plugins here
  ],
}
