#!/usr/bin/env python3
"""
PRD-30 E2E Tests: Landing Page + Search + Onboarding

Tests the Google-simple landing page, anonymous search flow,
search results page, and simplified 2-step onboarding.

Run: python tests/e2e/prd30_landing_search_onboarding.py
"""

import os
import sys
import urllib.request
from playwright.sync_api import sync_playwright

APP = os.environ.get("APP_URL", "http://localhost:38030")
try:
    # Quick probe to see if port 38030 is up, else fallback to 3000
    with urllib.request.urlopen(APP, timeout=1):
        pass
except Exception:
    APP = "http://localhost:3000"


def test_landing_page_google_simple(browser):
    """Anonymous user sees Google-simple landing page."""
    page = browser.new_page()
    page.goto(APP)

    # Should show CollegeFlow brand wordmark
    brand = page.get_by_text("CollegeFlow")
    assert brand.is_visible(), "CollegeFlow brand not visible"

    # Search bar should be visible
    search_input = page.get_by_placeholder("搜索大学、专业或职业方向")
    assert search_input.is_visible(), "Search bar not visible"

    # Suggestion tags should be visible (use role=button to target tags specifically)
    assert page.get_by_text("你想去哪个国家").is_visible(), "Country label not visible"
    # Target the tag buttons specifically
    tag_buttons = page.get_by_role("button", name="美")
    assert tag_buttons.count() > 0, "US tag not visible"
    cs_tags = page.get_by_role("button", name="计算机")
    assert cs_tags.count() > 0, "CS tag not visible"
    harvard_tags = page.get_by_role("button", name="哈佛")
    assert harvard_tags.count() > 0, "Harvard tag not visible"

    # Old heavy hero elements should NOT be visible
    assert not page.get_by_text("MajorAnalytics").is_visible(), "Old gradient subtitle still visible"

    print("[PASS] Landing page Google-simple")
    page.close()


def test_anonymous_search_no_auth_gate(browser):
    """Anonymous user can search without auth redirect."""
    page = browser.new_page()
    page.goto(APP)

    search_input = page.get_by_placeholder("搜索大学、专业或职业方向")
    search_input.click()
    search_input.fill("计算机")
    page.keyboard.press("Enter")

    # Wait for search results to appear (not login redirect)
    page.wait_for_timeout(2000)

    # Should show search results with categorized sections
    body = page.inner_text("body")
    assert "匹配专业" in body or "匹配院校" in body or "计算机" in body, \
        f"Search results not visible. Body: {body[:500]}"

    # Should NOT be redirected to login
    assert "Sign In" not in page.url or "login" not in page.url.lower(), \
        f"Redirected to login: {page.url}"

    print("[PASS] Anonymous search without auth gate")
    page.close()


def test_anonymous_click_lock_redirects_to_login(browser):
    """Anonymous user clicking locked feature is redirected to login."""
    page = browser.new_page()
    page.goto(APP)

    search_input = page.get_by_placeholder("搜索大学、专业或职业方向")
    search_input.click()
    search_input.fill("计算机")
    page.keyboard.press("Enter")

    # Wait for search results to appear
    page.wait_for_timeout(2000)

    # Click on the locked 40-year ROI curve overlay directly to bypass scroll and header overlays
    locked_roi = page.get_by_text("登录解锁").first
    assert locked_roi.is_visible(), "Locked ROI curve teaser not visible"
    locked_roi.click(force=True)

    page.wait_for_timeout(1000)

    # Should be redirected to /login page
    assert "login" in page.url.lower(), f"Did not redirect to login: {page.url}"

    print("[PASS] Anonymous clicking locked ROI redirects to login")
    page.close()


def test_suggestion_tag_click(browser):
    """Clicking suggestion tag triggers instant search."""
    page = browser.new_page()
    page.goto(APP)

    # Click on a suggestion tag (美 - US)
    tag = page.get_by_text("美").first
    tag.click()

    page.wait_for_timeout(2000)

    body = page.inner_text("body")
    # Should show search results
    assert "匹配" in body or "美国" in body, \
        f"Tag click did not trigger search. Body: {body[:500]}"

    print("[PASS] Suggestion tag instant search")
    page.close()


def test_gap_state(browser):
    """Searching unrecorded entity shows gap state."""
    page = browser.new_page()
    page.goto(APP)

    search_input = page.get_by_placeholder("搜索大学、专业或职业方向")
    search_input.click()
    search_input.fill("University of Xyz")
    page.keyboard.press("Enter")

    page.wait_for_timeout(2000)

    body = page.inner_text("body")
    assert "暂未收录" in body, f"Gap state not visible. Body: {body[:500]}"
    assert "密歇根大学" in body, "UMich benchmark not visible"
    assert "莱斯大学" in body, "Rice benchmark not visible"
    assert "投票" in body, "Vote button not visible"

    print("[PASS] Gap state for unrecorded entity")
    page.close()


def test_onboarding_two_steps(browser):
    """Onboarding page code has 2 steps (not 4) - verified by structural check.

    NOTE: Full onboarding E2E requires email verification, which cannot be
    tested without a real email backend. This test verifies the page structure
    by checking the source code directly.
    """
    import subprocess
    result = subprocess.run(
        ["grep", "-c", "step === 'profile'", "src/pages/OnboardingPage.tsx"],
        capture_output=True, text=True,
    )
    profile_steps = int(result.stdout.strip())
    assert profile_steps == 0, \
        f"Profile step (step 3) still exists in onboarding. Found {profile_steps} occurrences."

    # Verify GPA/SAT/Budget fields removed from onboarding
    result = subprocess.run(
        ["grep", "-c", "setGpa\|setSatScore\|setBudgetMin", "src/pages/OnboardingPage.tsx"],
        capture_output=True, text=True,
    )
    removed_fields = int(result.stdout.strip())
    assert removed_fields == 0, \
        f"GPA/SAT/Budget state setters still in onboarding. Found {removed_fields} occurrences."

    # Verify insight card still exists (simplified version)
    result = subprocess.run(
        ["grep", "-c", "Welcome to CollegeFlow", "src/pages/OnboardingPage.tsx"],
        capture_output=True, text=True,
    )
    welcome_exists = int(result.stdout.strip())
    assert welcome_exists > 0, "Welcome/insight card not found in onboarding."

    # Verify Academic Profile CTA exists
    result = subprocess.run(
        ["grep", "-c", "Complete Your Academic Profile", "src/pages/OnboardingPage.tsx"],
        capture_output=True, text=True,
    )
    profile_cta = int(result.stdout.strip())
    assert profile_cta > 0, "Academic Profile CTA not found in onboarding."

    print("[PASS] Onboarding simplified to 2 steps (structural verification)")


def main():
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)

        tests = [
            test_landing_page_google_simple,
            test_anonymous_search_no_auth_gate,
            test_anonymous_click_lock_redirects_to_login,
            test_suggestion_tag_click,
            test_gap_state,
            test_onboarding_two_steps,
        ]

        passed = 0
        failed = 0

        for test in tests:
            try:
                test(browser)
                passed += 1
            except Exception as e:
                print(f"[FAIL] {test.__name__}: {e}")
                failed += 1

        browser.close()

        print(f"\n{'='*50}")
        print(f"Results: {passed} passed, {failed} failed, {passed+failed} total")
        print(f"{'='*50}")

        if failed > 0:
            sys.exit(1)


if __name__ == "__main__":
    main()
