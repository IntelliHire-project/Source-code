import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// ── Mock react-router-dom ─────────────────────────────────────────────────────
// useParams must use a mutable variable so renderDetails(id) actually changes it.
const mockNavigate = jest.fn();
let mockAppId = "1"; // mutable — updated by renderDetails before each render

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useParams: () => ({ applicationId: mockAppId }),
}));

// ── Mock CandidatePageContext ─────────────────────────────────────────────────
const mockSetPageLabel = jest.fn();
jest.mock("../CandidateDashboard/CandidateDashboard", () => ({
  CandidatePageContext: require("react").createContext({
    setPageLabel: jest.fn(),
  }),
}));

import ApplicationDetails from "./ApplicationDetails";
import { CandidatePageContext } from "../CandidateDashboard/CandidateDashboard";

// Helper: render ApplicationDetails for a specific application ID
function renderDetails(appId = "1") {
  mockAppId = appId;
  return render(
    <CandidatePageContext.Provider value={{ setPageLabel: mockSetPageLabel }}>
      <ApplicationDetails />
    </CandidatePageContext.Provider>
  );
}

// =============================================================================
// TC-APP-015 to TC-APP-026 — Application Details Page
// =============================================================================

describe("ApplicationDetails — TC-APP-015 to TC-APP-026", () => {

  beforeEach(() => {
    mockNavigate.mockClear();
    mockSetPageLabel.mockClear();
  });

  test("TC-APP-015: renders correct header info for application ID 1", () => {
    renderDetails("1");
    expect(screen.getByText("Senior Frontend Engineer")).toBeInTheDocument();
    expect(screen.getByText("TechFlow Systems")).toBeInTheDocument();
    expect(screen.getByText("Remote (NYC Based)")).toBeInTheDocument();
    expect(screen.getByText("APP-99281-X")).toBeInTheDocument();
    const dateElements = screen.getAllByText(/Oct 28, 2024/);
    expect(dateElements.length).toBeGreaterThanOrEqual(1);
  });

  test("TC-APP-016: Assessment step is active for Assessment Invited (ID 1)", () => {
    renderDetails("1");
    const allAssessmentEls = screen.getAllByText("Assessment");
    const activeLabel = allAssessmentEls.find(el =>
      el.classList.contains("app-card__step-label--active")
    );
    expect(activeLabel).toBeTruthy();
  });

  test("TC-APP-017: Interview step is active for Interview Scheduled (ID 2)", () => {
    renderDetails("2");
    const allInterviewEls = screen.getAllByText("Interview");
    const activeLabel = allInterviewEls.find(el =>
      el.classList.contains("app-card__step-label--active")
    );
    expect(activeLabel).toBeTruthy();
  });

  test("TC-APP-018: Rejected application (ID 3) — job title visible, no withdraw button", () => {
    renderDetails("3");
    expect(screen.getByText("Full Stack Developer")).toBeInTheDocument();
    expect(screen.getByText("Financier AI")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /withdraw application/i })).not.toBeInTheDocument();
  });

  test("TC-APP-019: Withdrawn application (ID 4) — job title visible, no withdraw button", () => {
    renderDetails("4");
    expect(screen.getByText("Cloud Architect")).toBeInTheDocument();
    expect(screen.getByText("SkyScale Solutions")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /withdraw application/i })).not.toBeInTheDocument();
  });

  test("TC-APP-020: Application Summary card shows About, Next Step and Timeline", () => {
    renderDetails("1");
    expect(screen.getByText("Application Summary")).toBeInTheDocument();
    expect(screen.getByText(/Submitted application with CV/i)).toBeInTheDocument();
    expect(screen.getByText("Next Step")).toBeInTheDocument();
    expect(screen.getByText(/recruiter has sent an optional assessment/i)).toBeInTheDocument();
    const dateMatches = screen.getAllByText(/Oct 28, 2024/);
    expect(dateMatches.length).toBeGreaterThanOrEqual(1);
  });

  test("TC-APP-021: Assessment card shows 92/100 passed for application ID 2", () => {
    renderDetails("2");
    expect(screen.getByText("92")).toBeInTheDocument();
    expect(screen.getByText(/Design Skills Assessment/i)).toBeInTheDocument();
    expect(screen.getByText(/Completed Oct 25, 2024/i)).toBeInTheDocument();
    const barFill = document.querySelector(".application-detail__assessment-bar-fill");
    expect(barFill).toHaveClass("application-detail__assessment-bar-fill--passed");
  });

  test("TC-APP-022: Assessment card shows 54/100 failed for application ID 3", () => {
    renderDetails("3");
    expect(screen.getByText("54")).toBeInTheDocument();
    expect(screen.getByText(/Full Stack Technical Assessment/i)).toBeInTheDocument();
    const barFill = document.querySelector(".application-detail__assessment-bar-fill");
    expect(barFill).not.toHaveClass("application-detail__assessment-bar-fill--passed");
  });

  test("TC-APP-023: Assessment card shows no assessment for application ID 4", () => {
    renderDetails("4");
    expect(screen.getByText(/no assessment taken for this application/i)).toBeInTheDocument();
  });

  test("TC-APP-024: Interview Phase card shows upcoming interviews for application ID 2", () => {
    renderDetails("2");
    expect(screen.getByText("Interview Phase")).toBeInTheDocument();
    expect(screen.getByText("Total Interviews")).toBeInTheDocument();
    expect(screen.getByText(/Round 2 — Design Challenge/i)).toBeInTheDocument();
    // Date+time are in one span: "Nov 8, 2024 • 10:00 AM" — use regex
    expect(screen.getByText(/Nov 8, 2024/)).toBeInTheDocument();
    // Interviewer rendered as "Video Call • Interviewer: Sarah Kim" — use regex
    expect(screen.getByText(/Sarah Kim/)).toBeInTheDocument();
    const joinButtons = screen.getAllByRole("button", { name: /join link/i });
    expect(joinButtons).toHaveLength(2);
  });

  test("TC-APP-025: Interview Phase shows no interviews for application ID 3", () => {
    renderDetails("3");
    expect(screen.getByText(/no interviews scheduled for this application/i)).toBeInTheDocument();
  });

  test("TC-APP-026: Back button navigates to /candidate/applications", () => {
    renderDetails("1");
    fireEvent.click(screen.getByRole("button", { name: /back to my applications/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/candidate/applications");
  });

});

// =============================================================================
// TC-APP-027 to TC-APP-034 — Withdraw Application Flow
// =============================================================================

describe("Withdraw Application — TC-APP-027 to TC-APP-034", () => {

  beforeEach(() => {
    mockNavigate.mockClear();
    mockSetPageLabel.mockClear();
  });

  test("TC-APP-027: Withdraw button visible for active application (ID 1)", () => {
    renderDetails("1");
    expect(screen.getByRole("button", { name: /withdraw application/i })).toBeInTheDocument();
  });

  test("TC-APP-028: Withdraw button NOT visible for Rejected application (ID 3)", () => {
    renderDetails("3");
    expect(screen.queryByRole("button", { name: /withdraw application/i })).not.toBeInTheDocument();
  });

  test("TC-APP-029: Withdraw button NOT visible for Withdrawn application (ID 4)", () => {
    renderDetails("4");
    expect(screen.queryByRole("button", { name: /withdraw application/i })).not.toBeInTheDocument();
  });

  test("TC-APP-030: clicking Withdraw opens confirmation modal", () => {
    renderDetails("1");
    expect(screen.queryByText(/withdraw this application\?/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /withdraw application/i }));
    expect(screen.getByText(/withdraw this application\?/i)).toBeInTheDocument();
    expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^cancel$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /yes, withdraw/i })).toBeInTheDocument();
  });

  test("TC-APP-031: Cancel closes modal without changing status", () => {
    renderDetails("1");
    fireEvent.click(screen.getByRole("button", { name: /withdraw application/i }));
    fireEvent.click(screen.getByRole("button", { name: /^cancel$/i }));
    expect(screen.queryByText(/withdraw this application\?/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /withdraw application/i })).toBeInTheDocument();
    const appliedLabel = screen.getByText("Applied");
    expect(appliedLabel).not.toHaveClass("app-card__step-label--active");
  });

  test("TC-APP-032: clicking overlay closes the modal", () => {
    renderDetails("1");
    fireEvent.click(screen.getByRole("button", { name: /withdraw application/i }));
    expect(screen.getByText(/withdraw this application\?/i)).toBeInTheDocument();
    const overlay = document.querySelector(".withdraw-overlay");
    expect(overlay).toBeInTheDocument();
    fireEvent.click(overlay);
    expect(screen.queryByText(/withdraw this application\?/i)).not.toBeInTheDocument();
  });

  test("TC-APP-033: confirming withdraw hides the Withdraw button", async () => {
    renderDetails("1");
    fireEvent.click(screen.getByRole("button", { name: /withdraw application/i }));
    fireEvent.click(screen.getByRole("button", { name: /yes, withdraw/i }));
    expect(screen.queryByText(/withdraw this application\?/i)).not.toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /withdraw application/i })).not.toBeInTheDocument();
    });
  });

  test("TC-APP-034: after withdrawing, Applied becomes the active step", async () => {
    renderDetails("1");
    fireEvent.click(screen.getByRole("button", { name: /withdraw application/i }));
    fireEvent.click(screen.getByRole("button", { name: /yes, withdraw/i }));
    await waitFor(() => {
      const appliedLabel = screen.getByText("Applied");
      expect(appliedLabel).toHaveClass("app-card__step-label--active");
    });
  });

});
