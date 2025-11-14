# Repository Management Instructions

## Session Context Loading

# Tech Stack

- **Primary language(s):**
  - Backend: `Node.js + Typescript + Vercel` 
  - Frontend: `TypeScript + React`
- **Package managers:**
  - Backend: `npm`
  - Frontend: `npm`
- **Minimum supported versions:**
  - Node: `>= 20`


### Learning Files (Read First)
- **Always read `.claude/QUICK_REF.txt` at the start of any technical task**
- **Scan `.claude/LEARNINGS.txt` for entries relevant to current task**
- These files contain critical gotchas, solutions, and patterns from previous development sessions
- Use entries tagged with relevant categories
- Consult workflows section in LEARNINGS.txt for multi-step procedures

### Adding New Learnings
When encountering new issues or discovering solutions:
- Add entry to `.claude/LEARNINGS.txt` using the `==CATEGORY|COMPONENT|ID==` format
- Include: S: symptom, X: solution, C: command/code, T: tags
- Update QUICK_REF.txt if it's a commonly-needed command or critical gotcha
- No dates, no links to docs, machine-readable format only

## Documentation Guidelines

### Default Documentation Location
- **Determine the appropriate documentation location for this repository**
- Options: project `/docs` folder, shared documentation repository, or wiki
- Use descriptive filenames in SCREAMING_SNAKE_CASE or kebab-case for documentation files
- Keep documentation close to the code it describes when possible

### Documentation Standards
- Use Markdown format for all documentation
- Include clear section headers and table of contents for longer documents
- Add code examples where relevant
- Keep documentation updated when making related code changes
- **Avoid bloat** - keep documentation concise and focused
- **Never use emojis** in documentation or code

## Git Commit Practices

### Commit Message Format
- Write clear, descriptive commit messages
- Use imperative mood (e.g., "Add feature" not "Added feature")
- Keep subject line under 72 characters
- Add detailed description in commit body when needed
- **Avoid bloat** - be concise but informative

### Attribution
- **Never include AI assistant credits in commit messages**
- **Never add "Co-Authored-By: Claude" or similar attributions**
- Commits should reflect only human contributors
- Keep commit authorship clean and professional
- No emojis in commit messages

### Commit Content
- Make atomic commits (one logical change per commit)
- Don't commit sensitive information (keys, credentials, tokens)
- Review changes before committing
- Ensure code compiles and tests pass before committing

## Code and Configuration Guidelines

### General Principles
- Avoid hardcoding specific values that may change
- Use configuration files or environment variables for deployment-specific settings
- Write reusable, maintainable code
- Follow existing project conventions and patterns
- **Avoid bloat** - keep code lean and necessary
- **Never use emojis** in code, comments, or output

### Security
- Never commit private keys or credentials
- Use placeholder values in examples
- Document security requirements without exposing actual secrets
- Implement proper access controls
- Use environment variables for sensitive configuration
- Add sensitive files to .gitignore

### File Organization
- Keep related files together
- Use clear, descriptive naming conventions
- Maintain consistent directory structure
- Clean up unused or deprecated files
- Document any non-standard directory structures

## Development Workflow

### Before Making Changes
- Understand the existing codebase structure
- Review related documentation
- Check for similar existing implementations
- Consider impact on other components
- Run existing tests to establish baseline

### Making Changes
- Follow the principle of least surprise
- Maintain backward compatibility when possible
- Test changes in appropriate environments
- Write tests for new functionality

### After Making Changes
- Verify all affected functionality works
- Clean up temporary or debug code
- Review the full changeset before committing
- Ensure all tests pass

## Testing Practices

### Test Coverage
- Write unit tests for new functionality
- Update tests when modifying existing code
- Aim for meaningful test coverage, not just high percentages
- Test edge cases and error conditions

### Test Quality
- Tests should be deterministic and repeatable
- Avoid tests that depend on external services when possible
- Use mocks and stubs appropriately
- Keep tests maintainable and readable

## Dependency Management

### Adding Dependencies
- Evaluate necessity before adding new dependencies
- Check dependency license compatibility
- Consider maintenance status and community support
- Document why dependencies were added

### Updating Dependencies
- Review changelogs before updating
- Test thoroughly after dependency updates
- Update in small batches when possible
- Keep dependencies reasonably current for security

## Communication and Clarity

### Code Comments
- Explain why, not what (code shows what)
- No yapping
- Document complex algorithms or business logic
- Keep comments current with code changes
- Use comments for non-obvious design decisions
- No emojis in comments

### Documentation Writing
- Write for the intended audience
- Provide context and rationale
- Include practical examples
- Keep language clear and professional
- Avoid unnecessary verbosity
- No emojis in documentation

## Style Guidelines

- **No emojis anywhere** - code, comments, documentation, commit messages, or output
- **Avoid bloat** - every line should serve a purpose
- Keep formatting clean and professional
- Use standard technical writing conventions
- Prioritize clarity over cleverness
- Follow language-specific style guides (PEP 8, Google Style Guide, etc.)

## Error Handling

### Error Messages
- Provide clear, actionable error messages
- Include relevant context for debugging
- Log errors appropriately
- Distinguish between user errors and system errors

### Exception Handling
- Catch specific exceptions, not generic ones
- Don't silently swallow exceptions
- Clean up resources in finally blocks or use context managers
- Document expected exceptions in function documentation

## Performance Considerations

### Optimization
- Profile before optimizing
- Focus on algorithmic improvements first
- Document performance-critical sections
- Don't sacrifice readability for marginal gains
- Consider time and space complexity

### Resource Management
- Close files, connections, and resources properly
- Use resource management constructs (with statements, try-finally)
- Be mindful of memory usage in long-running processes
- Clean up temporary resources

## Best Practices

- Review existing patterns before creating new ones
- Maintain consistency with established conventions
- Prioritize clarity and maintainability
- Document architectural decisions
- Consider future maintainers when writing code
- Test before committing
- Keep the repository clean and organized
- Use meaningful variable and function names
- Keep functions and methods focused and single-purpose
- Separate concerns appropriately
- Write self-documenting code where possible

## Project-Specific Adaptations

When adopting these guidelines for a specific project:
- Identify project-specific documentation location
- Add project-specific file structure guidelines
- Document project-specific coding conventions
- Add language-specific best practices
- Include framework-specific patterns
- Document deployment procedures
- Add environment setup instructions


## Scope

The Challenge
Use AI to reinvent how personalized marketing campaigns can be automated and scaled across 20+ countries using Braze APIs.

Today, Pampers Club reaches millions of families worldwide with loyalty rewards, personalized content, and direct communication. But running these campaigns across many countries is complex, time-consuming, and inefficient.

At Junction, we invite you to tackle this challenge: how can AI and automation transform campaign creation into a faster, smarter, and more effective process? The opportunity is to shape how one of the world’s leading consumer brands connects with families in the digital era.

Managing marketing campaigns today requires manual setup for every country, every message, and every channel — making innovation slow and repetitive.

The challenge is to build an AI-powered solution that automates campaign creation and management, enabling personalization at scale while reducing manual work.

Imagine a system that allows marketers to design, test, and optimize campaigns seamlessly across dozens of countries, languages, and audiences. How would you approach this problem to make the process more efficient, scalable, and impactful for millions of parents worldwide?

Insight
Problems and tech that interest us include:
Automating repetitive CRM workflows (emails, push notifications, in-app messaging).

Scaling personalized communication across countries and languages.

Leveraging AI to optimize campaign performance while reducing manual effort.

Resources
List of technologies/support we are bringing:
Access to Braze API and documentation
Mock consumer and market datasets
Description of current campaign workflow and pain points
Mentors from Pampers (technical + commercial)
Extra details:

This is P&G’s first time bringing a challenge to Junction, and we are excited to collaborate with hackers to rethink how one of our global platforms operates. We believe fast prototyping and creativity from the Junction community can uncover solutions that our large-scale operations cannot test quickly enough.

Link to resources: https://drive.google.com/drive/u/1/folders/1WRlNZ9Tc73ktWEwuyIKLnLEGLBnIcbIT

API key: 6d7b0fc4-6869-4779-b492-a3b74061eb25

Company Info

Procter & Gamble
Procter & Gamble (P&G) is one of the world’s largest consumer goods companies, with iconic brands such as Pampers, Gillette, and Ariel. At Pampers, our mission is to support families and their babies every day. We constantly seek new ways to connect meaningfully with parents worldwide, using digital platforms, loyalty programs, and AI-driven personalization. By joining Junction, we aim to co-create innovative solutions that transform how we communicate with millions of families across the globe.

Website: https://pg.com/

Judging Criteria
Effective use of AI
(25%)
Effective use of AI to automate tasks, enhance personalization, and deliver smarter outcomes.

Creativity
(25%)
Originality and inventiveness in the team’s approach to solving the problem.

Scalability
(25%)
Potential for the solution to expand and remain effective across multiple countries or contexts.

Efficiency
(25%)
Demonstrated reduction of manual effort and improvement in process speed or simplicity.

Prizes
1st Place
3000€