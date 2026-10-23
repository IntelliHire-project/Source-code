# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth\candidate-signup.spec.js >> Candidate Sign-up Suite >> Candidate Sign-up Terms & Conditions Validation
- Location: tests\auth\candidate-signup.spec.js:204:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('p.form-status.error')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('p.form-status.error') with timeout 5000ms
  - waiting for locator('p.form-status.error')

```

```yaml
- main:
  - link "IntelliHire Home":
    - /url: /
    - img "IntelliHire Logo"
    - text: IntelliHire
  - heading "Launch Your Career with Confidence" [level=1]
  - paragraph: IntelliHire is a smart recruitment and career guidance system that helps candidates showcase their skills, discover suitable opportunities, and get AI-powered insights to grow in their careers.
  - img
  - text: AI Resume Analysis Get AI-powered feedback to improve your resume.
  - img
  - text: Intelligent Job Matching Find roles that match your skills and career goals.
  - img
  - text: Personalized Career Guidance Receive tailored recommendations for your career.
  - img
  - text: Application Tracking Track and manage your job applications in one place.
  - img
  - text: Secure Platform Your data is encrypted and fully protected.
  - img
  - text: AI Powered Smart algorithms for better career decisions.
  - img
  - text: Recruiter Verified Opportunities from trusted employers.
  - region "Create Your Account":
    - img
    - heading "Create Your Account" [level=2]
    - text: Candidate
    - link "Recruiter":
      - /url: /recruiter/signup
    - text: Full Name
    - img
    - textbox "Full Name":
      - /placeholder: e.g. Alexander Pierce
      - text: Terms Tester
    - text: Email Address
    - img
    - textbox "Email Address":
      - /placeholder: name@company.com
      - text: terms-1792750225525-q7co@test.invalid
    - text: Password
    - img
    - textbox "Password":
      - /placeholder: Enter your password
      - text: Password123!
    - button "Show password"
    - text: Confirm Password
    - img
    - textbox "Confirm Password":
      - /placeholder: Confirm your password
      - text: Password123!
    - button "Show confirm password"
    - text: Phone Number
    - img
    - textbox "Phone Number":
      - /placeholder: +1 (555) 000-0000
      - text: "+1234567890"
    - text: Upload Your CV Optional
    - img
    - paragraph: Drag & drop your CV here
    - paragraph: PDF up to 5MB
    - checkbox
    - text: I agree to the
    - link "Terms & Conditions":
      - /url: /terms
    - text: and
    - link "Privacy Policy":
      - /url: /privacy
    - text: .
    - button "Create Account":
      - text: Create Account
      - img
    - text: OR CONTINUE WITH
    - button "Continue with Google":
      - img
      - text: Continue with Google
    - button "Continue with LinkedIn":
      - img
      - text: Continue with LinkedIn
    - paragraph:
      - text: Already have an account?
      - link "Log in here":
        - /url: /signin
```

# Test source

```ts
  116 | 
  117 |     // Submit form
  118 |     await page.locator('button.auth-submit-btn').click();
  119 | 
  120 |     // Verify success status and redirect to /signin
  121 |     const status = page.locator('p.form-status');
  122 |     await expect(status).toBeVisible({ timeout: 10_000 });
  123 |     await expect(status).toHaveText(/Account created successfully/i);
  124 | 
  125 |     // Expect redirection to sign-in page
  126 |     await expect(page).toHaveURL(/\/signin/, { timeout: 10_000 });
  127 |   });
  128 | 
  129 |   // TC - AUTH - 002: Candidate Sign-up without CV (Optional CV field)
  130 |   test('TC - AUTH - 002: Candidate Sign-up without CV (Optional CV field)', async ({ page }) => {
  131 |     const testEmail = generateTestEmail('cand-nocv');
  132 |     await fillCandidateForm(page, {
  133 |       fullName: 'Jane Doe',
  134 |       email: testEmail,
  135 |       phone: '+1234567890',
  136 |       password: VALID_PASSWORD,
  137 |       confirmPassword: VALID_PASSWORD,
  138 |     });
  139 | 
  140 |     // Leave CV empty, click Create Account
  141 |     await page.locator('button.auth-submit-btn').click();
  142 | 
  143 |     // Verify account creation success
  144 |     const status = page.locator('p.form-status');
  145 |     await expect(status).toBeVisible({ timeout: 10_000 });
  146 |     await expect(status).toHaveText(/Account created successfully/i);
  147 |     await expect(page).toHaveURL(/\/signin/, { timeout: 10_000 });
  148 |   });
  149 | 
  150 |   // TC - AUTH - 003: Candidate Sign-up with duplicate email
  151 |   test('TC - AUTH - 003: Candidate Sign-up with duplicate email', async ({ page }) => {
  152 |     await fillCandidateForm(page, {
  153 |       fullName: 'Duplicate User',
  154 |       email: DEMO_CANDIDATE_EMAIL, // Already registered seeded user
  155 |       phone: '+1234567890',
  156 |       password: VALID_PASSWORD,
  157 |       confirmPassword: VALID_PASSWORD,
  158 |     });
  159 | 
  160 |     await page.locator('button.auth-submit-btn').click();
  161 | 
  162 |     // Verify error message for duplicate email (HTTP 409)
  163 |     const status = page.locator('p.form-status.error');
  164 |     await expect(status).toBeVisible({ timeout: 8_000 });
  165 |     await expect(status).toContainText(/already exists/i);
  166 | 
  167 |     // User should remain on signup page
  168 |     await expect(page).toHaveURL(/\/signup/);
  169 |   });
  170 | 
  171 |   // TC - AUTH - 004: Candidate Sign-up Password Mismatch
  172 |   test('TC - AUTH - 004: Candidate Sign-up Password Mismatch', async ({ page }) => {
  173 |     await fillCandidateForm(page, {
  174 |       fullName: 'Mismatch Tester',
  175 |       email: generateTestEmail('mismatch'),
  176 |       password: 'Password123!',
  177 |       confirmPassword: 'Mismatch999!',
  178 |     });
  179 | 
  180 |     await page.locator('button.auth-submit-btn').click();
  181 | 
  182 |     const status = page.locator('p.form-status.error');
  183 |     await expect(status).toBeVisible();
  184 |     await expect(status).toContainText(/Passwords do not match/i);
  185 |   });
  186 | 
  187 |   // TC - AUTH - 005: Candidate Sign-up Password Length Validation (< 8 chars)
  188 |   test('TC - AUTH - 005: Candidate Sign-up Password Length Validation (< 8 chars)', async ({ page }) => {
  189 |     await fillCandidateForm(page, {
  190 |       fullName: 'Short Password Tester',
  191 |       email: generateTestEmail('shortpwd'),
  192 |       password: 'Pass1!',
  193 |       confirmPassword: 'Pass1!',
  194 |     });
  195 | 
  196 |     await page.locator('button.auth-submit-btn').click();
  197 | 
  198 |     const status = page.locator('p.form-status.error');
  199 |     await expect(status).toBeVisible();
  200 |     await expect(status).toContainText(/at least 8 characters/i);
  201 |   });
  202 | 
  203 |   // Additional: Terms of service agreement validation
  204 |   test('Candidate Sign-up Terms & Conditions Validation', async ({ page }) => {
  205 |     await fillCandidateForm(page, {
  206 |       fullName: 'Terms Tester',
  207 |       email: generateTestEmail('terms'),
  208 |       password: VALID_PASSWORD,
  209 |       confirmPassword: VALID_PASSWORD,
  210 |       agreeTerms: false,
  211 |     });
  212 | 
  213 |     await page.locator('button.auth-submit-btn').click();
  214 | 
  215 |     const status = page.locator('p.form-status.error');
> 216 |     await expect(status).toBeVisible();
      |                          ^ Error: expect(locator).toBeVisible() failed
  217 |     await expect(status).toContainText(/agree to the terms/i);
  218 |   });
  219 | 
  220 | });
  221 | 
```