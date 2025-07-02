# JIRA-Driven UI Development Instructions

## 🎯 Overview

This React application automatically reads JIRA issues from your MCP server and implements UI changes based on the issue descriptions. The system provides a seamless workflow from JIRA ticket to working UI implementation.

## 🏗️ System Architecture

```
JIRA ←→ MCP Server ←→ Backend Proxy ←→ React Frontend ←→ UI Generation
      (stdio)        (HTTP API)       (Components)   (Auto-Implementation)
```

## 📋 Prerequisites

### Required Setup
1. **MCP Server**: Configured at `C:\Priyanka\projects\mcp-server-atlassian-jira-main\`
2. **JIRA Access**: Valid JIRA credentials configured in MCP server
3. **Node.js**: Version 16+ installed
4. **Dependencies**: Express, React, CORS installed

### Verify MCP Configuration
Check `.vscode/mcp.json`:
```json
{
    "servers": {
        "my-mcp-server-1f947d6f": {
            "type": "stdio",
            "command": "node",
            "args": ["C:\\Priyanka\\projects\\mcp-server-atlassian-jira-main\\mcp-server-atlassian-jira-main\\src\\index.ts"]
        }
    }
}
```

## 🚀 Getting Started

### Step 1: Start the Application
```bash
# 1. Start the backend proxy server (Terminal 1)
cd "c:\Priyanka\projects\frontendapp"
node server/mcpProxy.js

# 2. Start the React frontend (Terminal 2)
npm start
```

### Step 2: Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 📝 JIRA Issue Format for UI Changes

### Standard Issue Structure
For the system to automatically implement UI changes, format your JIRA issues as follows:

#### Issue Summary Format:
```
[UI] Component Name - Brief Description
Example: [UI] UserProfile - Add avatar upload functionality
```

#### Issue Description Template:
```markdown
## Component Requirements

**Component Name**: UserProfile
**Component Type**: Functional Component
**Location**: src/components/UserProfile.jsx

## UI Specifications

### Layout
- Display user avatar (150x150px, circular)
- User name and email below avatar
- Edit profile button
- Upload avatar button

### Styling
- Background: #f8f9fa
- Border radius: 8px
- Padding: 20px
- Shadow: 0 2px 4px rgba(0,0,0,0.1)

### Functionality
- Click avatar to upload new image
- Validate image size (max 2MB)
- Support JPG, PNG formats
- Show loading state during upload

## Acceptance Criteria
- [ ] Avatar displays current user image
- [ ] Upload button triggers file picker
- [ ] Image validation works correctly
- [ ] Loading state shows during upload
- [ ] Success message after upload
- [ ] Error handling for failed uploads

## Props Interface
```typescript
interface UserProfileProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  onAvatarUpload: (file: File) => Promise<void>;
  onProfileEdit: () => void;
}
```

## State Management
- Local state for upload progress
- Error state for validation messages
- Loading state for async operations
```

## 🎨 Supported UI Component Types

### 1. Form Components
**Issue Keywords**: `form`, `input`, `validation`, `submit`
**Auto-generates**:
- Form structure with validation
- Input components with proper types
- Submit handling with error states
- Loading states and success messages

### 2. Data Display Components
**Issue Keywords**: `table`, `list`, `card`, `grid`
**Auto-generates**:
- Responsive layouts
- Sorting and filtering
- Pagination controls
- Loading skeletons

### 3. Navigation Components
**Issue Keywords**: `navigation`, `menu`, `sidebar`, `header`
**Auto-generates**:
- Responsive navigation
- Active state handling
- Mobile hamburger menu
- Breadcrumb navigation

### 4. Modal/Dialog Components
**Issue Keywords**: `modal`, `dialog`, `popup`, `overlay`
**Auto-generates**:
- Modal structure with backdrop
- Close functionality
- Focus management
- Escape key handling

### 5. Interactive Components
**Issue Keywords**: `button`, `dropdown`, `toggle`, `slider`
**Auto-generates**:
- Interactive states (hover, active, disabled)
- Accessibility attributes
- Event handlers
- Animation transitions

## 🔄 Workflow: From JIRA to UI

### Phase 1: Issue Detection
1. **Monitor JIRA**: System polls for new UI-related issues
2. **Parse Description**: Extract component specifications
3. **Validate Format**: Check if issue follows required template
4. **Queue Processing**: Add to implementation queue

### Phase 2: Code Generation
1. **Component Analysis**: Determine component type and complexity
2. **File Generation**: Create component file, styles, and tests
3. **Props Interface**: Generate TypeScript interfaces
4. **State Logic**: Add necessary state management

### Phase 3: Implementation
1. **File Creation**: Generate files in appropriate directories
2. **Import Updates**: Update parent components with new imports
3. **Route Integration**: Add routes if navigation component
4. **Style Integration**: Include CSS/styled-components

### Phase 4: Testing & Validation
1. **Unit Tests**: Generate comprehensive test suites
2. **Integration Tests**: Test component integration
3. **Accessibility Tests**: Ensure WCAG compliance
4. **Visual Regression**: Compare with design specifications

## 📁 Generated File Structure

```
src/
├── components/
│   ├── [ComponentName]/
│   │   ├── index.jsx              # Main component
│   │   ├── [ComponentName].css    # Component styles
│   │   ├── [ComponentName].test.js # Unit tests
│   │   └── [ComponentName].stories.js # Storybook stories
├── hooks/
│   └── use[ComponentName].js      # Custom hooks if needed
├── types/
│   └── [ComponentName].types.ts   # TypeScript interfaces
└── utils/
    └── [componentName]Utils.js    # Utility functions
```

## 🎯 Implementation Commands

### Fetch and Implement Single Issue
```bash
# Via frontend UI
1. Enter JIRA issue key (e.g., "UI-123")
2. Click "Fetch & Implement"
3. Review generated code
4. Apply changes

# Via API call
curl -X POST http://localhost:3001/api/jira/implement \
  -H "Content-Type: application/json" \
  -d '{"issueKey": "UI-123"}'
```

### Bulk Implementation
```bash
# Implement multiple issues
curl -X POST http://localhost:3001/api/jira/implement/bulk \
  -H "Content-Type: application/json" \
  -d '{"issueKeys": ["UI-123", "UI-124", "UI-125"]}'
```

### Preview Mode
```bash
# Generate code without applying changes
curl -X POST http://localhost:3001/api/jira/preview \
  -H "Content-Type: application/json" \
  -d '{"issueKey": "UI-123"}'
```

## 🛠️ Configuration Options

### Environment Variables (.env)
```env
# JIRA Configuration
JIRA_BASE_URL=https://your-company.atlassian.net
JIRA_PROJECT_KEY=MYPROJECT

# MCP Server Configuration
MCP_SERVER_PATH=C:\Priyanka\projects\mcp-server-atlassian-jira-main\mcp-server-atlassian-jira-main\src\index.ts
MCP_TIMEOUT=30000

# Code Generation Options
GENERATE_TESTS=true
GENERATE_STORIES=true
GENERATE_TYPESCRIPT=true
USE_STYLED_COMPONENTS=false

# File Paths
COMPONENTS_PATH=src/components
HOOKS_PATH=src/hooks
TYPES_PATH=src/types
UTILS_PATH=src/utils
```

### Code Generation Settings (config/generation.json)
```json
{
  "componentDefaults": {
    "useTypeScript": true,
    "generateTests": true,
    "generateStories": true,
    "cssFramework": "vanilla", // "vanilla", "styled-components", "emotion"
    "testFramework": "jest", // "jest", "vitest"
    "importStyle": "named" // "named", "default"
  },
  "fileNaming": {
    "components": "PascalCase",
    "files": "kebab-case",
    "tests": "ComponentName.test.js"
  },
  "codeStyle": {
    "indentation": 2,
    "quotes": "single",
    "semicolons": true,
    "trailingComma": "es5"
  }
}
```

## 📊 UI Implementation Dashboard

### Access Implementation Dashboard
Navigate to: http://localhost:3000/implementation-dashboard

### Dashboard Features
1. **Issue Queue**: View pending UI implementation tasks
2. **Progress Tracking**: Monitor implementation status
3. **Code Preview**: Review generated code before applying
4. **Error Logs**: Debug failed implementations
5. **Success Metrics**: Track successful implementations

### Dashboard Sections

#### 1. Issue Monitor
- **Pending Issues**: New UI issues awaiting implementation
- **In Progress**: Currently being processed
- **Completed**: Successfully implemented
- **Failed**: Issues that encountered errors

#### 2. Code Generator
- **Preview Mode**: See generated code without applying
- **Validation**: Check code quality and standards
- **Conflicts**: Detect file conflicts before implementation
- **Dependencies**: Show required npm packages

#### 3. Implementation Tools
- **Batch Processing**: Implement multiple issues
- **Rollback**: Undo recent implementations
- **Code Diff**: Compare generated vs existing code
- **Manual Override**: Edit generated code before applying

## 🧪 Testing Generated Components

### Automated Testing
```bash
# Run tests for generated components
npm test -- --testPathPattern="generated"

# Run specific component tests
npm test UserProfile.test.js

# Generate test coverage report
npm run test:coverage
```

### Manual Testing Checklist
- [ ] Component renders without errors
- [ ] Props are properly typed and validated
- [ ] Event handlers work as expected
- [ ] Responsive design functions correctly
- [ ] Accessibility requirements met
- [ ] Performance is acceptable

## 🔧 Troubleshooting

### Common Issues

#### MCP Server Connection Failed
```bash
# Check MCP server status
node server/mcpProxy.js

# Verify JIRA credentials
curl http://localhost:3001/api/health
```

#### Code Generation Errors
1. **Invalid Issue Format**: Ensure JIRA issue follows template
2. **Missing Dependencies**: Install required npm packages
3. **File Conflicts**: Check for existing files with same name
4. **Syntax Errors**: Validate generated code

#### Component Integration Issues
1. **Import Errors**: Check file paths and exports
2. **Style Conflicts**: Verify CSS class naming
3. **Type Errors**: Ensure TypeScript interfaces match
4. **Runtime Errors**: Check component props and state

### Debug Mode
Enable detailed logging:
```bash
# Start with debug logging
DEBUG=jira:* npm start

# Backend debug mode
DEBUG=mcp:* node server/mcpProxy.js
```

## 📈 Advanced Features

### Custom Component Templates
Create templates in `templates/` directory:
```javascript
// templates/FormComponent.template.js
export const FormComponentTemplate = (props) => `
import React, { useState } from 'react';
import './{{componentName}}.css';

const {{componentName}} = (${props.propsInterface}) => {
  // Generated state management
  ${props.stateLogic}
  
  return (
    <form className="{{kebabCaseName}}" onSubmit={handleSubmit}>
      ${props.formFields}
    </form>
  );
};

export default {{componentName}};
`;
```

### Hooks Integration
Automatically generate custom hooks:
```javascript
// Auto-generated: hooks/useUserProfile.js
import { useState, useEffect } from 'react';

export const useUserProfile = (userId) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Generated hook logic based on JIRA requirements
  
  return { user, loading, error, updateUser };
};
```

### State Management Integration
Support for various state management solutions:
- **React Context**: Automatic context provider generation
- **Redux Toolkit**: Slice and action generation
- **Zustand**: Store creation and hooks
- **Jotai**: Atom definitions

## 🎨 Styling Integration

### CSS Modules
```css
/* Auto-generated: UserProfile.module.css */
.container {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
}
```

### Styled Components
```javascript
// Auto-generated styled components
import styled from 'styled-components';

export const Container = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

export const Avatar = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
`;
```

## 📚 Best Practices

### JIRA Issue Writing
1. **Clear Requirements**: Specify exact UI behavior
2. **Acceptance Criteria**: List testable requirements
3. **Component Scope**: One component per issue
4. **Design References**: Include mockups or wireframes
5. **API Dependencies**: Specify required backend endpoints

### Code Quality
1. **TypeScript**: Use strict type checking
2. **Accessibility**: Follow WCAG 2.1 guidelines
3. **Performance**: Implement lazy loading and memoization
4. **Testing**: Maintain 80%+ test coverage
5. **Documentation**: Generate component documentation

### File Organization
1. **Single Responsibility**: One component per file
2. **Consistent Naming**: Follow established conventions
3. **Logical Grouping**: Group related components
4. **Import Order**: External, internal, relative imports
5. **Export Strategy**: Use consistent export patterns

## 🔄 Continuous Integration

### GitHub Actions Integration
```yaml
# .github/workflows/jira-ui-implementation.yml
name: JIRA UI Implementation
on:
  schedule:
    - cron: '*/15 * * * *' # Check every 15 minutes
  workflow_dispatch:

jobs:
  implement-ui-changes:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Fetch and implement JIRA issues
        run: npm run jira:implement
      - name: Run tests
        run: npm test
      - name: Create pull request
        uses: peter-evans/create-pull-request@v4
        with:
          title: 'Auto-generated UI components from JIRA'
          body: 'Implemented UI components based on JIRA issues'
```

## 📞 Support and Resources

### Getting Help
1. **Check Health Endpoint**: http://localhost:3001/api/health
2. **Review Logs**: Check browser console and terminal output
3. **Test MCP Connection**: Use test endpoints
4. **Validate JIRA Format**: Ensure issues follow template

### Useful Commands
```bash
# Health checks
npm run health:check

# Code generation test
npm run generate:test

# Component validation
npm run validate:components

# Clean generated files
npm run clean:generated
```

### Documentation Links
- [MCP Server Documentation](./mcp-server-docs.md)
- [Component Templates](./component-templates.md)
- [API Reference](./api-reference.md)
- [Troubleshooting Guide](./troubleshooting.md)

---

## 🎉 Quick Start Example

### 1. Create a JIRA Issue
```
Summary: [UI] WelcomeMessage - Display welcome message component

Description:
## Component Requirements
**Component Name**: WelcomeMessage
**Component Type**: Functional Component
**Location**: src/components/WelcomeMessage.jsx

## UI Specifications
### Layout
- Display welcome text with user name
- Show current date and time
- Include a "Get Started" button

### Styling
- Background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
- Text color: white
- Padding: 40px
- Border radius: 12px

## Acceptance Criteria
- [ ] Displays personalized welcome message
- [ ] Shows current date and time
- [ ] Button navigates to dashboard
- [ ] Responsive design works on mobile
```

### 2. Implement via UI
1. Open http://localhost:3000
2. Enter issue key (e.g., "UI-123")
3. Click "Fetch & Implement"
4. Review generated component
5. Apply changes

### 3. Verify Implementation
```bash
# Check generated files
ls src/components/WelcomeMessage/

# Run tests
npm test WelcomeMessage

# Start development server
npm start
```

Your JIRA-driven UI development system is now ready! 🚀
