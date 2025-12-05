# Contributing to ThreeDepth

Thank you for your interest in contributing to ThreeDepth! We welcome contributions from the community.

## License Agreement

ThreeDepth is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**. By contributing, you agree that your contributions will be licensed under the same license.

All contributions must include the appropriate license header at the top of each file.

## Before You Start

1. **Check existing issues** - Someone might already be working on it
2. **Open an issue first** - Discuss your proposed changes before investing time
3. **Keep it focused** - Submit separate PRs for separate features/fixes

## Development Setup

```bash
# Clone the repository
git clone https://github.com/unstable-studios/threedepth.git
cd threedepth

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Making Changes

### 1. Fork & Branch

```bash
# Fork the repo on GitHub, then:
git checkout -b feature/your-feature-name
```

### 2. Code Style

- Follow the existing code style (Prettier and ESLint are configured)
- Use TypeScript for all new files
- Add JSDoc comments for public APIs
- Keep functions small and focused

### 3. Add License Headers

All new `.ts` and `.tsx` files must include the AGPL-3.0 license header:

```typescript
/**
 * Copyright (C) 2025 Unstable Studios, LLC
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
```

### 4. Test Your Changes

- Test locally with `npm run dev`
- Test production build with `npm run build && npm run preview`
- Ensure no console errors or warnings
- Test in multiple browsers if possible

### 5. Commit Guidelines

- Use clear, descriptive commit messages
- Reference issue numbers when applicable
- Keep commits atomic (one logical change per commit)

Example:
```
Fix depth range slider precision (#123)

- Increase slider resolution to 0.01
- Update depth calculation precision
- Add validation for edge cases
```

## Submitting a Pull Request

1. **Update your branch** with the latest main:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run final checks**:
   ```bash
   npm run lint
   npm run build
   ```

3. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Open a Pull Request** on GitHub with:
   - Clear description of changes
   - Reference to related issue(s)
   - Screenshots/videos if UI changes
   - Testing steps

## What We Look For

✅ **Good PRs:**
- Solve a specific problem
- Include clear documentation
- Follow existing patterns
- Have proper license headers
- Are well-tested

❌ **Avoid:**
- Large, unfocused changes
- Breaking existing functionality
- Ignoring code style
- Missing license headers
- Untested code

## Review Process

1. Maintainers will review your PR within **3-5 business days**
2. We may request changes or clarification
3. Once approved, we'll merge your contribution
4. You'll be credited in release notes!

## Types of Contributions

### 🐛 Bug Fixes
Always welcome! Please include:
- Description of the bug
- Steps to reproduce
- Your fix

### ✨ New Features
Open an issue first to discuss:
- Use case and benefits
- Implementation approach
- Potential impact on existing features

### 📚 Documentation
Improvements to docs are highly valued:
- Fix typos or unclear sections
- Add examples or tutorials
- Improve API documentation

### 🎨 UI/UX Improvements
Design changes should:
- Match existing design language
- Be accessible (WCAG 2.1 AA)
- Work in light and dark modes

## Code of Conduct

### Be Respectful
- Use welcoming and inclusive language
- Respect differing viewpoints
- Accept constructive criticism gracefully
- Focus on what's best for the community

### Be Constructive
- Provide helpful feedback
- Explain the "why" behind suggestions
- Assume good intentions
- Help newcomers get started

### Unacceptable Behavior
- Harassment or discriminatory language
- Trolling or insulting comments
- Publishing others' private information
- Any conduct that would be inappropriate professionally

Violations may result in being banned from the project.

## Questions?

- 💬 **General questions**: Open a GitHub Discussion
- 🐛 **Bug reports**: Open a GitHub Issue
- 🔒 **Security issues**: Email contact@unstablestudios.com
- 💡 **Feature ideas**: Open a GitHub Issue with [Feature Request] tag

## Recognition

All contributors will be recognized in:
- GitHub Contributors page
- Release notes for their contributions
- Our gratitude! 🙏

Thank you for making ThreeDepth better!
