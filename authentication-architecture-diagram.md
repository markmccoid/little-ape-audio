# AudiobookShelf Authentication Architecture

## Mermaid Diagram

```mermaid
graph TB
    %% User Interface Layer
    UI[AbsAuth.tsx<br/>User Interface]

    %% Service Layer
    Service[ABSAuthService<br/>Authentication Service<br/>Static Methods]

    %% Client Layer
    Client[AudiobookshelfClient<br/>Wrapper Class]
    Auth[AudiobookshelfAuth<br/>Core Auth Logic]
    API[AudiobookshelfAPI<br/>API Methods]

    %% Storage Layer
    Store[Zustand Store<br/>store-abs.ts]
    SecureStore[Expo SecureStore<br/>Token Storage]
    AsyncStorage[AsyncStorage<br/>User Data]

    %% Server
    Server[AudiobookShelf Server<br/>Authentication Endpoints]

    %% User interactions
    UI -->|login(url, username, password)| Service
    UI -->|logout()| Service
    UI -->|initializeAuth()| Service

    %% Service layer orchestration
    Service -->|new AudiobookshelfClient(url)| Client
    Service -->|client.login(credentials)| Client
    Service -->|client.logout()| Client
    Service -->|client.isAuthenticated()| Client
    Service -->|setAuthClient(client)| Store
    Service -->|getAuthClient()| Store

    %% Client composition
    Client -->|contains| Auth
    Client -->|contains| API
    Client -->|delegates login| Auth
    Client -->|delegates logout| Auth
    Client -->|delegates isAuthenticated| Auth

    %% Authentication flow
    Auth -->|POST /login<br/>x-return-tokens: true| Server
    Auth -->|POST /auth/refresh<br/>x-refresh-token| Server
    Auth -->|POST /logout<br/>x-refresh-token| Server

    %% Token management
    Auth -->|storeTokens(tokens)| SecureStore
    Auth -->|getStoredTokens()| SecureStore
    Auth -->|clearTokens()| SecureStore

    %% API calls
    API -->|getValidAccessToken()| Auth
    API -->|makeAuthenticatedRequest()| Server
    API -->|auto-refresh on 401| Auth

    %% Store management
    Store -->|saveUserInfo()| AsyncStorage
    Store -->|saveLibraries()| AsyncStorage
    Store -->|initializeAuth()| Client
    Store -->|logout()| Client

    %% Server responses
    Server -->|LoginResponse<br/>accessToken, refreshToken| Auth
    Server -->|API Data| API
    Server -->|401 Unauthorized| API

    %% Styling
    classDef uiLayer fill:#e1f5fe
    classDef serviceLayer fill:#f3e5f5
    classDef clientLayer fill:#e8f5e8
    classDef storageLayer fill:#fff3e0
    classDef serverLayer fill:#ffebee

    class UI uiLayer
    class Service serviceLayer
    class Client,Auth,API clientLayer
    class Store,SecureStore,AsyncStorage storageLayer
    class Server serverLayer
```

## Architecture Description

### 1. **User Interface Layer (AbsAuth.tsx)**

- **Purpose**: Provides the login/logout UI for users
- **Key Functions**:
  - Collects user credentials (URL, username, password)
  - Displays authentication status
  - Handles login/logout button interactions
- **Integration**: Calls `ABSAuthService` static methods directly

### 2. **Service Layer (ABSAuthService)**

- **Purpose**: Bridge between UI and authentication classes
- **Key Responsibilities**:
  - Creates and manages `AudiobookshelfClient` instances
  - Converts authentication responses to app-compatible formats
  - Stores client instances in Zustand store
  - Provides simplified API for UI components
- **Pattern**: Static class with utility methods

### 3. **Client Layer (AudiobookshelfClient)**

- **Purpose**: Composition wrapper that combines auth and API functionality
- **Components**:
  - **AudiobookshelfAuth**: Handles token management and authentication
  - **AudiobookshelfAPI**: Handles authenticated API requests
- **Key Features**:
  - Single entry point for all AudiobookShelf operations
  - Automatic token refresh on API calls
  - Secure token storage using Expo SecureStore

### 4. **Authentication Core (AudiobookshelfAuth)**

- **Purpose**: Core authentication logic with refresh token support
- **Key Methods**:
  - `login()`: Authenticates with server, stores tokens
  - `refreshAccessToken()`: Refreshes expired access tokens
  - `getValidAccessToken()`: Returns valid token (refreshes if needed)
  - `isAuthenticated()`: Checks authentication status
  - `logout()`: Clears tokens and logs out from server
- **Token Management**:
  - Stores access tokens, refresh tokens, and expiry times
  - Uses Expo SecureStore for secure token persistence
  - Automatically calculates token expiry from JWT

### 5. **API Layer (AudiobookshelfAPI)**

- **Purpose**: Handles all authenticated API requests
- **Key Features**:
  - `makeAuthenticatedRequest()`: Generic method for authenticated calls
  - Automatic token refresh on 401 responses
  - Specific methods: `getLibraries()`, `getMe()`, etc.
- **Error Handling**: Automatically retries failed requests with refreshed tokens

### 6. **State Management (Zustand Store)**

- **Purpose**: Central state management for authentication and app data
- **Key State**:
  - `userInfo`: User profile and authentication status
  - `authClient`: Current AudiobookshelfClient instance
  - `libraries`: Available AudiobookShelf libraries
- **Key Actions**:
  - `setAuthClient()`: Stores client instance
  - `initializeAuth()`: Restores authentication on app startup
  - `logout()`: Clears all authentication state

### 7. **Storage Layers**

- **Expo SecureStore**: Secure storage for sensitive tokens
- **AsyncStorage**: Regular storage for user preferences and library data

## Authentication Flow

### Login Process:

1. User enters credentials in `AbsAuth.tsx`
2. `ABSAuthService.login()` creates new `AudiobookshelfClient`
3. Client delegates to `AudiobookshelfAuth.login()`
4. Auth class sends POST to `/login` with `x-return-tokens: true`
5. Server returns access token, refresh token, and user data
6. Tokens stored securely, client stored in Zustand store
7. User info updated with `isAuthenticated: true`

### API Request Process:

1. Component calls `ABSAuthService.getLibraries()`
2. Service gets client from store via `getAuthClient()`
3. Client delegates to `AudiobookshelfAPI.getLibraries()`
4. API calls `makeAuthenticatedRequest()` which:
   - Gets valid access token from auth class
   - Auth class checks expiry, refreshes if needed
   - Makes authenticated request to server
   - Handles 401 by refreshing token and retrying

### Token Refresh Process:

1. `getValidAccessToken()` checks token expiry (5-minute buffer)
2. If expired, calls `refreshAccessToken()`
3. Sends POST to `/auth/refresh` with refresh token in header
4. Server returns new access token
5. New tokens stored securely
6. Fresh access token returned for API use

### Logout Process:

1. User clicks logout in `AbsAuth.tsx`
2. `ABSAuthService.logout()` gets client from store
3. Client calls server logout endpoint with refresh token
4. All tokens cleared from secure storage
5. Zustand store cleared of authentication state
6. UI updates to show logged-out state

## Key Benefits

- **Automatic Token Management**: No manual token handling required
- **Secure Storage**: Sensitive tokens stored in Expo SecureStore
- **Persistent Authentication**: Users stay logged in between app sessions
- **Error Recovery**: Automatic retry with fresh tokens on authentication failures
- **Clean Separation**: Clear boundaries between UI, service, auth, and storage layers
