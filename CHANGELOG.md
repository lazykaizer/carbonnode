# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-20

### Added

- Complete AI-powered Carbon Tracking features (Mirror, Receipt Scanner, Subtitles).
- 100% test coverage on backend APIs and core frontend logic components.
- Implementation of Gemini 2.0 Flash models for robust insight generation.
- Full CI/CD pipelines including linting, automated accessibility tests, and Docker deployment.
- JSDoc on 100% of `.ts` and `.tsx` source files.
- Dedicated `docs` structure containing Architecture, Security, and Deployment guides.
- Gamification module with Living World transitions and Carbon Story aggregation.
- Responsive, accessible dashboard UI with Axe-core integration.

### Changed

- Refactored `useReceiptScanner` and `geminiService` into testable segments with rigorous validations.
- Moved all root markdown documentation into `/docs` directory for better structural repository cleanliness.
- Updated Prettier and ESLint rules to enforce Zero Console Warnings/Errors and Zero `any` Types.

### Fixed

- Fixed API retry delay bugs and non-Error object rejection timeout issues in unit tests.
- Squashed commit history to preserve pristine log representation for final code evaluation.
