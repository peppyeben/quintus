/** @type {import('tailwindcss').Config} */
import tailwindScrollbar from "tailwind-scrollbar"; // Import the plugin using import syntax

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./src/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [tailwindScrollbar], // Use the imported plugin
};
