# Healthcare Advocates Search Platform 🏥

A modern web application built with Next.js 14 for searching and filtering healthcare advocates based on various criteria like specialties, location, and experience.

## Features ✨

- 🔍 Real-time search with debouncing
- 📱 Fully responsive design
- 🎯 Advanced filtering options
- 📊 Server-side pagination
- 🚀 Optimized performance
- 💅 Modern UI with Material-UI

## Tech Stack 🛠️

- Next.js 14
- TypeScript
- Material-UI
- SQLite (for demo purposes)

## Getting Started 🚀

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/healthcare-advocates.git
cd healthcare-advocates
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure 📁

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── advocates/     # Advocates API endpoints
│   └── advocates/         # Advocates page components
├── components/            # Shared components
├── lib/                   # Utility functions
└── types/                # TypeScript type definitions
```

## Development 🔧

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run type-check`: Run TypeScript compiler check

## Contributing 🤝

Contributions, issues, and feature requests are welcome! Feel free to check [issues page](https://github.com/yourusername/healthcare-advocates/issues).

## License 📝

This project is [MIT](LICENSE) licensed.

## Learn More 📚

For a detailed discussion of the implementation, challenges, and future improvements, check out the [DISCUSSION.md](DISCUSSION.md) file.
