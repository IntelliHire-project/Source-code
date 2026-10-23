# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth\auth-management.spec.js >> Auth Management & Session Suite >> TC - AUTH - 022: Change Password validation
- Location: tests\auth\auth-management.spec.js:173:3

# Error details

```
TypeError: Cannot read properties of undefined (reading 'token')
```

# Test source

```ts
  81  |     // Same generic success message to prevent user enumeration
  82  |     const statusMsg = page.locator('p.form-status');
  83  |     await expect(statusMsg).toBeVisible({ timeout: 8_000 });
  84  |     await expect(statusMsg).toContainText(/If an account exists for this email, a reset link will be sent/i);
  85  |   });
  86  | 
  87  |   // -------------------------------------------------------------------------
  88  |   // TC - AUTH - 019: Session Validation (GET /api/auth/me) with valid Bearer token
  89  |   // -------------------------------------------------------------------------
  90  |   test('TC - AUTH - 019: Session Validation with valid Bearer token', async ({ request }) => {
  91  |     // 1. Obtain a valid candidate token
  92  |     const loginRes = await request.post(`${BASE_URL}/auth/login`, {
  93  |       data: {
  94  |         email: DEMO_CANDIDATE_EMAIL,
  95  |         password: DEMO_CANDIDATE_PASSWORD,
  96  |       },
  97  |     });
  98  |     expect(loginRes.ok()).toBeTruthy();
  99  |     const loginData = await loginRes.json();
  100 |     const token = loginData.data?.token || loginData.token;
  101 |     expect(token).toBeTruthy();
  102 | 
  103 |     // 2. Validate session via GET /api/auth/me
  104 |     const meRes = await request.get(`${BASE_URL}/auth/me`, {
  105 |       headers: {
  106 |         Authorization: `Bearer ${token}`,
  107 |       },
  108 |     });
  109 | 
  110 |     expect(meRes.status()).toBe(200);
  111 |     const meData = await meRes.json();
  112 |     expect(meData.data.user.email).toBe(DEMO_CANDIDATE_EMAIL);
  113 |     expect(meData.data.user.role).toBe('candidate');
  114 |   });
  115 | 
  116 |   // -------------------------------------------------------------------------
  117 |   // TC - AUTH - 020: Accessing Protected Route without Token / Expired Token
  118 |   // -------------------------------------------------------------------------
  119 |   test('TC - AUTH - 020: Accessing Protected Route without Token', async ({ request }) => {
  120 |     // 1. Attempt access with no Authorization header
  121 |     const resNoToken = await request.get(`${BASE_URL}/auth/me`);
  122 |     expect(resNoToken.status()).toBe(401);
  123 |     const bodyNoToken = await resNoToken.json();
  124 |     expect(bodyNoToken.message).toContain('No authentication token provided');
  125 | 
  126 |     // 2. Attempt access with invalid/malformed token
  127 |     const resBadToken = await request.get(`${BASE_URL}/auth/me`, {
  128 |       headers: {
  129 |         Authorization: 'Bearer invalid_or_expired_token_12345',
  130 |       },
  131 |     });
  132 |     expect(resBadToken.status()).toBe(401);
  133 |     const bodyBadToken = await resBadToken.json();
  134 |     expect(bodyBadToken.message).toContain('Invalid or expired authentication token');
  135 |   });
  136 | 
  137 |   // -------------------------------------------------------------------------
  138 |   // TC - AUTH - 021: User Logout Flow
  139 |   // -------------------------------------------------------------------------
  140 |   test('TC - AUTH - 021: User Logout Flow', async ({ page }) => {
  141 |     // 1. Sign in as candidate
  142 |     await page.goto('/signin');
  143 |     await page.locator('#email').fill(DEMO_CANDIDATE_EMAIL);
  144 |     await page.locator('#password').fill(DEMO_CANDIDATE_PASSWORD);
  145 |     await page.locator('button[type="submit"]').click();
  146 | 
  147 |     // Wait until navigated to candidate area
  148 |     await page.waitForURL('**/candidate/**', { timeout: 8_000 });
  149 | 
  150 |     // 2. Click Logout button (either in sidebar, header, or dropdown)
  151 |     const logoutBtn = page.getByRole('button', { name: /log\s*out|sign\s*out/i })
  152 |       .or(page.getByRole('link', { name: /log\s*out|sign\s*out/i }));
  153 |     
  154 |     if (await logoutBtn.isVisible()) {
  155 |       await logoutBtn.click();
  156 |     } else {
  157 |       // Trigger logout via localStorage clear or direct navigation
  158 |       await page.evaluate(() => {
  159 |         localStorage.clear();
  160 |         sessionStorage.clear();
  161 |       });
  162 |       await page.goto('/signin');
  163 |     }
  164 | 
  165 |     // Verify redirected back to /signin
  166 |     await page.waitForURL('**/signin**', { timeout: 5_000 });
  167 |     expect(page.url()).toContain('/signin');
  168 |   });
  169 | 
  170 |   // -------------------------------------------------------------------------
  171 |   // TC - AUTH - 022: Change Password with correct and incorrect current password
  172 |   // -------------------------------------------------------------------------
  173 |   test('TC - AUTH - 022: Change Password validation', async ({ request }) => {
  174 |     // Log in to get authentication token
  175 |     const loginRes = await request.post(`${BASE_URL}/auth/login`, {
  176 |       data: {
  177 |         email: DEMO_CANDIDATE_EMAIL,
  178 |         password: DEMO_CANDIDATE_PASSWORD,
  179 |       },
  180 |     });
> 181 |     const { data: { token } } = await loginRes.json();
      |                     ^ TypeError: Cannot read properties of undefined (reading 'token')
  182 | 
  183 |     // 1. Attempt password change with incorrect current password
  184 |     const failRes = await request.post(`${BASE_URL}/auth/change-password`, {
  185 |       headers: { Authorization: `Bearer ${token}` },
  186 |       data: {
  187 |         currentPassword: 'WrongCurrentPassword999!',
  188 |         newPassword: 'NewValidPassword123!',
  189 |       },
  190 |     });
  191 |     expect(failRes.status()).toBe(401);
  192 |     const failBody = await failRes.json();
  193 |     expect(failBody.message).toContain('Incorrect current password.');
  194 | 
  195 |     // 2. Attempt password change with new password < 8 chars
  196 |     const shortRes = await request.post(`${BASE_URL}/auth/change-password`, {
  197 |       headers: { Authorization: `Bearer ${token}` },
  198 |       data: {
  199 |         currentPassword: DEMO_CANDIDATE_PASSWORD,
  200 |         newPassword: 'Pass1!',
  201 |       },
  202 |     });
  203 |     expect(shortRes.status()).toBe(400);
  204 |     const shortBody = await shortRes.json();
  205 |     expect(shortBody.message).toContain('at least 8 characters long');
  206 |   });
  207 | 
  208 | });
  209 | 
```