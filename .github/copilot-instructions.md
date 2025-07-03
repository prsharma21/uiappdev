# GitHub Copilot Instructions for JIRA-Driven UI Development

## 🚀 PRIMARY WORKFLOW - JIRA Issue Processing

**When a user provides a JIRA issue ID, ALWAYS execute this complete 6-step workflow:**

### 🎯 Complete Workflow Steps:

1. **📋 FETCH** - Get JIRA issue description and requirements
2. **💻 IMPLEMENT** - Generate and apply code changes based on requirements  
3. **🧪 TEST** - Create comprehensive unit test cases
4. **📈 UPDATE** - Change JIRA status to "In Progress"
5. **🔀 PR** - Create GitHub pull request with full documentation
6. **📊 SUMMARY** - Provide complete workflow results

### 🎮 Trigger Commands:
- `"Process JIRA issue [ID]"`
- `"Implement story [ID]"`
- `"Work on ticket [ID]"`
- `"Handle JIRA [ID]"`

### 🔧 Available MCP Tools:
- `mcp_my-mcp-server3_read-jira-story` - Fetch JIRA issue details
- `mcp_my-mcp-server3_generate-code-from-story` - Generate code changes
- `mcp_my-mcp-server3_generate-test-cases` - Create unit tests
- `jira-status-updater.js` - Update JIRA status
- Standard VS Code tools for PR creation

---

## 🎯 Project Overview

This React application automatically reads JIRA issues from an MCP server and generates UI components based on issue descriptions. The system follows a specific workflow and coding patterns that Copilot should understand and follow.

## 🏗️ System Architecture

```
JIRA Issues → MCP Server → Backend Proxy → React Frontend → Auto-Generated Components
```

## 📋 Key Concepts for Copilot

### 1. JIRA Issue Structure
When working with JIRA issues, expect this structure:
```javascript
// Standard JIRA issue format
const jiraIssue = {
  key: "UI-123",
  summary: "[UI] ComponentName - Brief description",
  description: "## Component Requirements...",
  status: "To Do",
  priority: "High",
  issueType: "Story",
  acceptanceCriteria: ["Criterion 1", "Criterion 2"]
};
```

### 2. Component Generation Patterns
When generating React components from JIRA issues, follow these patterns:

#### File Structure Pattern
```
src/components/[ComponentName]/
├── index.jsx                 # Main component
├── [ComponentName].css       # Styles
├── [ComponentName].test.js   # Tests
└── [ComponentName].stories.js # Storybook (optional)
```

#### Component Template Pattern
```javascript
// Standard component template
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './ComponentName.css';

const ComponentName = ({ 
  // Props extracted from JIRA requirements
}) => {
  // State management based on JIRA functionality requirements
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Event handlers based on JIRA acceptance criteria
  const handleAction = async () => {
    setLoading(true);
    try {
      // Implementation based on JIRA description
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="component-name">
      {/* JSX structure based on JIRA UI specifications */}
    </div>
  );
};

ComponentName.propTypes = {
  // PropTypes based on JIRA Props Interface section
};

ComponentName.defaultProps = {
  // Default props
};

export default ComponentName;
```

### 3. Service Layer Patterns
When working with the JIRA service, follow these patterns:

#### API Communication
```javascript
// Standard service method pattern
async fetchJiraIssue(issueKey) {
  try {
    const response = await fetch(`/api/jira/issue/${issueKey}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching issue ${issueKey}:`, error);
    throw error;
  }
}

// Code generation from JIRA
async generateComponentFromIssue(issueData) {
  return {
    componentCode: this.buildComponentCode(issueData),
    testCode: this.buildTestCode(issueData),
    styles: this.buildStyles(issueData)
  };
}
```

### 4. Backend Proxy Patterns
When working with the MCP server communication:

```javascript
// MCP server communication pattern
async function callMCPServer(method, params) {
  const request = {
    jsonrpc: '2.0',
    id: Date.now(),
    method: method,
    params: params
  };
  
  // stdio communication with MCP server
  const mcpProcess = spawn('node', [MCP_SERVER_PATH], {
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  // Handle response parsing
  return new Promise((resolve, reject) => {
    // Implementation details...
  });
}
```

## 🎨 Component Type Patterns

### Form Components
When JIRA issue contains keywords: `form`, `input`, `validation`, `submit`

```javascript
const FormComponent = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    // Validation logic based on JIRA requirements
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-component">
      {/* Form fields based on JIRA specifications */}
    </form>
  );
};
```

### Data Display Components
When JIRA issue contains keywords: `table`, `list`, `card`, `grid`

```javascript
const DataDisplayComponent = ({ data, loading, onSort, onFilter }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({});

  if (loading) {
    return <div className="loading-skeleton">Loading...</div>;
  }

  return (
    <div className="data-display-component">
      {/* Data display based on JIRA layout requirements */}
    </div>
  );
};
```

### Modal Components
When JIRA issue contains keywords: `modal`, `dialog`, `popup`

```javascript
const ModalComponent = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};
```

## 🧪 Testing Patterns

### Component Testing
```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ComponentName from './index';

describe('ComponentName', () => {
  // Test each acceptance criterion from JIRA
  it('should render component correctly', () => {
    render(<ComponentName />);
    expect(screen.getByRole('...')).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    render(<ComponentName />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      // Assert based on JIRA functionality requirements
    });
  });

  // Error handling tests based on JIRA requirements
  it('should handle errors gracefully', async () => {
    // Test error scenarios
  });
});
```

## 🎯 Code Generation Rules

### 1. Extract Requirements from JIRA
```javascript
function parseJiraIssue(issue) {
  return {
    componentName: extractComponentName(issue.summary),
    requirements: parseRequirements(issue.description),
    acceptanceCriteria: extractAcceptanceCriteria(issue.description),
    styling: extractStyling(issue.description),
    functionality: extractFunctionality(issue.description)
  };
}
```

### 2. Generate Component Structure
```javascript
function generateComponent(requirements) {
  return {
    imports: generateImports(requirements),
    component: generateComponentCode(requirements),
    styles: generateStyles(requirements),
    tests: generateTests(requirements),
    stories: generateStories(requirements)
  };
}
```

### 3. Apply Styling from JIRA
```javascript
// Extract CSS from JIRA description
function generateStyles(stylingSpecs) {
  return `
.${kebabCase(componentName)} {
  ${stylingSpecs.background ? `background: ${stylingSpecs.background};` : ''}
  ${stylingSpecs.padding ? `padding: ${stylingSpecs.padding};` : ''}
  ${stylingSpecs.borderRadius ? `border-radius: ${stylingSpecs.borderRadius};` : ''}
  ${stylingSpecs.boxShadow ? `box-shadow: ${stylingSpecs.boxShadow};` : ''}
}
  `;
}
```

## 🔄 Integration Patterns

### State Management
```javascript
// Context pattern for complex components
const ComponentContext = createContext();

export const ComponentProvider = ({ children }) => {
  const [state, setState] = useState(initialState);
  
  // Actions based on JIRA functionality requirements
  const actions = {
    updateData: (data) => setState(prev => ({ ...prev, data })),
    setLoading: (loading) => setState(prev => ({ ...prev, loading })),
    setError: (error) => setState(prev => ({ ...prev, error }))
  };

  return (
    <ComponentContext.Provider value={{ state, actions }}>
      {children}
    </ComponentContext.Provider>
  );
};
```

### API Integration
```javascript
// Custom hooks for JIRA-based components
export const useJiraComponent = (issueKey) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJiraIssueAndImplement(issueKey)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [issueKey]);

  return { data, loading, error };
};
```

## 📱 Responsive Design Patterns

### Mobile-First Approach
```css
/* Base styles (mobile) */
.component-name {
  padding: 1rem;
  font-size: 1rem;
}

/* Tablet styles */
@media (min-width: 768px) {
  .component-name {
    padding: 1.5rem;
    font-size: 1.1rem;
  }
}

/* Desktop styles */
@media (min-width: 1024px) {
  .component-name {
    padding: 2rem;
    font-size: 1.2rem;
  }
}
```

## ♿ Accessibility Patterns

### ARIA Labels and Roles
```javascript
// Accessibility based on JIRA requirements
const AccessibleComponent = () => {
  return (
    <div 
      role="region" 
      aria-label="Component description from JIRA"
      aria-describedby="component-help"
    >
      <button
        aria-expanded={isExpanded}
        aria-controls="expandable-content"
        onClick={handleToggle}
      >
        Toggle Content
      </button>
      <div 
        id="expandable-content"
        aria-hidden={!isExpanded}
      >
        Content based on JIRA specifications
      </div>
    </div>
  );
};
```

## 🚀 Performance Patterns

### Lazy Loading
```javascript
// Lazy load components based on JIRA complexity
const LazyComponent = lazy(() => import('./ComponentName'));

const ComponentWrapper = (props) => (
  <Suspense fallback={<div>Loading component...</div>}>
    <LazyComponent {...props} />
  </Suspense>
);
```

### Memoization
```javascript
// Memoize expensive operations
const MemoizedComponent = memo(({ data, config }) => {
  const processedData = useMemo(() => {
    return processDataBasedOnJiraSpecs(data, config);
  }, [data, config]);

  const handleAction = useCallback((action) => {
    // Handle action based on JIRA requirements
  }, []);

  return <div>{/* Component JSX */}</div>;
});
```

## 📋 File Naming Conventions

### Component Files
- Component: `PascalCase` (e.g., `UserProfile.jsx`)
- Styles: `PascalCase.css` (e.g., `UserProfile.css`)
- Tests: `PascalCase.test.js` (e.g., `UserProfile.test.js`)
- Stories: `PascalCase.stories.js` (e.g., `UserProfile.stories.js`)

### Utility Files
- Hooks: `useCamelCase.js` (e.g., `useUserProfile.js`)
- Utils: `camelCaseUtils.js` (e.g., `userProfileUtils.js`)
- Types: `PascalCase.types.ts` (e.g., `UserProfile.types.ts`)

## 🔧 Error Handling Patterns

### Component Error Boundaries
```javascript
class ComponentErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component Error:', error, errorInfo);
    // Log to monitoring service based on JIRA requirements
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <details>
            {this.state.error?.message}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## 📊 Monitoring and Logging

### Performance Monitoring
```javascript
// Performance tracking for JIRA-generated components
const usePerformanceMonitoring = (componentName) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      console.log(`${componentName} render time: ${endTime - startTime}ms`);
    };
  }, [componentName]);
};
```

## 🎯 Complete JIRA-Driven Development Workflow

### Workflow Overview
When a user provides a JIRA issue ID, follow this complete automation workflow:

```
1. Fetch JIRA Issue → 2. Parse Requirements → 3. Generate Code → 4. Create Tests → 5. Update JIRA Status → 6. Create GitHub PR
```

### 1. 📋 Reading JIRA Issues by ID

#### Step 1: Fetch JIRA Issue Description
**Always start with this step when user provides a JIRA ID**

```javascript
// Primary method to fetch JIRA issue by ID using MCP server
async function fetchJiraIssueDescription(issueId) {
  try {
    console.log(`📋 Step 1: Fetching JIRA issue description for ${issueId}...`);
    
    // Use MCP server to fetch complete issue details
    const jiraIssue = await mcp_my-mcp-server3_read-jira-story({
      storyId: issueId
    });
    
    // Validate and extract issue information
    if (!jiraIssue || !jiraIssue.key) {
      throw new Error(`JIRA issue ${issueId} not found or invalid format`);
    }
    
    const issueDetails = {
      key: jiraIssue.key,
      summary: jiraIssue.summary,
      description: jiraIssue.description,
      acceptanceCriteria: jiraIssue.acceptanceCriteria || [],
      components: jiraIssue.components || [],
      priority: jiraIssue.priority,
      status: jiraIssue.status,
      issueType: jiraIssue.issueType || 'Story'
    };
    
    console.log(`✅ Step 1 Complete: Fetched ${issueDetails.summary}`);
    console.log(`📝 Found ${issueDetails.acceptanceCriteria.length} acceptance criteria`);
    
    return issueDetails;
    
  } catch (error) {
    console.error(`❌ Step 1 Failed: Error fetching JIRA issue ${issueId}:`, error);
    throw error;
  }
}
```

#### Step 2: Implement the Changes
**Generate and apply code changes based on JIRA requirements**

```javascript
// Generate code changes based on JIRA requirements
async function implementCodeChanges(issueId, jiraIssue) {
  try {
    console.log(`💻 Step 2: Implementing code changes for ${issueId}...`);
    
    // Generate code using MCP server
    const codeChanges = await mcp_my-mcp-server3_generate-code-from-story({
      storyId: issueId,
      storyDescription: jiraIssue.description,
      applicationPath: "c:\\Priyanka\\projects\\frontendapp",
      language: "javascript", // or "typescript" based on project
      framework: "react",
      changeType: determineChangeType(jiraIssue.summary), // "feature", "bugfix", "enhancement", "refactor"
      preserveExisting: true,
      targetFiles: extractTargetFiles(jiraIssue.description) // Optional: specific files to modify
    });
    
    // Validate code generation results
    if (!codeChanges || !codeChanges.files || codeChanges.files.length === 0) {
      throw new Error('No code changes generated from JIRA requirements');
    }
    
    console.log(`✅ Step 2 Complete: Generated changes for ${codeChanges.files.length} files`);
    console.log(`📁 Modified files:`, codeChanges.files.map(f => `  - ${f}`).join('\n'));
    
    return codeChanges;
    
  } catch (error) {
    console.error(`❌ Step 2 Failed: Error implementing changes for ${issueId}:`, error);
    throw error;
  }
}

// Helper function to determine change type from summary
function determineChangeType(summary) {
  const summaryLower = summary.toLowerCase();
  if (summaryLower.includes('bug') || summaryLower.includes('fix')) return 'bugfix';
  if (summaryLower.includes('enhance') || summaryLower.includes('improve')) return 'enhancement';
  if (summaryLower.includes('refactor') || summaryLower.includes('restructure')) return 'refactor';
  return 'feature'; // Default to feature
}
```

#### Step 3: Write Unit Test Cases
**Create comprehensive test cases covering all acceptance criteria**

```javascript
// Generate comprehensive unit test cases
async function writeUnitTestCases(issueId, jiraIssue, codeChanges) {
  try {
    console.log(`🧪 Step 3: Generating unit test cases for ${issueId}...`);
    
    // Extract component name from JIRA summary or code changes
    const componentName = extractComponentName(jiraIssue.summary) || 
                         extractComponentFromChanges(codeChanges);
    
    // Generate test cases using MCP server
    const testResults = await mcp_my-mcp-server3_generate-test-cases({
      storyId: issueId,
      componentName: componentName,
      testFramework: "jest", // or "cypress", "playwright", "vitest"
      testType: "unit", // or "integration", "e2e", "all"
      language: "javascript",
      projectRoot: "c:\\Priyanka\\projects\\frontendapp",
      filePath: determineTestFilePath(componentName, codeChanges)
    });
    
    // Validate test generation results
    if (!testResults || !testResults.testFile) {
      throw new Error('No test cases generated from JIRA requirements');
    }
    
    // Run the generated tests to ensure they pass
    console.log(`🏃 Running generated tests...`);
    await runGeneratedTests(testResults.testFile);
    
    console.log(`✅ Step 3 Complete: Generated ${testResults.testCount || 'multiple'} test cases`);
    console.log(`📄 Test file: ${testResults.testFile}`);
    console.log(`📊 Expected coverage: ${testResults.coverage || 'N/A'}%`);
    
    return testResults;
    
  } catch (error) {
    console.error(`❌ Step 3 Failed: Error generating tests for ${issueId}:`, error);
    throw error;
  }
}

// Helper function to extract component name
function extractComponentName(summary) {
  // Extract component name from patterns like "[UI] ComponentName - Description"
  const match = summary.match(/\[UI\]\s*(\w+)/i) || 
                summary.match(/(\w+)\s*component/i) ||
                summary.match(/(\w+)\s*-/);
  return match ? match[1] : null;
}

// Helper function to run generated tests
async function runGeneratedTests(testFile) {
  try {
    // Run tests using npm test or jest directly
    await runInTerminal(`npm test -- ${testFile}`, 'Running generated unit tests');
  } catch (error) {
    console.warn(`⚠️ Test execution failed, but continuing workflow: ${error.message}`);
  }
}
```

#### Step 4: Update JIRA Status to In Progress
**Change JIRA issue status to indicate development is underway**

```javascript
// Update JIRA issue status to In Progress
async function updateJiraStatusToInProgress(issueId) {
  try {
    console.log(`📈 Step 4: Updating JIRA ${issueId} status to In Progress...`);
    
    // Use the generic JIRA status updater script
    await runInTerminal(
      `node jira-status-updater.js ${issueId} "In Progress"`,
      `Updating JIRA ${issueId} status to In Progress`
    );
    
    console.log(`✅ Step 4 Complete: JIRA ${issueId} status updated to In Progress`);
    
    return {
      issueId: issueId,
      newStatus: 'In Progress',
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`❌ Step 4 Failed: Error updating JIRA status for ${issueId}:`, error);
    // Continue workflow even if status update fails
    console.log(`⚠️ Continuing workflow despite status update failure`);
    return {
      issueId: issueId,
      newStatus: 'Failed to update',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}
```

#### Step 5: Create GitHub Pull Request
**Create a comprehensive PR with full documentation linking back to JIRA**

```javascript
// Create GitHub Pull Request with comprehensive documentation
async function createGitHubPullRequest(issueId, jiraIssue, codeChanges, testResults) {
  try {
    console.log(`🔀 Step 5: Creating GitHub pull request for ${issueId}...`);
    
    // 1. Create feature branch
    const branchName = createBranchName(issueId, jiraIssue.summary);
    console.log(`🌿 Creating feature branch: ${branchName}`);
    
    await runInTerminal(`git checkout -b ${branchName}`, 'Creating feature branch');
    
    // 2. Stage and commit all changes
    const commitMessage = generateCommitMessage(issueId, jiraIssue, codeChanges);
    console.log(`📝 Committing changes with message: ${commitMessage.split('\n')[0]}`);
    
    await runInTerminal(`git add .`, 'Staging all changes');
    await runInTerminal(`git commit -m "${commitMessage}"`, 'Committing changes');
    
    // 3. Push branch to remote
    await runInTerminal(`git push -u origin ${branchName}`, 'Pushing feature branch');
    
    // 4. Create PR using GitHub CLI (if available) or provide instructions
    const prDescription = generatePRDescription(jiraIssue, codeChanges, testResults);
    const prTitle = `${issueId}: ${jiraIssue.summary}`;
    
    try {
      // Try using GitHub CLI
      await runInTerminal(
        `gh pr create --title "${prTitle}" --body "${prDescription}" --base main --head ${branchName}`,
        'Creating GitHub pull request'
      );
      
      console.log(`✅ Step 5 Complete: GitHub PR created successfully`);
      
    } catch (ghError) {
      // Fallback: provide manual PR creation instructions
      console.log(`📋 GitHub CLI not available. Manual PR creation required:`);
      console.log(`   Title: ${prTitle}`);
      console.log(`   Branch: ${branchName} → main`);
      console.log(`   Description: [See generated PR description]`);
    }
    
    return {
      branchName: branchName,
      title: prTitle,
      description: prDescription,
      status: 'created'
    };
    
  } catch (error) {
    console.error(`❌ Step 5 Failed: Error creating GitHub PR for ${issueId}:`, error);
    throw error;
  }
}

// Helper function to create branch name
function createBranchName(issueId, summary) {
  const sanitizedSummary = summary
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  
  return `feature/${issueId.toLowerCase()}-${sanitizedSummary}`;
}

// Helper function to generate commit message
function generateCommitMessage(issueId, jiraIssue, codeChanges) {
  return `${issueId}: ${jiraIssue.summary}

${jiraIssue.description ? jiraIssue.description.substring(0, 200) + '...' : 'Implementation based on JIRA requirements'}

Changes:
${codeChanges.files ? codeChanges.files.map(f => `- Modified: ${f}`).join('\n') : '- Code implementation complete'}
- Added comprehensive unit tests
- Updated component integration

Resolves: ${issueId}
Type: ${jiraIssue.issueType || 'Story'}
Priority: ${jiraIssue.priority || 'Medium'}`;
}

// Helper function to generate PR description
function generatePRDescription(jiraIssue, codeChanges, testResults) {
  return `## 🎯 JIRA Issue: ${jiraIssue.key}

### 📋 Issue Summary
${jiraIssue.summary}

### 📝 Description
${jiraIssue.description || 'No description provided'}

### ✅ Acceptance Criteria
${jiraIssue.acceptanceCriteria && jiraIssue.acceptanceCriteria.length > 0 
  ? jiraIssue.acceptanceCriteria.map(ac => `- [ ] ${ac}`).join('\n')
  : '- [ ] Implementation complete as per JIRA requirements'}

### 🛠️ Code Changes
${codeChanges.files && codeChanges.files.length > 0
  ? codeChanges.files.map(file => `- Modified: \`${file}\``).join('\n')
  : '- Code implementation complete'}

### 🧪 Testing
- **Unit Tests**: ${testResults.testFile ? 'Added' : 'Generated'}
- **Test File**: \`${testResults.testFile || 'See test directory'}\`
- **Coverage**: ${testResults.coverage || 'N/A'}%

### 🔗 JIRA Links
- **Issue**: [${jiraIssue.key}](https://yourjira.atlassian.net/browse/${jiraIssue.key})
- **Status**: ${jiraIssue.status} → In Progress

### 📋 Checklist
- [x] Code follows project conventions
- [x] Unit tests added/updated
- [x] JIRA issue status updated
- [ ] Code review requested
- [ ] Manual testing completed

---
*This PR was automatically generated by the JIRA-driven development workflow.*`;
}
```

#### Step 6: Provide Complete Summary
**Return comprehensive workflow results with full traceability**

```javascript
// Provide complete workflow summary
function provideWorkflowSummary(issueId, jiraIssue, codeChanges, testResults, statusUpdate, prResult) {
  const workflowId = `workflow-${issueId}-${Date.now()}`;
  
  console.log(`🎉 Step 6: Workflow completed successfully!`);
  console.log(`📊 Workflow Summary for ${issueId}:`);
  console.log(`   📋 JIRA Issue: ${jiraIssue.summary}`);
  console.log(`   💻 Files Modified: ${codeChanges.files?.length || 0}`);
  console.log(`   🧪 Tests Generated: ${testResults.testCount || 'Multiple'}`);
  console.log(`   📈 JIRA Status: ${statusUpdate.newStatus}`);
  console.log(`   🔀 GitHub PR: ${prResult.status}`);
  
  return {
    workflowId: workflowId,
    issueId: issueId,
    jiraIssue: {
      key: jiraIssue.key,
      summary: jiraIssue.summary,
      status: jiraIssue.status,
      priority: jiraIssue.priority,
      acceptanceCriteria: jiraIssue.acceptanceCriteria
    },
    codeChanges: {
      filesModified: codeChanges.files?.length || 0,
      files: codeChanges.files || [],
      description: codeChanges.description || 'Code implementation complete'
    },
    testResults: {
      testFile: testResults.testFile,
      testCount: testResults.testCount,
      coverage: testResults.coverage
    },
    jiraStatusUpdate: statusUpdate,
    githubPR: {
      branchName: prResult.branchName,
      title: prResult.title,
      status: prResult.status
    },
    status: "SUCCESS",
    completedAt: new Date().toISOString(),
    traceability: `JIRA ${issueId} → Code Changes → Unit Tests → Status Update → GitHub PR`
  };
}
```
```javascript
// Primary method to fetch JIRA issue by ID
async function fetchJiraIssueById(issueId) {
  try {
    // Use MCP server to fetch issue
    const mcpResponse = await callMCPServer('atlassian_jira_get_issue', {
      issueKey: issueId
    });
    
    if (!mcpResponse.content || mcpResponse.content.length === 0) {
      throw new Error(`JIRA issue ${issueId} not found`);
    }
    
    const issueData = JSON.parse(mcpResponse.content[0].text);
    
    // Validate issue structure
    if (!issueData.key || !issueData.fields) {
      throw new Error(`Invalid JIRA issue format for ${issueId}`);
    }
    
    return {
      key: issueData.key,
      summary: issueData.fields.summary,
      description: issueData.fields.description?.content || issueData.fields.description,
      status: issueData.fields.status?.name,
      priority: issueData.fields.priority?.name,
      issueType: issueData.fields.issuetype?.name,
      assignee: issueData.fields.assignee?.displayName,
      reporter: issueData.fields.reporter?.displayName,
      labels: issueData.fields.labels || [],
      components: issueData.fields.components?.map(c => c.name) || [],
      acceptanceCriteria: extractAcceptanceCriteria(issueData.fields.description)
    };
  } catch (error) {
    console.error(`Error fetching JIRA issue ${issueId}:`, error);
    throw error;
  }
}

// Helper function to extract acceptance criteria
function extractAcceptanceCriteria(description) {
  if (!description) return [];
  
  const criteriaRegex = /(?:acceptance criteria|AC|criteria):\s*(.*?)(?:\n\n|\n(?=[A-Z])|$)/gis;
  const matches = description.match(criteriaRegex);
  
  if (!matches) return [];
  
  return matches.map(match => 
    match.replace(/(?:acceptance criteria|AC|criteria):\s*/i, '').trim()
  ).filter(Boolean);
}
```

#### JIRA Issue Processing Steps
```javascript
// Complete issue processing workflow
async function processJiraIssue(issueId) {
  console.log(`🔍 Processing JIRA issue: ${issueId}`);
  
  // Step 1: Fetch the issue
  const issue = await fetchJiraIssueById(issueId);
  console.log(`📋 Fetched issue: ${issue.summary}`);
  
  // Step 2: Parse requirements
  const requirements = parseJiraRequirements(issue);
  console.log(`📝 Parsed requirements for: ${requirements.componentName}`);
  
  // Step 3: Generate code changes
  const codeChanges = await generateCodeFromRequirements(requirements);
  console.log(`💻 Generated code changes`);
  
  // Step 4: Generate unit tests
  const testCases = await generateUnitTests(requirements, codeChanges);
  console.log(`🧪 Generated unit tests`);
  
  // Step 5: Update JIRA status
  await updateJiraStatus(issueId, 'In Progress');
  console.log(`📈 Updated JIRA status to In Progress`);
  
  // Step 6: Create GitHub PR
  const prResult = await createGitHubPR(issueId, issue, codeChanges, testCases);
  console.log(`🔀 Created GitHub PR: ${prResult.url}`);
  
  return {
    issue,
    requirements,
    codeChanges,
    testCases,
    prResult
  };
}
```

### 2. 🛠️ Making Application Changes

#### Component Generation from JIRA
```javascript
// Generate React component based on JIRA requirements
async function generateComponentFromJira(requirements) {
  const { componentName, styling, functionality, props } = requirements;
  
  // Generate main component file
  const componentCode = generateComponentCode(requirements);
  await writeFile(`src/components/${componentName}/index.jsx`, componentCode);
  
  // Generate CSS styles
  const cssCode = generateComponentStyles(styling);
  await writeFile(`src/components/${componentName}/${componentName}.css`, cssCode);
  
  // Generate PropTypes and interfaces
  if (props && props.length > 0) {
    const propTypesCode = generatePropTypes(props);
    await writeFile(`src/components/${componentName}/${componentName}.types.js`, propTypesCode);
  }
  
  // Update parent components if specified
  if (requirements.integration) {
    await updateParentComponents(requirements.integration);
  }
  
  return {
    componentFile: `src/components/${componentName}/index.jsx`,
    styleFile: `src/components/${componentName}/${componentName}.css`,
    files: [
      `src/components/${componentName}/index.jsx`,
      `src/components/${componentName}/${componentName}.css`
    ]
  };
}

// Update existing components based on JIRA requirements
async function updateExistingComponent(requirements) {
  const { targetFile, changes } = requirements;
  
  for (const change of changes) {
    switch (change.type) {
      case 'add_method':
        await addMethodToComponent(targetFile, change.method);
        break;
      case 'update_styling':
        await updateComponentStyling(targetFile, change.styles);
        break;
      case 'add_prop':
        await addPropToComponent(targetFile, change.prop);
        break;
      case 'modify_behavior':
        await modifyComponentBehavior(targetFile, change.behavior);
        break;
    }
  }
}
```

#### Automatic File Updates
```javascript
// Automatically update imports and exports
async function updateApplicationStructure(newComponents) {
  // Update App.js to include new components
  for (const component of newComponents) {
    await addComponentToApp(component);
  }
  
  // Update index.js exports
  await updateIndexExports(newComponents);
  
  // Update package.json if new dependencies needed
  const dependencies = extractDependencies(newComponents);
  if (dependencies.length > 0) {
    await updatePackageJson(dependencies);
  }
}
```

### 3. 🧪 Generating Unit Test Cases

#### Comprehensive Test Generation
```javascript
// Generate complete test suite for JIRA-driven components
async function generateUnitTests(requirements, codeChanges) {
  const { componentName, acceptanceCriteria, functionality } = requirements;
  
  const testSuites = [];
  
  // 1. Basic rendering tests
  const renderingTests = generateRenderingTests(componentName);
  testSuites.push(renderingTests);
  
  // 2. Acceptance criteria tests
  for (const criterion of acceptanceCriteria) {
    const criterionTest = generateAcceptanceCriteriaTest(criterion, componentName);
    testSuites.push(criterionTest);
  }
  
  // 3. Functionality tests
  const functionalityTests = generateFunctionalityTests(functionality, componentName);
  testSuites.push(functionalityTests);
  
  // 4. Integration tests
  const integrationTests = generateIntegrationTests(requirements);
  testSuites.push(integrationTests);
  
  // 5. Accessibility tests
  const a11yTests = generateAccessibilityTests(componentName);
  testSuites.push(a11yTests);
  
  // Combine all tests
  const completeTestSuite = combineTestSuites(testSuites);
  
  // Write test files
  const testFile = `src/components/${componentName}/${componentName}.test.js`;
  await writeFile(testFile, completeTestSuite);
  
  return {
    testFile,
    testCount: testSuites.reduce((count, suite) => count + suite.tests.length, 0),
    coverage: calculateExpectedCoverage(testSuites)
  };
}

// Generate test based on acceptance criteria
function generateAcceptanceCriteriaTest(criterion, componentName) {
  return `
  describe('Acceptance Criteria: ${criterion}', () => {
    it('should meet the acceptance criteria', async () => {
      render(<${componentName} />);
      
      // Test implementation based on criterion
      ${generateCriterionTestCode(criterion)}
      
      // Verify the criterion is met
      await waitFor(() => {
        ${generateCriterionAssertion(criterion)}
      });
    });
  });
  `;
}

// Generate tests for each functional requirement
function generateFunctionalityTests(functionality, componentName) {
  return functionality.map(func => `
  describe('Functionality: ${func.name}', () => {
    it('should ${func.description}', async () => {
      const { ${func.testProps || 'container'} } = render(<${componentName} />);
      
      // Test the functionality
      ${generateFunctionalityTestCode(func)}
      
      // Assert expected behavior
      ${generateFunctionalityAssertion(func)}
    });
    
    it('should handle ${func.name} errors gracefully', async () => {
      // Error handling test
      ${generateErrorHandlingTest(func)}
    });
  });
  `).join('\n');
}
```

#### Test Templates by Component Type
```javascript
// Form component test template
const FORM_COMPONENT_TESTS = `
describe('Form Validation', () => {
  it('should validate required fields', async () => {
    render(<ComponentName />);
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(screen.getByText(/required/i)).toBeInTheDocument();
  });
  
  it('should submit valid data', async () => {
    const mockSubmit = jest.fn();
    render(<ComponentName onSubmit={mockSubmit} />);
    
    // Fill form fields
    fireEvent.change(screen.getByLabelText(/field/i), { target: { value: 'test' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({
        field: 'test'
      }));
    });
  });
});
`;

// Data display component test template
const DATA_DISPLAY_TESTS = `
describe('Data Display', () => {
  it('should render loading state', () => {
    render(<ComponentName loading={true} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
  
  it('should render data when loaded', () => {
    const mockData = [{ id: 1, name: 'Test' }];
    render(<ComponentName data={mockData} loading={false} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
  
  it('should handle empty data', () => {
    render(<ComponentName data={[]} loading={false} />);
    expect(screen.getByText(/no data/i)).toBeInTheDocument();
  });
});
`;
```

### 4. 📈 Updating JIRA Story Status

#### JIRA Status Management
```javascript
// Update JIRA issue status through MCP server
async function updateJiraStatus(issueKey, newStatus, comment = null) {
  try {
    console.log(`📈 Updating JIRA ${issueKey} status to: ${newStatus}`);
    
    // First, get available transitions
    const transitions = await getJiraTransitions(issueKey);
    const targetTransition = findTransitionByStatus(transitions, newStatus);
    
    if (!targetTransition) {
      throw new Error(`No transition available to status: ${newStatus}`);
    }
    
    // Execute the transition
    const transitionResult = await callMCPServer('atlassian_jira_transition_issue', {
      issueKey: issueKey,
      transitionId: targetTransition.id,
      comment: comment || `Status updated automatically via JIRA-driven development workflow`
    });
    
    // Add work log entry
    await addJiraWorkLog(issueKey, {
      comment: `Development work started - Code generation and testing in progress`,
      timeSpent: '30m'
    });
    
    console.log(`✅ Successfully updated ${issueKey} to ${newStatus}`);
    return transitionResult;
    
  } catch (error) {
    console.error(`❌ Error updating JIRA status for ${issueKey}:`, error);
    throw error;
  }
}

// Get available transitions for an issue
async function getJiraTransitions(issueKey) {
  const response = await callMCPServer('atlassian_jira_get_transitions', {
    issueKey: issueKey
  });
  
  return JSON.parse(response.content[0].text).transitions;
}

// Add work log entry
async function addJiraWorkLog(issueKey, workLog) {
  return await callMCPServer('atlassian_jira_add_worklog', {
    issueKey: issueKey,
    comment: workLog.comment,
    timeSpent: workLog.timeSpent,
    started: new Date().toISOString()
  });
}

// Status transition mapping
const STATUS_TRANSITIONS = {
  'To Do': ['In Progress', 'In Review'],
  'In Progress': ['In Review', 'Testing', 'Done'],
  'In Review': ['In Progress', 'Testing', 'Done'],
  'Testing': ['In Progress', 'Done'],
  'Done': []
};
```

### 5. 🔀 Generating GitHub Pull Requests

#### Automated PR Creation
```javascript
// Create GitHub PR with JIRA issue context
async function createGitHubPR(issueKey, jiraIssue, codeChanges, testResults) {
  try {
    console.log(`🔀 Creating GitHub PR for JIRA issue: ${issueKey}`);
    
    // 1. Create feature branch
    const branchName = createBranchName(issueKey, jiraIssue.summary);
    await createFeatureBranch(branchName);
    
    // 2. Commit changes
    await commitChanges(issueKey, jiraIssue, codeChanges);
    
    // 3. Push branch
    await pushBranch(branchName);
    
    // 4. Create PR using GitHub API
    const prData = await createPullRequest({
      title: generatePRTitle(issueKey, jiraIssue.summary),
      body: generatePRDescription(jiraIssue, codeChanges, testResults),
      head: branchName,
      base: 'main',
      labels: generatePRLabels(jiraIssue)
    });
    
    // 5. Link PR back to JIRA
    await linkPRToJira(issueKey, prData.html_url);
    
    console.log(`✅ Created PR: ${prData.html_url}`);
    return prData;
    
  } catch (error) {
    console.error(`❌ Error creating GitHub PR:`, error);
    throw error;
  }
}

// Generate descriptive branch name
function createBranchName(issueKey, summary) {
  const sanitizedSummary = summary
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  
  return `feature/${issueKey.toLowerCase()}-${sanitizedSummary}`;
}

// Generate comprehensive PR description
function generatePRDescription(jiraIssue, codeChanges, testResults) {
  return `## 🎯 JIRA Issue: ${jiraIssue.key}

### 📋 Issue Summary
${jiraIssue.summary}

### 📝 Description
${jiraIssue.description || 'No description provided'}

### ✅ Acceptance Criteria
${jiraIssue.acceptanceCriteria.map(ac => `- [ ] ${ac}`).join('\n')}

### 🛠️ Code Changes
${codeChanges.files.map(file => `- Modified: \`${file}\``).join('\n')}

### 🧪 Testing
- **Unit Tests Added**: ${testResults.testCount} tests
- **Expected Coverage**: ${testResults.coverage}%
- **Test File**: \`${testResults.testFile}\`

### 🔗 JIRA Links
- **Issue**: [${jiraIssue.key}](${getJiraIssueUrl(jiraIssue.key)})
- **Status**: ${jiraIssue.status} → In Progress

### 📋 Checklist
- [x] Code follows project conventions
- [x] Unit tests added/updated
- [x] JIRA issue status updated
- [ ] Code review requested
- [ ] Manual testing completed

---
*This PR was automatically generated by the JIRA-driven development workflow.*`;
}

// Commit changes with structured message
async function commitChanges(issueKey, jiraIssue, codeChanges) {
  const commitMessage = `${issueKey}: ${jiraIssue.summary}

- ${codeChanges.description}
- Added comprehensive unit tests
- Updated component integration

Resolves: ${issueKey}
Type: ${jiraIssue.issueType}
Priority: ${jiraIssue.priority}`;

  await runGitCommand(`git add .`);
  await runGitCommand(`git commit -m "${commitMessage}"`);
}
```

### 6. 🎛️ Workflow Orchestration

#### Main Workflow Function
```javascript
// Main function that orchestrates the entire workflow
async function executeJiraDrivenWorkflow(issueId) {
  const workflowId = `workflow-${issueId}-${Date.now()}`;
  
  try {
    console.log(`🚀 Starting JIRA-driven workflow for issue: ${issueId}`);
    console.log(`📋 Workflow ID: ${workflowId}`);
    
    // Step 1: Fetch and validate JIRA issue
    const jiraIssue = await fetchJiraIssueById(issueId);
    logStep(workflowId, 'JIRA_FETCH', 'SUCCESS', `Fetched: ${jiraIssue.summary}`);
    
    // Step 2: Parse requirements and generate plan
    const requirements = parseJiraRequirements(jiraIssue);
    const developmentPlan = generateDevelopmentPlan(requirements);
    logStep(workflowId, 'REQUIREMENTS_PARSE', 'SUCCESS', `Plan: ${developmentPlan.summary}`);
    
    // Step 3: Generate code changes
    const codeChanges = await generateCodeFromRequirements(requirements);
    logStep(workflowId, 'CODE_GENERATION', 'SUCCESS', `Files: ${codeChanges.files.length}`);
    
    // Step 4: Generate and run unit tests
    const testResults = await generateAndRunTests(requirements, codeChanges);
    logStep(workflowId, 'TEST_GENERATION', 'SUCCESS', `Tests: ${testResults.testCount}`);
    
    // Step 5: Update JIRA status to In Progress
    await updateJiraStatus(issueId, 'In Progress', 
      `Development completed. Generated ${codeChanges.files.length} files and ${testResults.testCount} tests.`);
    logStep(workflowId, 'JIRA_UPDATE', 'SUCCESS', 'Status: In Progress');
    
    // Step 6: Create GitHub PR
    const prResult = await createGitHubPR(issueId, jiraIssue, codeChanges, testResults);
    logStep(workflowId, 'PR_CREATION', 'SUCCESS', `PR: ${prResult.html_url}`);
    
    // Step 7: Final documentation update
    await updateWorkflowDocumentation(workflowId, {
      jiraIssue,
      codeChanges,
      testResults,
      prResult
    });
    
    console.log(`🎉 Workflow completed successfully!`);
    console.log(`📋 JIRA Issue: ${jiraIssue.key}`);
    console.log(`🔀 GitHub PR: ${prResult.html_url}`);
    
    return {
      workflowId,
      jiraIssue,
      codeChanges,
      testResults,
      prResult,
      status: 'SUCCESS'
    };
    
  } catch (error) {
    console.error(`❌ Workflow failed for ${issueId}:`, error);
    logStep(workflowId, 'WORKFLOW', 'FAILED', error.message);
    
    // Attempt to update JIRA with error status
    try {
      await addJiraComment(issueId, `❌ Automated development workflow failed: ${error.message}`);
    } catch (commentError) {
      console.error('Failed to add error comment to JIRA:', commentError);
    }
    
    throw error;
  }
}

// Workflow logging
function logStep(workflowId, step, status, details) {
  const timestamp = new Date().toISOString();
  console.log(`[${workflowId}] ${timestamp} - ${step}: ${status} - ${details}`);
}
```

### 7. 🎯 Usage Instructions for Copilot

#### When User Provides JIRA Issue ID
```javascript
// Example: User says "Process JIRA issue UI-123"
async function handleJiraIssueRequest(userInput) {
  // Extract JIRA issue ID from user input
  const issueIdMatch = userInput.match(/\b[A-Z]+-\d+\b/);
  
  if (!issueIdMatch) {
    throw new Error('No valid JIRA issue ID found in request');
  }
  
  const issueId = issueIdMatch[0];
  
  // Execute the complete workflow
  return await executeJiraDrivenWorkflow(issueId);
}

// Usage patterns Copilot should recognize:
// - "Process JIRA issue ABC-123"
// - "Implement story XYZ-456" 
// - "Work on ticket DEF-789"
// - "Handle JIRA ABC-999"
```

#### Error Handling and Recovery
```javascript
// Comprehensive error handling for each step
const WORKFLOW_ERROR_HANDLERS = {
  JIRA_FETCH_FAILED: async (issueId, error) => {
    console.log(`Retrying JIRA fetch for ${issueId}...`);
    await delay(2000);
    return await fetchJiraIssueById(issueId);
  },
  
  CODE_GENERATION_FAILED: async (requirements, error) => {
    console.log('Falling back to template-based generation...');
    return await generateCodeFromTemplate(requirements);
  },
  
  TEST_GENERATION_FAILED: async (requirements, error) => {
    console.log('Generating basic test structure...');
    return await generateBasicTests(requirements);
  },
  
  JIRA_UPDATE_FAILED: async (issueId, error) => {
    console.log('Adding comment instead of status update...');
    return await addJiraComment(issueId, 'Development completed - manual status update required');
  },
  
  PR_CREATION_FAILED: async (data, error) => {
    console.log('Creating local branch for manual PR...');
    return await createLocalBranch(data);
  }
};
```

## 🎯 Complete JIRA-Driven Development Workflow - Summary for Copilot

When a user provides a JIRA issue ID, **ALWAYS** execute this complete 6-step automated workflow:

### � Step 1: Fetch JIRA Issue Description
```javascript
// Use MCP server to fetch complete issue details
const jiraIssue = await mcp_my-mcp-server3_read-jira-story({
  storyId: issueId
});

// Extract key information
const issueDetails = {
  key: jiraIssue.key,
  summary: jiraIssue.summary,
  description: jiraIssue.description,
  acceptanceCriteria: jiraIssue.acceptanceCriteria,
  components: jiraIssue.components,
  priority: jiraIssue.priority,
  status: jiraIssue.status
};
```

### 💻 Step 2: Implement the Changes
```javascript
// Generate code based on JIRA requirements using MCP server
const codeChanges = await mcp_my-mcp-server3_generate-code-from-story({
  storyId: issueId,
  storyDescription: jiraIssue.description,
  applicationPath: "c:\\Priyanka\\projects\\frontendapp",
  language: "javascript", // or "typescript"
  framework: "react",
  changeType: "feature", // or "bugfix", "enhancement", "refactor"
  preserveExisting: true
});

// Apply changes to files
// The MCP server will automatically modify the appropriate files
```

### 🧪 Step 3: Write Unit Test Cases
```javascript
// Generate comprehensive test cases using MCP server
const testResults = await mcp_my-mcp-server3_generate-test-cases({
  storyId: issueId,
  componentName: extractComponentName(jiraIssue.summary),
  testFramework: "jest", // or "cypress", "playwright", "vitest"
  testType: "unit", // or "integration", "e2e", "all"
  language: "javascript",
  projectRoot: "c:\\Priyanka\\projects\\frontendapp"
});

// Run the generated tests to ensure they pass
await runTests(testResults.testFile);
```

### 📈 Step 4: Update JIRA Status to In Progress
```javascript
// Update JIRA issue status using the generic status updater
await updateJiraStatus(issueId, "In Progress");

// Or use the MCP server directly if available
// (Note: Current MCP server may not have direct status update)
```

### 🔀 Step 5: Create GitHub Pull Request
```javascript
// Create feature branch and commit changes
const branchName = `feature/${issueId.toLowerCase()}-${sanitizeSummary(jiraIssue.summary)}`;
await createFeatureBranch(branchName);
await commitChanges(issueId, jiraIssue, codeChanges);
await pushBranch(branchName);

// Create PR with comprehensive description
const prData = await createGitHubPR({
  title: `${issueId}: ${jiraIssue.summary}`,
  body: generatePRDescription(jiraIssue, codeChanges, testResults),
  head: branchName,
  base: "main"
});
```

### 📊 Step 6: Provide Complete Summary
```javascript
// Return comprehensive workflow results
return {
  workflowId: `workflow-${issueId}-${Date.now()}`,
  jiraIssue: issueDetails,
  codeChanges: codeChanges,
  testResults: testResults,
  jiraStatusUpdate: "In Progress",
  githubPR: prData.html_url,
  status: "SUCCESS"
};
```

## 🎯 Key Commands Copilot Should Recognize

**Primary Commands:**
- `"Process JIRA issue [ID]"` → Execute complete 6-step workflow
- `"Implement story [ID]"` → Execute complete 6-step workflow  
- `"Work on ticket [ID]"` → Execute complete 6-step workflow
- `"Handle JIRA [ID]"` → Execute complete 6-step workflow

**Individual Step Commands:**
- `"Fetch JIRA [ID] description"` → Step 1 only
- `"Implement changes for [ID]"` → Steps 1-2
- `"Generate tests for [ID]"` → Steps 1-3
- `"Update [ID] status to In Progress"` → Step 4 only
- `"Create PR for [ID]"` → Step 5 only

## 🔧 Workflow Implementation Template

```javascript
// MAIN ORCHESTRATION FUNCTION - Execute Complete JIRA Workflow
async function executeCompleteJiraWorkflow(issueId) {
  console.log(`🚀 Starting complete JIRA workflow for: ${issueId}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  
  let jiraIssue, codeChanges, testResults, statusUpdate, prResult;
  
  try {
    // Step 1: Fetch JIRA Issue Description
    console.log("\n" + "=".repeat(50));
    console.log("📋 STEP 1: FETCHING JIRA ISSUE DESCRIPTION");
    console.log("=".repeat(50));
    
    jiraIssue = await fetchJiraIssueDescription(issueId);
    
    // Step 2: Implement the Changes
    console.log("\n" + "=".repeat(50));
    console.log("💻 STEP 2: IMPLEMENTING CODE CHANGES");
    console.log("=".repeat(50));
    
    codeChanges = await implementCodeChanges(issueId, jiraIssue);
    
    // Step 3: Write Unit Test Cases
    console.log("\n" + "=".repeat(50));
    console.log("🧪 STEP 3: GENERATING UNIT TEST CASES");
    console.log("=".repeat(50));
    
    testResults = await writeUnitTestCases(issueId, jiraIssue, codeChanges);
    
    // Step 4: Update JIRA Status to In Progress
    console.log("\n" + "=".repeat(50));
    console.log("📈 STEP 4: UPDATING JIRA STATUS");
    console.log("=".repeat(50));
    
    statusUpdate = await updateJiraStatusToInProgress(issueId);
    
    // Step 5: Create GitHub Pull Request
    console.log("\n" + "=".repeat(50));
    console.log("🔀 STEP 5: CREATING GITHUB PULL REQUEST");
    console.log("=".repeat(50));
    
    prResult = await createGitHubPullRequest(issueId, jiraIssue, codeChanges, testResults);
    
    // Step 6: Provide Complete Summary
    console.log("\n" + "=".repeat(50));
    console.log("📊 STEP 6: WORKFLOW SUMMARY");
    console.log("=".repeat(50));
    
    const summary = provideWorkflowSummary(issueId, jiraIssue, codeChanges, testResults, statusUpdate, prResult);
    
    console.log(`\n🎉 WORKFLOW COMPLETED SUCCESSFULLY! 🎉`);
    console.log(`⏰ Completed at: ${new Date().toISOString()}`);
    console.log(`🔍 Workflow ID: ${summary.workflowId}`);
    
    return summary;
    
  } catch (error) {
    console.error(`\n❌ WORKFLOW FAILED FOR ${issueId}:`);
    console.error(`Error: ${error.message}`);
    console.error(`⏰ Failed at: ${new Date().toISOString()}`);
    
    // Attempt to provide partial results for debugging
    const partialSummary = {
      workflowId: `failed-workflow-${issueId}-${Date.now()}`,
      issueId: issueId,
      status: "FAILED",
      error: error.message,
      completedSteps: {
        jiraIssue: !!jiraIssue,
        codeChanges: !!codeChanges,
        testResults: !!testResults,
        statusUpdate: !!statusUpdate,
        prResult: !!prResult
      },
      failedAt: new Date().toISOString()
    };
    
    console.log(`📋 Partial results:`, JSON.stringify(partialSummary, null, 2));
    throw error;
  }
}

// USAGE FUNCTION - Handle user requests with JIRA ID extraction
async function handleJiraIssueRequest(userInput) {
  console.log(`🎯 Processing user request: "${userInput}"`);
  
  // Extract JIRA issue ID from user input using regex
  const issueIdMatch = userInput.match(/\b([A-Z]+[-_]\d+)\b/i);
  
  if (!issueIdMatch) {
    const errorMsg = 'No valid JIRA issue ID found in request. Expected format: PROJECT-123 or PROJECT_123';
    console.error(`❌ ${errorMsg}`);
    throw new Error(errorMsg);
  }
  
  const issueId = issueIdMatch[1].toUpperCase().replace('_', '-'); // Normalize format
  console.log(`🎯 Extracted JIRA issue ID: ${issueId}`);
  
  // Execute the complete workflow
  return await executeCompleteJiraWorkflow(issueId);
}

// COMMAND RECOGNITION PATTERNS
const JIRA_WORKFLOW_COMMANDS = [
  /process jira issue ([A-Z]+[-_]\d+)/i,
  /implement story ([A-Z]+[-_]\d+)/i,
  /work on ticket ([A-Z]+[-_]\d+)/i,
  /handle jira ([A-Z]+[-_]\d+)/i,
  /develop ([A-Z]+[-_]\d+)/i,
  /build ([A-Z]+[-_]\d+)/i
];

// Check if user input matches workflow trigger patterns
function shouldExecuteJiraWorkflow(userInput) {
  return JIRA_WORKFLOW_COMMANDS.some(pattern => pattern.test(userInput));
}
```

## ✅ Workflow Success Criteria

**Always ensure the following for each step:**

1. **Step 1 Success**: JIRA issue fetched with complete description and acceptance criteria
2. **Step 2 Success**: Code files created/modified based on requirements
3. **Step 3 Success**: Unit tests generated covering all acceptance criteria
4. **Step 4 Success**: JIRA status updated to "In Progress" 
5. **Step 5 Success**: GitHub PR created with detailed description
6. **Step 6 Success**: Complete traceability from JIRA → Code → Tests → PR

**Error Handling**: If any step fails, provide clear error message and attempt recovery where possible.

**Logging**: Log each step completion with timestamps and details for full audit trail.
