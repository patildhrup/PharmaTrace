/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./src/**/*.{js,jsx,ts,tsx}",
	],
	theme: {
		extend: {
			colors: {
				brand: {
					black: "#0a0a0a",
					gray: "#141414",
					green: "#22c55e", // emerald-500
					greenDark: "#16a34a", // emerald-600
					greenLite: "#86efac" // emerald-200
				}
			},
			backgroundImage: {
				"grid-radial": "radial-gradient(circle at 1px 1px, rgba(34,197,94,.2) 1px, transparent 0)",
				"hero-glow": "radial-gradient(60% 60% at 50% 40%, rgba(34,197,94,0.25), transparent 60%)"
			},
			keyframes: {
				float: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-8px)' }
				},
				pulseGlow: {
					'0%, 100%': { boxShadow: '0 0 0 0 rgba(34,197,94,0.6)' },
					'50%': { boxShadow: '0 0 30px 8px rgba(34,197,94,0.25)' }
				},
				slideIn: {
					'0%': { transform: 'translateX(-100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				fadeInUp: {
					'0%': { transform: 'translateY(30px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				rotate: {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				},
				wiggle: {
					'0%, 100%': { transform: 'rotate(-3deg)' },
					'50%': { transform: 'rotate(3deg)' }
				},
				shimmer: {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				}
			},
			animation: {
				float: 'float 5s ease-in-out infinite',
				pulseGlow: 'pulseGlow 2.5s ease-in-out infinite',
				slideIn: 'slideIn 0.5s ease-out',
				fadeInUp: 'fadeInUp 0.6s ease-out',
				rotate: 'rotate 2s linear infinite',
				wiggle: 'wiggle 1s ease-in-out infinite',
				shimmer: 'shimmer 2s infinite'
			}
		},
	},
	plugins: [],
}
