# Contributing to FixNear

We welcome contributions to FixNear! FixNear is an open-source, full-stack home services marketplace designed for Indian cities, pairing customers with verified tradespeople.

## Development Workflow

1. **Fork the repository** on GitHub.
2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/fixnear.git
   cd fixnear
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Setup environment variables**:
   ```bash
   cp .env.example .env
   ```
5. **Start local development servers**:
   ```bash
   npm run dev
   ```
   - Client runs on `http://localhost:5173`
   - Server runs on `http://localhost:5000`

## Running Tests & Typechecks

Before submitting a PR, make sure all checks pass:
```bash
# Run server test suite
npm run test --workspace=server

# Run type checks
npm run lint --workspace=server
npm run build --workspace=client
```

## Pull Request Guidelines

- Branch names should be descriptive: `feature/service-reviews` or `fix/booking-status-transition`.
- Keep PRs focused on a single feature or bug fix.
- Ensure new features have accompanying unit/integration tests in `server/test/`.
