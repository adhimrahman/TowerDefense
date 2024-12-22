/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			colors: {
				green: {
					500: "#6BD425",
				  },
				  brown: {
					500: "#A67B5B",
				  },
			}
		},
	},
	plugins: [],
}