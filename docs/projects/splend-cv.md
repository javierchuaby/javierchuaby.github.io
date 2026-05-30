# Technical Portfolio Review: Splend Project

This review evaluates the **Splend** mobile application and its associated Node.js backend to extract high-value engineering contributions for a software engineering internship resume.

---

### CONTRIBUTION: Algorithmic Group Debt Simplification

- **FILES INVOLVED**: `Splend/components/BillSettlementManager.tsx`, `Splend/tests/unit/billSplit.test.ts`
- **SKILL DOMAIN**: Algorithm Design / FinTech Logic / TypeScript
- **WHAT WAS BUILT**: Implemented a greedy debt simplification algorithm designed to minimize the total number of peer-to-peer transactions required for a group to settle up (similar to Splitwise). The algorithm computes absolute user balances across complex, multi-item bills with varying participant splits, then zeroes out ledgers by matching creditors with debtors efficiently. Validated via comprehensive unit test suites handling edge-case fraction logic and precision rounding.
- **NON-TRIVIAL BECAUSE**: Real-world expense splitting introduces floating-point precision issues, multi-party cross-debts, and iterative zero-balance matching bugs. The implementation accurately tracks "Optimisation Savings" metrics (quantifying the reduction from maximum possible transactions to the bare minimum) and resolves cent-level rounding issues mathematically before execution.
- **CV-READY BULLET**: Designed and implemented a group debt simplification algorithm in TypeScript that minimizes peer-to-peer settlement transactions, validating logic with comprehensive unit tests for complex unequal expense splits.
- **GAPS / METRICS NEEDED**: Quantify exact reduction metrics (e.g., "reduced average settlement transaction count by >50%") and the number of test assertions written.

---

### CONTRIBUTION: AI-Powered Receipt OCR Integration

- **FILES INVOLVED**: `Splend/app/(events)/event-view.tsx`, `Splend-backend/server.js`
- **SKILL DOMAIN**: Full-Stack / AI-Integration / Mobile Engineering
- **WHAT WAS BUILT**: Developed an end-to-end receipt scanning pipeline using `expo-image-picker` for mobile image capture (Base64 up to 50MB) and an Express Node.js microservice. The service interfaces with OpenAI’s `gpt-4o` Vision API via strict JSON schema prompting. The backend handles non-deterministic LLM outputs (utilizing regex fallback parsers) to return structured data that auto-populates the React Native UI state.
- **NON-TRIVIAL BECAUSE**: Managing unconstrained LLM responses requires robust fallback parsing logic in the middleware. Handling large Base64 image payloads between mobile hardware and Node without memory overflows while bridging asynchronous responses into complex UI state demonstrates strong full-stack awareness.
- **CV-READY BULLET**: Engineered an AI-driven receipt scanner using React Native and a Node.js microservice, leveraging OpenAI’s Vision API to extract and parse itemized expenses into structured JSON with robust fallback validation.
- **GAPS / METRICS NEEDED**: End-to-end latency of the OCR processing and parsing success rate (%).

---

### CONTRIBUTION: Real-time Cloud Data Synchronization Engine

- **FILES INVOLVED**: `Splend/app/(tabs)/calendar.tsx`, `Splend/app/services/firestoreService.ts`
- **SKILL DOMAIN**: Mobile Development / Cloud Infrastructure / Performance Optimization
- **WHAT WAS BUILT**: Developed a real-time event synchronization layer using Firebase Firestore WebSockets (`onSnapshot`). Implemented a custom client-side dictionary cache (`tripNameCache`) to deduplicate redundant Firestore read queries when grouping complex NoSQL document structures into an optimized React Native Calendar view.
- **NON-TRIVIAL BECAUSE**: Managing live listeners in React Native can trigger infinite re-render loops or exceed database read quotas if unmanaged. This implementation manages backwards compatibility for legacy Date formats and gracefully limits costly lookups via in-memory caching.
- **CV-READY BULLET**: Built a real-time event synchronization engine using Firestore and React Native, implementing an in-memory caching layer that significantly reduced database read operations during complex client-side UI aggregations.
- **GAPS / METRICS NEEDED**: Approximate number of database reads saved per session or UI render performance (e.g., "maintained 60FPS").

---

## TOP PICKS (Employer Signal Strength)

1. **Algorithmic Group Debt Simplification**: High depth. Demonstrates fundamental CS knowledge and an ability to solve complex logic problems beyond standard CRUD.
2. **AI-Powered Receipt OCR Integration**: High demand. Demonstrates full-stack capability and practical implementation of modern AI/Vision tools.
3. **Real-time Cloud Synchronization**: Reliability/Impact. Shows awareness of scalability and cloud cost optimization in production environments.

---

## TECH STACK SUMMARY

| Category          | Technology                                            | Status                             |
| :---------------- | :---------------------------------------------------- | :--------------------------------- |
| **Languages**     | TypeScript, JavaScript                                | **DEMONSTRATED**                   |
| **Web / Mobile**  | React Native, Expo, React Navigation, Expo Router     | **DEMONSTRATED**                   |
| **Cloud & Infra** | Node.js, Express, Firebase (Auth/Firestore)           | **DEMONSTRATED**                   |
| **AI & LLM**      | OpenAI Vision API (`gpt-4o`)                          | **DEMONSTRATED**                   |
| **Testing/Tools** | Jest, RN Testing Library, ESLint, Dotenv, Axios, CORS | **DEMONSTRATED**                   |
| **Mapping/Web**   | `react-native-maps`, `react-native-webview`           | **SHALLOW** (Installed but unused) |

---

## MISSING BEST PRACTICES (Interview Risks)

- **Retry Logic**: No exponential backoff or retry logic exists for the external OpenAI API calls in `server.js`.
- **Input Validation**: The `/process-receipt` endpoint lacks payload validation (MIME-type checks) before proxying data to costly AI models.
- **Error States**: Partial failure states (e.g., network drops during a heavy Base64 upload) lack robust atomic rollbacks in the UI.
- **Hardcoding**: Backend endpoints and environment configurations are largely hardcoded for local development versus production stages.
- **Integration Testing**: While logic is unit-tested, the project lacks automated E2E integration tests (e.g., Detox) for the full App-to-Cloud flow.
