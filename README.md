# 🍳 Recipe Creator App

A modern, feature-rich recipe management application built with React. Manage your recipes, track your pantry, scan receipts with OCR, and get cooking suggestions based on dietary restrictions and available ingredients.

## ✨ Features

### 🔐 Authentication
- **Google OAuth Integration** - Secure login with Google accounts
- User profile management with avatar and personal information
- Persistent login sessions
- Beautiful, modern login interface

### 🍽️ Recipe Management
- Create, edit, and organize your favorite recipes
- Add ingredients with precise quantities and units
- Include cooking instructions and timing
- Beautiful, responsive recipe cards

### 🥫 Smart Pantry
- Track all your pantry items with quantities
- Add items manually or scan grocery receipts
- **OCR Receipt Scanning** - Upload receipt photos for automatic item extraction
- Intelligent parsing of various receipt formats (Walmart, Target, generic stores)
- Merge quantities for duplicate items

### 👥 User Management
- Add family members and friends
- Track dietary restrictions and allergens
- UK Law compliant with 14 major allergen categories

### 🧑‍🍳 Cooking Suggestions
- Get recipe recommendations based on available ingredients
- Filter by allergen restrictions for specific users
- Smart ingredient matching and substitution hints

## 🏗️ Architecture

This project uses a **modern feature-based architecture** for maximum scalability and maintainability:

```
src/
├── app/           # Application entry point
├── features/      # Feature-based organization
│   ├── recipes/   # Recipe management
│   ├── pantry/    # Pantry & receipt scanning
│   ├── users/     # User management
│   └── cooking-for/ # Cooking suggestions
├── shared/        # Shared utilities, hooks, constants
├── assets/        # Static assets
└── styles/        # Global styles
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation.

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Modern web browser with camera access (for receipt scanning)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd recipe-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Google OAuth** (Required for authentication)
   - Follow the [Google OAuth Setup Guide](./GOOGLE_OAUTH_SETUP.md)
   - Update the Client ID in `src/app/App.js`

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Available Scripts

### Development
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Code Quality
- `npm run lint` - Check code style
- `npm run lint:fix` - Fix code style issues
- `npm run format` - Format code with Prettier

### Analysis
- `npm run analyze` - Analyze bundle size
- `npm run clean` - Clean build artifacts

## 🎯 Usage

### Recipe Management
1. Click the "Recipes" tab
2. Use "Create New Recipe" to add recipes
3. Fill in ingredients, instructions, and cooking time
4. Edit or delete recipes as needed

### Pantry Tracking
1. Navigate to the "Pantry" tab
2. **Manual Entry**: Click "Add to Pantry" for individual items
3. **Receipt Scanning**: Click "Scan Receipt" and either:
   - Upload a photo of your receipt (OCR will extract items)
   - Paste receipt text manually
4. Select items to add and click "Save to Pantry"

### User Management
1. Go to the "Users" tab
2. Add family members with their allergen information
3. Use UK Law compliant allergen categories

### Cooking Suggestions
1. Visit the "Cooking For" tab
2. Select a user to cook for
3. Get recipe suggestions based on:
   - Available pantry ingredients
   - User's allergen restrictions
   - Ingredient matching algorithms

## 🔧 Technical Features

### OCR Receipt Scanning
- **Tesseract.js** integration for in-browser OCR
- Support for various receipt formats
- Intelligent item parsing with regex patterns
- Automatic quantity and unit detection
- Image optimization for better recognition

### Data Persistence
- Local storage for offline functionality
- Custom hooks for state management
- Automatic data synchronization

### Responsive Design
- Mobile-first design approach
- Touch-friendly interfaces
- Optimized for various screen sizes

## 🏷️ Technologies Used

- **Frontend**: React 19, CSS3, HTML5
- **OCR**: Tesseract.js
- **Testing**: Jest, React Testing Library
- **Build**: Create React App
- **Code Quality**: ESLint, Prettier

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with camera access

## 🔒 Privacy & Data

- All data stored locally in your browser
- No server communication required
- Receipt images processed locally (not uploaded)
- Full privacy and data control

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the existing code patterns and architecture
4. Run tests and linting (`npm test && npm run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, feature requests, or bug reports, please open an issue on GitHub.

---

Built with ❤️ and modern React patterns. Enjoy cooking! 🍳✨
##test##
