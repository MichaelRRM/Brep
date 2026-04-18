/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        border:     'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card:       'hsl(var(--card))',
        primary:    { DEFAULT: 'hsl(var(--primary))',   foreground: 'hsl(var(--primary-foreground))' },
        secondary:  { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted:      { DEFAULT: 'hsl(var(--muted))',     foreground: 'hsl(var(--muted-foreground))' },
        solar:      'hsl(var(--solar))',
        bess:       'hsl(var(--bess))',
        grid:       'hsl(var(--grid))',
        curtailment:'hsl(var(--curtailment))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
};
