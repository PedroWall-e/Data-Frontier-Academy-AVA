/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                frontier: {
                    dark: '#2B2B2B',
                    blue: '#3347FF',
                    peach: '#FFE3D6',
                    rawhide: '#B2624F',
                    lightbg: '#F9F8F6',
                }
            },
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', '"Inter"', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
