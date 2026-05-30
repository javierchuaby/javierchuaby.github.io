# Design Goals

This project attempts to follow these design principles.

## Simple

1. The codebase should remain simple, readable, and highly maintainable.
2. It should not require reading a large amount of documentation to understand.

## Fast

1. Follows [JAMStack best practices](https://jamstack.org/best-practices/). Everything that can be pre-rendered should be pre-rendered.
2. Time to interact should be very fast (< 250 ms). Optimized for small bundle sizes.

## Good Developer Experience

1. Modular
   - It should be relatively straightforward to update the content or to add a new feature.
   - Good separation of concerns. Components keep track of their own state. Props are not over-utilized.
   - Limited vertical depth (changes should be relatively self-encapsulated).
   - Correct abstractions: the Next.js build system is complex, but the source code hides that complexity.
2. Good Documentation
   - Comments exist and have an appropriate level of detail.
   - Code should be readable.
3. Lean
   - Actively prune old and dead code to avoid bloat.
   - New features that affect the entire project should be carefully considered.
   - Use popular and well-maintained npm libraries when possible.
4. Limited horizontal fragmentation
   - Linter to prevent easy PR nits & to enforce code style consistency.
   - Preferred React Style: functional components with TypeScript for type safety.
   - Consistent file structure based on current best practices.
   - Similar features are built similarly. Code reads like an assembly line, not a layer cake.

## Stable

1. Use _Boring_ technologies
   - TypeScript for type safety while maintaining readability. Limited experimental features.
   - Prefer popular and well-maintained npm packages.
2. Maintainable
   - Easy setup.
   - It should be easy to deploy any version of this site.
   - Limited external dependencies (i.e. no missing headers for external libraries).
   - Dependencies are kept up to date.
3. Good tests.
4. Stable codebase structure.

## References

For further reading, please review

- React's [Design Principles](https://react.dev/learn/thinking-in-react).
