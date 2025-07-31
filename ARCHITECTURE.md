# Recipe App Architecture

## 📁 Project Structure

This project follows a **feature-based architecture** with clear separation of concerns, making it scalable, maintainable, and easy to understand.

```
src/
├── app/                    # Application entry point and configuration
│   ├── App.js              # Main application component with routing
│   ├── App.css             # Global application styles
│   └── index.css           # Reset and base styles
├── features/               # Feature-based organization
│   ├── recipes/            # Recipe management feature
│   │   ├── components/     # Recipe-specific components
│   │   │   ├── RecipesPage.js
│   │   │   └── RecipesPage.css
│   │   └── index.js        # Feature barrel exports
│   ├── users/              # User management feature
│   │   ├── components/     # User-specific components
│   │   │   ├── UsersPage.js
│   │   │   └── UsersPage.css
│   │   └── index.js        # Feature barrel exports
│   ├── pantry/             # Pantry management feature
│   │   ├── components/     # Pantry-specific components
│   │   │   ├── PantryPage.js
│   │   │   ├── PantryPage.css
│   │   │   ├── PantryItemCard.js
│   │   │   ├── AddItemModal.js
│   │   │   └── ReceiptScannerModal.js
│   │   └── index.js        # Feature barrel exports
│   ├── cooking-for/        # Cooking suggestions feature
│   │   ├── components/     # Cooking-for-specific components
│   │   │   ├── CookingForPage.js
│   │   │   └── CookingForPage.css
│   │   └── index.js        # Feature barrel exports
│   └── index.js            # All features barrel exports
├── shared/                 # Shared across features
│   ├── components/         # Reusable UI components (empty for now)
│   ├── hooks/              # Custom React hooks
│   │   ├── useLocalStorage.js  # Local storage hook
│   │   ├── useOCR.js          # OCR functionality hook
│   │   └── index.js           # Hooks barrel exports
│   ├── utils/              # Utility functions
│   │   ├── allergenUtils.js   # Allergen detection utilities
│   │   ├── receiptParser.js   # Receipt parsing logic
│   │   └── index.js           # Utils barrel exports
│   ├── constants/          # Application constants
│   │   ├── allergens.js       # Allergen definitions
│   │   ├── units.js           # Unit definitions and mappings
│   │   └── index.js           # Constants barrel exports
│   ├── styles/             # Global styles (for future use)
│   └── index.js            # All shared modules barrel exports
├── assets/                 # Static assets (for future use)
├── styles/                 # Additional global styles (for future use)
└── index.js                # Application entry point
```

## 🏗️ Architecture Principles

### 1. **Feature-Based Organization**
- Each major feature (recipes, users, pantry, cooking-for) has its own directory
- Components, styles, and logic are co-located within each feature
- Easy to understand what belongs to which feature
- Facilitates team development and code ownership

### 2. **Shared Module Pattern**
- Common functionality is extracted to the `shared` directory
- Reusable hooks, utilities, and constants are centralized
- Prevents code duplication across features
- Makes testing and maintenance easier

### 3. **Barrel Exports**
- Each directory has an `index.js` file for clean imports
- Enables `import { Component } from '../features'` instead of long paths
- Provides a clear public API for each module
- Makes refactoring easier (internal structure can change without affecting imports)

### 4. **Single Responsibility**
- Each component has one clear purpose
- Hooks handle specific pieces of stateful logic
- Utilities handle pure functions and data processing
- Constants are organized by domain

## 🚀 Benefits of This Structure

### **Scalability**
- Easy to add new features without affecting existing code
- Clear boundaries between different parts of the application
- New team members can quickly understand and contribute to specific features

### **Maintainability**
- Changes to one feature don't impact others
- Easy to locate and fix bugs
- Code reviews can be focused on specific features
- Refactoring is safer and more predictable

### **Testability**
- Small, focused components and functions are easier to test
- Shared utilities can be tested independently
- Features can be tested in isolation

### **Developer Experience**
- Clear file organization makes navigation intuitive
- Barrel exports provide clean, readable import statements
- Consistent patterns across the codebase

## 📝 Import Patterns

### **Feature Components**
```javascript
// Clean barrel imports
import { RecipesPage, PantryPage } from '../features';

// Specific feature imports
import { PantryItemCard } from '../features/pantry';
```

### **Shared Modules**
```javascript
// All shared modules
import { useLocalStorage, UNITS, parseReceiptText } from '../shared';

// Specific shared modules
import { useOCR } from '../shared/hooks';
import { ALLERGENS } from '../shared/constants';
```

### **Within Features**
```javascript
// Relative imports within the same feature
import AddItemModal from './AddItemModal';
import ReceiptScannerModal from './ReceiptScannerModal';
```

## 🔄 Future Enhancements

This architecture supports easy addition of:

- **New Features**: Add a new directory under `features/`
- **Shared Components**: Add to `shared/components/`
- **API Layer**: Add `shared/api/` or `shared/services/`
- **State Management**: Add `shared/store/` for Redux/Zustand
- **Routing**: Add `app/routes/` for React Router
- **Testing**: Add `__tests__/` directories alongside components
- **Documentation**: Add `docs/` directory at the root

## 🛠️ Development Guidelines

1. **Keep features isolated** - avoid cross-feature dependencies
2. **Use shared modules** for common functionality
3. **Create barrel exports** for public APIs
4. **Co-locate related files** within feature directories
5. **Follow consistent naming conventions** across the project
6. **Document complex logic** in shared utilities

This architecture ensures the codebase remains organized, scalable, and maintainable as the application grows! 🎉 