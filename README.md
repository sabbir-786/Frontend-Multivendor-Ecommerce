# Multi-Vendor E-commerce frontend
## Customer | Seller | Admin

### 1. Recommended Tools & Tech Stack

To handle the complexity of a multi-vendor system, you should use tools that enforce structure and performance.

* **Build Tool:** `Vite` (Fast and modern, standard for new React apps).
* **Routing:** `React Router v6` (You already have a `routes` folder, this is the standard).
* **State Management:** `Redux Toolkit` (Best for global state like Auth and Cart) + `TanStack Query (React Query)` (Best for caching API data like product lists).
* **UI Framework:** `Tailwind CSS` (for flexibility) or `Material UI / Ant Design` (for pre-built Admin/Seller dashboard components).
* **Forms:** `React Hook Form` + `Zod` (Crucial for complex Seller product upload forms and Admin validations).
* **HTTP Client:** `Axios` (with interceptors for JWT token management).

---

### 2. Expanded Project Structure

This structure separates "Feature" modules (Admin, Seller, Customer) so your code doesn't get messy.

```text
src/
├── assets/                 # Static images, icons, global styles
├── api/
│   ├── axios.js            # Axios instance with interceptors
│   ├── authApi.js          # Login/Register endpoints
│   ├── adminApi.js         # Admin specific endpoints
│   ├── sellerApi.js        # Seller specific endpoints
│   └── productApi.js       # Public product endpoints
├── auth/
│   ├── Login.jsx           # Unified or separate login screens
│   ├── Register.jsx
│   └── ForgotPassword.jsx
├── components/             # SHARED components (used across all roles)
│   ├── common/             # Buttons, Inputs, Modals
│   ├── layout/             # Header, Footer, Sidebar
│   └── products/           # ProductCard, ProductGrid (reused)
├── config/                 # Environment variables, role constants
│   └── roles.js            # e.g., export const ROLES = { ADMIN: 'admin', ... }
├── context/                # Context API (if replacing Redux for small states)
├── guards/
│   ├── RoleGuard.jsx       # Checks user role before rendering route
│   └── AuthGuard.jsx       # Checks if user is logged in
├── hooks/                  # Custom hooks
│   ├── useAuth.js
│   └── useCart.js
├── layouts/                # Different layouts for different users
│   ├── MainLayout.jsx      # For Customer (Navbar + Footer)
│   └── DashboardLayout.jsx # For Admin/Seller (Sidebar + Topbar)
├── pages/
│   ├── admin/              # Admin-only pages
│   │   ├── Dashboard.jsx
│   │   ├── CategoryManagement.jsx
│   │   └── UserManagement.jsx
│   ├── seller/             # Seller-only pages
│   │   ├── SellerDashboard.jsx
│   │   ├── ProductList.jsx
│   │   ├── AddProduct.jsx
│   │   └── Orders.jsx
│   └── customer/           # Public/Customer pages
│       ├── Home.jsx
│       ├── ProductDetails.jsx
│       ├── Cart.jsx
│       └── Checkout.jsx
├── routes/
│   ├── AppRoutes.jsx       # Main entry point for routes
│   ├── AdminRoutes.jsx     # Nested routes for Admin
│   ├── SellerRoutes.jsx    # Nested routes for Seller
│   └── CustomerRoutes.jsx  # Nested routes for Customer
├── store/                  # Redux Toolkit Slices
│   ├── authSlice.js
│   ├── cartSlice.js
│   └── uiSlice.js
├── utils/                  # Helper functions
│   ├── currency.js
│   └── validators.js
├── App.jsx
└── main.jsx

```

### 3. Key Structural Decisions

* **Layouts (`/layouts`)**: This is critical for multi-vendor apps.
* **Customer:** Needs a standard "Header-Content-Footer" layout.
* **Admin & Seller:** Need a "Sidebar-Header-Content" dashboard layout. You can create one `DashboardLayout` and reuse it for both Admin and Seller, just changing the sidebar menu items.


* **Guards (`/guards`)**:
* `RoleGuard.jsx` will wrap your `AdminRoutes` and `SellerRoutes`. It checks the user's role from the Redux store. If a "Customer" tries to access `/seller/dashboard`, this guard kicks them out.


* **API Separation (`/api`)**:
* Don't put all API calls in one file. Split them. `sellerApi.js` should contain `createProduct`, `getMyOrders`, while `adminApi.js` contains `approveSeller`, `getAllUsers`.



### 4. Example: How to implement the Routes

Here is how you would connect the structure in `AppRoutes.jsx`:

```jsx
// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import RoleGuard from '../guards/RoleGuard';
import DashboardLayout from '../layouts/DashboardLayout';
import MainLayout from '../layouts/MainLayout';

// Import your sub-route files or pages...

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public / Customer Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetails />} />
      </Route>

      {/* Seller Routes - Protected */}
      <Route element={<RoleGuard allowedRoles={['seller']} />}>
        <Route element={<DashboardLayout role="seller" />}>
           <Route path="/seller/dashboard" element={<SellerDashboard />} />
           <Route path="/seller/products" element={<SellerProducts />} />
        </Route>
      </Route>

      {/* Admin Routes - Protected */}
      <Route element={<RoleGuard allowedRoles={['admin']} />}>
         <Route element={<DashboardLayout role="admin" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserList />} />
         </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;

```

### Phase 1: Project Initialization

First, create the Vite project and enter the directory.

```bash
# 1. Create the project using Vite (select React and JavaScript/SWC when prompted)
npm create vite@latest multi-vendor-ecommerce -- --template react

# 2. Go into the folder
cd multi-vendor-ecommerce

# 3. Install initial dependencies
npm install

```

---

### Phase 2: Install Dependencies

Run these commands to install the specific tools you asked for.

**1. Routing & API:**

```bash
npm install react-router-dom axios @tanstack/react-query

```

**2. State Management:**

```bash
npm install @reduxjs/toolkit react-redux

```

**3. UI & Styling (Tailwind CSS):**

```bash
npm install tailwindcss @tailwindcss/vite

```

import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
})


@import "tailwindcss";

*(Note: If you want specific icons, I recommend `lucide-react` or `react-icons` as well: `npm install lucide-react`)*

**4. Forms & Validation:**

```bash
npm install react-hook-form zod @hookform/resolvers

```



---

### Phase 3: Configuration & Setup

Now, let's configure the tools one by one.


Open `tailwind.config.js` and update the `content` array to scan your files:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

```

Add the Tailwind directives to `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

```

#### Step 2: Create the Folder Structure

Run this command (Mac/Linux) or create folders manually to match the structure we discussed:

```bash
mkdir -p src/{api,auth,components/common,components/layout,config,context,guards,hooks,layouts,pages/admin,pages/seller,pages/customer,routes,store,utils}

```

#### Step 3: Configure Redux Store

Create `src/store/store.js`:

```javascript
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice'; // We will create this next

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

```

Create a basic Auth Slice `src/store/authSlice.js`:

```javascript
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  role: null, // 'admin', 'seller', 'customer'
  token: localStorage.getItem('token') || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.role = action.payload.role;
      state.token = action.payload.token;
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.role = null;
      state.token = null;
      localStorage.removeItem('token');
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;

```

#### Step 4: Configure Axios (HTTP Client)

Create `src/api/axios.js`. This automatically attaches your token to every request.

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Replace with your backend URL
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

```

---

### Phase 4: Wiring It All Together (main.jsx)

Now we need to wrap your application with the Providers: Redux, React Query, and Router.

Open `src/main.jsx`:

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// 1. Imports for Providers
import { Provider } from 'react-redux';
import { store } from './store/store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// 2. Create Query Client
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Redux Provider */}
    <Provider store={store}>
      {/* React Query Provider */}
      <QueryClientProvider client={queryClient}>
        {/* Router Provider */}
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>,
);

```

---

### Phase 5: Basic Role Guard Setup

Create `src/guards/RoleGuard.jsx` to handle the security logic:

```jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const RoleGuard = ({ allowedRoles }) => {
  const { role, token } = useSelector((state) => state.auth);

  // 1. If not logged in, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. If logged in but wrong role, redirect to unauthorized or home
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. Authorized
  return <Outlet />;
};

export default RoleGuard;

```

### Phase 6: Run the Project

You can now start your development server:

```bash
npm run dev

```

You now have a production-ready structure.

* **Next Step:** Would you like me to code the **Seller Registration Form** using React Hook Form + Zod to show you how to handle complex validations?
