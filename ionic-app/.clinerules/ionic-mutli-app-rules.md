# Ionic Multi-App Export Rules and Best Practices

## Project Structure and Organization

### Application Configuration
- Store all application configurations in a dedicated config directory (`src/config/`)
- Use TypeScript interfaces to define application configuration types
- Keep environment-specific configurations separate (development, staging, production)

```typescript
// Example application configuration structure
interface IframeAppConfig {
  id: string;
  name: string;
  url: string;
  allowedOrigins: string[];
  permissions?: string[];
}
```

### Component Organization
- Create reusable iframe components in `src/components/`
- Follow single responsibility principle
- Implement proper TypeScript typing for all props and state
- Use React.memo() for performance optimization when appropriate

## Code Style and Formatting

### TypeScript Guidelines
- Enable strict mode in tsconfig.json
- Use explicit type annotations for function parameters and return types
- Avoid using 'any' type - prefer unknown for truly unknown values
- Use interface for object types unless you specifically need type
- Use readonly where applicable to prevent accidental mutations

### ESLint Configuration
```javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    'react/prop-types': 'off'
  }
}
```

### Prettier Configuration
```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true
}
```

## Security Guidelines

### Iframe Security
- Always use sandbox attribute with minimum required permissions
- Implement proper origin validation
- Use secure content-security-policy headers
- Validate all messages received via postMessage

```typescript
// Example iframe security implementation
const validateMessageOrigin = (origin: string, allowedOrigins: string[]): boolean => {
  return allowedOrigins.includes(origin);
};

const handleIframeMessage = (event: MessageEvent): void => {
  if (!validateMessageOrigin(event.origin, config.allowedOrigins)) {
    console.error('Message received from unauthorized origin');
    return;
  }
  // Process message
};
```

### Data Handling
- Never store sensitive data in localStorage/sessionStorage
- Use secure storage solutions for sensitive information
- Implement proper data sanitization for all user inputs
- Use HTTPS for all external communications

## Testing Requirements

### Unit Tests
- Implement comprehensive unit tests using Vitest and React Testing Library
- Maintain minimum 80% code coverage
- Test all message handling and security validations
- Mock external dependencies appropriately

```typescript
// Example test structure
describe('IframeComponent', () => {
  it('should validate message origins correctly', () => {
    // Test implementation
  });

  it('should handle invalid messages appropriately', () => {
    // Test implementation
  });
});
```

### E2E Tests
- Implement E2E tests using Cypress
- Test full application flow including iframe interactions
- Verify proper loading and error states
- Test cross-origin communication scenarios

```typescript
// Example Cypress test
describe('Iframe Integration', () => {
  it('should load external application successfully', () => {
    cy.visit('/');
    cy.get('iframe[data-testid="dynamic-iframe"]')
      .should('be.visible')
      .and('have.attr', 'src')
      .and('include', 'expected-url');
  });
});
```

## Performance Optimization

### Loading Strategies
- Implement lazy loading for iframes
- Use loading="lazy" attribute when appropriate
- Consider implementing a loading placeholder
- Monitor and optimize iframe resource consumption

### Memory Management
- Implement proper cleanup in useEffect hooks
- Remove event listeners when components unmount
- Monitor memory usage in long-running applications
- Implement proper error boundaries

```typescript
// Example cleanup implementation
useEffect(() => {
  window.addEventListener('message', handleMessage);
  return () => {
    window.removeEventListener('message', handleMessage);
  };
}, []);
```

## Error Handling

### Error Boundaries
- Implement React Error Boundaries for iframe components
- Provide fallback UI for error states
- Log errors appropriately
- Implement retry mechanisms where appropriate

```typescript
class IframeErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to service
    logError(error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return <FallbackComponent error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

## Documentation Requirements

### Code Documentation
- Use JSDoc for all components and functions
- Document security considerations
- Maintain README files for each major component
- Include examples for common use cases

### API Documentation
- Document all postMessage interfaces
- Specify expected message formats
- Document error codes and handling
- Maintain version compatibility information

## Deployment and CI/CD

### Build Process
- Implement proper build optimization
- Configure proper chunk splitting
- Optimize asset loading
- Implement proper cache strategies

### Continuous Integration
- Run all tests before merging
- Implement proper linting checks
- Verify bundle size and performance metrics
- Check for security vulnerabilities

## Version Control

### Git Practices
- Use semantic versioning
- Maintain clean commit history
- Use feature branches
- Implement proper PR review process

### Branch Strategy
```
main (production)
├── develop
│   ├── feature/new-iframe-component
│   ├── bugfix/iframe-loading-issue
│   └── enhancement/performance-optimization
└── hotfix/security-patch
```

## Monitoring and Analytics

### Performance Monitoring
- Track iframe loading times
- Monitor memory usage
- Track user interactions
- Implement error tracking

### Usage Analytics
- Track successful/failed loads
- Monitor origin validation failures
- Track user interaction patterns
- Implement proper logging

## Accessibility Requirements

### ARIA Attributes
- Implement proper ARIA roles
- Provide proper focus management
- Ensure keyboard navigation support
- Maintain proper tab order

### Cross-browser Support
- Test in all major browsers
- Implement proper fallbacks
- Handle browser-specific issues
- Maintain browser compatibility list
