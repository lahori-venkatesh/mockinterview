# 🤝 Contributing to MockInterview

Thank you for your interest in contributing to MockInterview! We welcome contributions from developers of all skill levels.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contribution Guidelines](#contribution-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## 📜 Code of Conduct

### Our Pledge
We are committed to making participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards
Examples of behavior that contributes to creating a positive environment include:
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

### Unacceptable Behavior
Examples of unacceptable behavior include:
- The use of sexualized language or imagery
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate in a professional setting

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Git
- MongoDB Atlas account (for database)
- Basic knowledge of React.js and Node.js

### Fork and Clone
1. Fork the repository on GitHub
2. Clone your fork locally:
```bash
git clone https://github.com/YOUR_USERNAME/mockinterview.git
cd mockinterview
```

3. Add the original repository as upstream:
```bash
git remote add upstream https://github.com/lahori-venkatesh/mockinterview.git
```

## 🛠 Development Setup

### Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Configure your environment variables
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
cp .env.development.example .env.development
# Configure your environment variables
npm start
```

### Admin Panel Setup
```bash
cd admin-panel
npm install
cp .env.development.example .env.development
# Configure your environment variables
npm start
```

## 📝 Contribution Guidelines

### Types of Contributions

#### 🐛 Bug Fixes
- Fix existing bugs or issues
- Improve error handling
- Performance optimizations

#### ✨ New Features
- Add new functionality
- Enhance existing features
- Improve user experience

#### 📚 Documentation
- Improve README files
- Add code comments
- Create tutorials or guides

#### 🎨 UI/UX Improvements
- Design enhancements
- Accessibility improvements
- Mobile responsiveness

#### 🧪 Testing
- Add unit tests
- Integration tests
- End-to-end tests

### Before You Start
1. **Check existing issues** - Look for existing issues or feature requests
2. **Create an issue** - If none exists, create one to discuss your idea
3. **Get approval** - Wait for maintainer approval before starting work
4. **Assign yourself** - Comment on the issue to get it assigned to you

## 🔄 Pull Request Process

### 1. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Your Changes
- Write clean, readable code
- Follow the existing code style
- Add tests for new functionality
- Update documentation as needed

### 3. Commit Your Changes
```bash
git add .
git commit -m "feat: add new feature description"
# or
git commit -m "fix: resolve bug description"
```

### Commit Message Format
Use conventional commits format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### 4. Push and Create PR
```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:
- Clear title and description
- Reference to related issues
- Screenshots (if UI changes)
- Testing instructions

### 5. PR Review Process
- Maintainers will review your PR
- Address any requested changes
- Once approved, your PR will be merged

## 🐛 Issue Guidelines

### Reporting Bugs
When reporting bugs, please include:
- **Clear title** - Descriptive and specific
- **Environment** - OS, browser, Node.js version
- **Steps to reproduce** - Detailed steps
- **Expected behavior** - What should happen
- **Actual behavior** - What actually happens
- **Screenshots** - If applicable
- **Additional context** - Any other relevant information

### Feature Requests
When requesting features, please include:
- **Clear description** - What you want to achieve
- **Use case** - Why this feature is needed
- **Proposed solution** - How you think it should work
- **Alternatives** - Other solutions you've considered

## 💻 Coding Standards

### JavaScript/React
- Use ES6+ features
- Follow React best practices
- Use functional components with hooks
- Implement proper error boundaries
- Use meaningful variable and function names

### Code Style
- Use Prettier for code formatting
- Follow ESLint rules
- Use consistent indentation (2 spaces)
- Add JSDoc comments for functions
- Keep functions small and focused

### File Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── utils/              # Utility functions
├── services/           # API services
└── styles/             # CSS/styling files
```

### API Development
- Use RESTful conventions
- Implement proper error handling
- Add input validation
- Use appropriate HTTP status codes
- Document API endpoints

## 🧪 Testing

### Frontend Testing
```bash
cd client
npm test
```

### Backend Testing
```bash
cd server
npm test
```

### Test Requirements
- Write unit tests for new functions
- Add integration tests for API endpoints
- Ensure all tests pass before submitting PR
- Aim for good test coverage

## 📖 Documentation

### Code Documentation
- Add JSDoc comments for functions
- Include inline comments for complex logic
- Update README files when needed
- Document API endpoints

### Documentation Standards
- Use clear, concise language
- Include code examples
- Keep documentation up to date
- Add screenshots for UI changes

## 🏷 Labels and Milestones

### Issue Labels
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `priority: high` - High priority issue
- `priority: low` - Low priority issue

### PR Labels
- `ready for review` - PR is ready for review
- `work in progress` - PR is still being worked on
- `needs changes` - PR needs modifications
- `approved` - PR has been approved

## 🎯 Areas for Contribution

### High Priority
- 🐛 Bug fixes
- 🔒 Security improvements
- ⚡ Performance optimizations
- 📱 Mobile responsiveness

### Medium Priority
- ✨ New features
- 🎨 UI/UX improvements
- 📚 Documentation
- 🧪 Test coverage

### Low Priority
- 🔧 Code refactoring
- 📝 Code comments
- 🎯 Minor enhancements

## 🆘 Getting Help

If you need help with contributing:

1. **Check the documentation** - README and this guide
2. **Search existing issues** - Your question might be answered
3. **Ask in discussions** - Use GitHub Discussions
4. **Contact maintainers** - Email lahorivenkatesh709@gmail.com

## 🎉 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Special mentions in project updates

## 📞 Contact

- **Project Maintainer**: Lahori Venkatesh
- **Email**: lahorivenkatesh709@gmail.com
- **GitHub**: [@lahori-venkatesh](https://github.com/lahori-venkatesh)

---

Thank you for contributing to MockInterview! Your efforts help make interview preparation better for everyone. 🚀