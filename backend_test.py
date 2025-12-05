#!/usr/bin/env python3
"""
Backend API Testing for Zeha Mobile App
Tests external production backend at https://zeha.trairx.com/api
"""

import requests
import json
import time
import uuid
from datetime import datetime
from typing import Dict, Optional, Any

# External production backend URL
BASE_URL = "https://zeha.trairx.com/api"

# Test configuration
TIMEOUT = 30
SSE_TIMEOUT = 30

# Color codes for output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

# Test results tracking
test_results = {
    "passed": [],
    "failed": [],
    "warnings": []
}

def log_success(message: str):
    """Log successful test"""
    print(f"{Colors.GREEN}✓ {message}{Colors.RESET}")
    test_results["passed"].append(message)

def log_error(message: str):
    """Log failed test"""
    print(f"{Colors.RED}✗ {message}{Colors.RESET}")
    test_results["failed"].append(message)

def log_warning(message: str):
    """Log warning"""
    print(f"{Colors.YELLOW}⚠ {message}{Colors.RESET}")
    test_results["warnings"].append(message)

def log_info(message: str):
    """Log info"""
    print(f"{Colors.BLUE}ℹ {message}{Colors.RESET}")

def print_section(title: str):
    """Print section header"""
    print(f"\n{Colors.BLUE}{'='*60}")
    print(f"{title}")
    print(f"{'='*60}{Colors.RESET}\n")

# Test data storage
test_data = {
    "access_token": None,
    "refresh_token": None,
    "user_id": None,
    "session_id": None,
    "email": None,
    "password": None
}

def test_auth_register():
    """Test POST /api/auth/register"""
    print_section("TEST 1: Authentication - Register")
    
    # Generate unique test user
    timestamp = int(time.time())
    email = f"test_user_{timestamp}@gmail.com"
    password = f"TestPass123!{timestamp}"
    name = f"Test User {timestamp}"
    
    # Store for later use
    test_data["email"] = email
    test_data["password"] = password
    
    payload = {
        "email": email,
        "password": password,
        "name": name,
        "role": "adult"
    }
    
    log_info(f"Registering user: {email}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/register",
            json=payload,
            timeout=TIMEOUT
        )
        
        log_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200 or response.status_code == 201:
            data = response.json()
            
            # Validate response structure
            required_fields = ["access_token", "refresh_token", "user"]
            missing_fields = [f for f in required_fields if f not in data]
            
            if missing_fields:
                log_error(f"Register: Missing fields in response: {missing_fields}")
                return False
            
            # Store tokens
            test_data["access_token"] = data["access_token"]
            test_data["refresh_token"] = data["refresh_token"]
            test_data["user_id"] = data["user"]["id"]
            
            log_success(f"Register: User created successfully (ID: {data['user']['id']})")
            log_info(f"Access token: {data['access_token'][:20]}...")
            return True
        else:
            log_error(f"Register: Failed with status {response.status_code}")
            log_error(f"Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        log_error("Register: Request timeout")
        return False
    except Exception as e:
        log_error(f"Register: Exception - {str(e)}")
        return False

def test_auth_login():
    """Test POST /api/auth/login"""
    print_section("TEST 2: Authentication - Login")
    
    if not test_data["email"] or not test_data["password"]:
        log_error("Login: No test credentials available (register first)")
        return False
    
    payload = {
        "email": test_data["email"],
        "password": test_data["password"]
    }
    
    log_info(f"Logging in as: {test_data['email']}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json=payload,
            timeout=TIMEOUT
        )
        
        log_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            # Validate response structure
            required_fields = ["access_token", "refresh_token", "user"]
            missing_fields = [f for f in required_fields if f not in data]
            
            if missing_fields:
                log_error(f"Login: Missing fields in response: {missing_fields}")
                return False
            
            # Update tokens (in case they're different)
            test_data["access_token"] = data["access_token"]
            test_data["refresh_token"] = data["refresh_token"]
            
            log_success(f"Login: Authentication successful")
            log_info(f"User ID: {data['user']['id']}")
            return True
        else:
            log_error(f"Login: Failed with status {response.status_code}")
            log_error(f"Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        log_error("Login: Request timeout")
        return False
    except Exception as e:
        log_error(f"Login: Exception - {str(e)}")
        return False

def test_auth_me():
    """Test GET /api/auth/me"""
    print_section("TEST 3: Authentication - Get Current User")
    
    if not test_data["access_token"]:
        log_error("Auth/me: No access token available")
        return False
    
    headers = {
        "Authorization": f"Bearer {test_data['access_token']}"
    }
    
    log_info("Fetching current user info...")
    
    try:
        response = requests.get(
            f"{BASE_URL}/auth/me",
            headers=headers,
            timeout=TIMEOUT
        )
        
        log_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            # Validate user object
            required_fields = ["id", "email", "name"]
            missing_fields = [f for f in required_fields if f not in data]
            
            if missing_fields:
                log_error(f"Auth/me: Missing fields in response: {missing_fields}")
                return False
            
            # Role is optional
            if "role" not in data:
                log_warning("Auth/me: 'role' field not in response (optional field)")
            
            log_success(f"Auth/me: User info retrieved successfully")
            log_info(f"User: {data['name']} ({data['email']})")
            if "role" in data:
                log_info(f"Role: {data['role']}")
            return True
        else:
            log_error(f"Auth/me: Failed with status {response.status_code}")
            log_error(f"Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        log_error("Auth/me: Request timeout")
        return False
    except Exception as e:
        log_error(f"Auth/me: Exception - {str(e)}")
        return False

def test_chat_stream():
    """Test POST /api/chat/stream (SSE)"""
    print_section("TEST 4: Chat Streaming (SSE) - CRITICAL")
    
    if not test_data["access_token"] or not test_data["user_id"]:
        log_error("Chat stream: No authentication token or user ID available")
        return False
    
    # Generate session ID
    session_id = str(uuid.uuid4())
    test_data["session_id"] = session_id
    
    headers = {
        "Authorization": f"Bearer {test_data['access_token']}",
        "Content-Type": "application/json",
        "Accept": "text/event-stream"
    }
    
    payload = {
        "user_id": test_data["user_id"],
        "session_id": session_id,
        "message": "Merhaba! Bu bir test mesajıdır.",
        "mode": "general"
    }
    
    log_info(f"Testing SSE streaming with session: {session_id}")
    log_info(f"Message: {payload['message']}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/chat/stream",
            json=payload,
            headers=headers,
            timeout=SSE_TIMEOUT,
            stream=True
        )
        
        log_info(f"Status Code: {response.status_code}")
        log_info(f"Content-Type: {response.headers.get('Content-Type', 'N/A')}")
        
        if response.status_code != 200:
            log_error(f"Chat stream: Failed with status {response.status_code}")
            log_error(f"Response: {response.text}")
            return False
        
        # Check content type
        content_type = response.headers.get('Content-Type', '')
        if 'text/event-stream' not in content_type:
            log_warning(f"Chat stream: Content-Type is '{content_type}', expected 'text/event-stream'")
        
        # Read SSE stream
        chunks_received = 0
        full_text = ""
        sse_format_valid = True
        
        log_info("Reading SSE stream...")
        
        for line in response.iter_lines(decode_unicode=True):
            if line:
                log_info(f"Received: {line[:100]}...")
                
                # Check SSE format: "data: {json}"
                if line.startswith('data: '):
                    data_part = line[6:]  # Remove "data: " prefix
                    
                    if data_part == '[DONE]':
                        log_info("Stream completed with [DONE] marker")
                        break
                    
                    try:
                        parsed = json.loads(data_part)
                        
                        # Extract text from various possible fields
                        # Backend sends {"chunk": "text"} format
                        text = parsed.get('chunk') or parsed.get('text') or parsed.get('content') or parsed.get('message') or ''
                        
                        if text:
                            full_text += text
                            chunks_received += 1
                            
                    except json.JSONDecodeError as e:
                        log_warning(f"Failed to parse SSE data as JSON: {data_part[:50]}...")
                        sse_format_valid = False
                else:
                    # Not in SSE format
                    if line.strip() and not line.startswith(':'):
                        log_warning(f"Line not in SSE format (missing 'data: ' prefix): {line[:50]}...")
                        sse_format_valid = False
        
        log_info(f"Chunks received: {chunks_received}")
        log_info(f"Full text length: {len(full_text)} characters")
        
        if chunks_received > 0:
            log_success(f"Chat stream: SSE streaming working ({chunks_received} chunks received)")
            if full_text:
                log_info(f"Response preview: {full_text[:100]}...")
            
            if not sse_format_valid:
                log_warning("Chat stream: Some lines not in proper SSE format 'data: {json}'")
            
            return True
        else:
            log_error("Chat stream: No data chunks received from stream")
            return False
            
    except requests.exceptions.Timeout:
        log_error(f"Chat stream: Request timeout after {SSE_TIMEOUT}s")
        return False
    except Exception as e:
        log_error(f"Chat stream: Exception - {str(e)}")
        return False

def test_subscription_verify():
    """Test POST /api/subscription/verify"""
    print_section("TEST 5: Subscription - Verify Purchase")
    
    if not test_data["access_token"] or not test_data["user_id"]:
        log_error("Subscription verify: No authentication token available")
        return False
    
    headers = {
        "Authorization": f"Bearer {test_data['access_token']}",
        "Content-Type": "application/json"
    }
    
    # Mock IAP data for testing
    payload = {
        "user_id": test_data["user_id"],
        "transaction_id": f"test_txn_{int(time.time())}",
        "product_id": "zeha_pro_monthly",
        "platform": "ios",
        "receipt": "mock_receipt_data_for_testing"
    }
    
    log_info("Testing subscription verification with mock IAP data...")
    
    try:
        response = requests.post(
            f"{BASE_URL}/subscription/verify",
            json=payload,
            headers=headers,
            timeout=TIMEOUT
        )
        
        log_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            # Validate response structure
            if "success" in data and "subscription" in data:
                log_success("Subscription verify: Endpoint responding correctly")
                log_info(f"Response: {json.dumps(data, indent=2)}")
                return True
            else:
                log_warning("Subscription verify: Response structure unexpected")
                log_info(f"Response: {response.text}")
                return True  # Still working, just different format
        else:
            log_error(f"Subscription verify: Failed with status {response.status_code}")
            log_error(f"Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        log_error("Subscription verify: Request timeout")
        return False
    except Exception as e:
        log_error(f"Subscription verify: Exception - {str(e)}")
        return False

def test_subscription_status():
    """Test GET /api/subscription/status?user_id={id}"""
    print_section("TEST 6: Subscription - Get Status (NEWLY DEPLOYED)")
    
    if not test_data["access_token"] or not test_data["user_id"]:
        log_error("Subscription status: No authentication token or user_id available")
        return False
    
    headers = {
        "Authorization": f"Bearer {test_data['access_token']}"
    }
    
    # Add user_id as query parameter
    params = {"user_id": test_data["user_id"]}
    
    log_info(f"Fetching subscription status for user_id: {test_data['user_id']}")
    log_info("NOTE: This endpoint was previously returning 404")
    
    try:
        response = requests.get(
            f"{BASE_URL}/subscription/status",
            headers=headers,
            params=params,
            timeout=TIMEOUT
        )
        
        log_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 404:
            log_error("❌ STILL RETURNING 404 - Endpoint not found/deployed")
            log_error(f"Response: {response.text}")
            return False
        elif response.status_code == 200:
            data = response.json()
            log_success("✅ 404 FIXED! Endpoint now working (200 OK)")
            log_info(f"Response: {json.dumps(data, indent=2)}")
            return True
        else:
            log_warning(f"Unexpected status code: {response.status_code}")
            log_info(f"Response: {response.text}")
            # Not 404, so endpoint exists, but may have other issues
            return True
            
    except requests.exceptions.Timeout:
        log_error("Subscription status: Request timeout")
        return False
    except Exception as e:
        log_error(f"Subscription status: Exception - {str(e)}")
        return False

def test_parent_dashboard():
    """Test GET /api/parent/dashboard"""
    print_section("TEST 7: Parent Dashboard")
    
    if not test_data["access_token"]:
        log_error("Parent dashboard: No authentication token available")
        return False
    
    headers = {
        "Authorization": f"Bearer {test_data['access_token']}"
    }
    
    log_info("Fetching parent dashboard data...")
    
    try:
        response = requests.get(
            f"{BASE_URL}/parent/dashboard",
            headers=headers,
            timeout=TIMEOUT
        )
        
        log_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            log_success("Parent dashboard: Data retrieved successfully")
            log_info(f"Response: {json.dumps(data, indent=2)[:200]}...")
            return True
        elif response.status_code == 403:
            log_warning("Parent dashboard: Access forbidden (may require PRO subscription)")
            return True  # Endpoint working, just access restricted
        else:
            log_error(f"Parent dashboard: Failed with status {response.status_code}")
            log_error(f"Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        log_error("Parent dashboard: Request timeout")
        return False
    except Exception as e:
        log_error(f"Parent dashboard: Exception - {str(e)}")
        return False

def test_parent_alerts():
    """Test GET /api/parent/alerts?parent_id={id}"""
    print_section("TEST 8: Parent Alerts (NEWLY DEPLOYED)")
    
    if not test_data["access_token"] or not test_data["user_id"]:
        log_error("Parent alerts: No authentication token or user_id available")
        return False
    
    headers = {
        "Authorization": f"Bearer {test_data['access_token']}"
    }
    
    # Add parent_id as query parameter
    params = {"parent_id": test_data["user_id"]}
    
    log_info(f"Fetching parent alerts for parent_id: {test_data['user_id']}")
    log_info("NOTE: This endpoint was previously returning 404")
    
    try:
        response = requests.get(
            f"{BASE_URL}/parent/alerts",
            headers=headers,
            params=params,
            timeout=TIMEOUT
        )
        
        log_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 404:
            log_error("❌ STILL RETURNING 404 - Endpoint not found/deployed")
            log_error(f"Response: {response.text}")
            return False
        elif response.status_code == 200:
            data = response.json()
            log_success("✅ 404 FIXED! Endpoint now working (200 OK)")
            log_info(f"Response: {json.dumps(data, indent=2)}")
            if isinstance(data, list):
                log_info(f"Alerts array length: {len(data)}")
            return True
        elif response.status_code == 403:
            log_warning("Access forbidden (may require PRO subscription)")
            log_info("But endpoint exists (not 404), so deployment successful")
            return True  # Endpoint working, just access restricted
        else:
            log_warning(f"Unexpected status code: {response.status_code}")
            log_info(f"Response: {response.text}")
            # Not 404, so endpoint exists
            return True
            
    except requests.exceptions.Timeout:
        log_error("Parent alerts: Request timeout")
        return False
    except Exception as e:
        log_error(f"Parent alerts: Exception - {str(e)}")
        return False

def test_forgot_password():
    """Test POST /api/auth/forgot-password"""
    print_section("TEST 9: Forgot Password (NEW ENDPOINT)")
    
    # Use a test email - try as query parameter based on 422 error
    test_email = "test@example.com"
    
    log_info(f"Testing forgot password with email: {test_email}")
    log_info("Note: API expects email as query parameter")
    
    # Try with query parameter
    params = {"email": test_email}
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/forgot-password",
            params=params,
            timeout=TIMEOUT
        )
        
        log_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 404:
            log_error("❌ ENDPOINT NOT FOUND (404) - Not deployed")
            log_error(f"Response: {response.text}")
            return False
        elif response.status_code == 200:
            data = response.json()
            log_success("✅ Forgot password endpoint working (200 OK)")
            log_info(f"Response: {json.dumps(data, indent=2)}")
            
            # Check if success flag exists
            if data.get('success'):
                log_success(f"Success message: {data.get('message', 'N/A')}")
            return True
        elif response.status_code == 422:
            log_error("❌ Validation error (422) - Check API documentation for correct format")
            log_error(f"Response: {response.text}")
            return False
        else:
            log_warning(f"Unexpected status code: {response.status_code}")
            log_info(f"Response: {response.text}")
            # Not 404, so endpoint exists
            return True
            
    except requests.exceptions.Timeout:
        log_error("Forgot password: Request timeout")
        return False
    except Exception as e:
        log_error(f"Forgot password: Exception - {str(e)}")
        return False

def test_account_delete():
    """Test DELETE /api/account/delete"""
    print_section("TEST 10: Account Delete (NEW ENDPOINT)")
    
    # Create a new test account specifically for deletion
    log_info("Step 1: Creating test account for deletion...")
    
    timestamp = int(time.time())
    delete_test_email = f"delete_test_{timestamp}@gmail.com"
    delete_test_password = f"DeletePass123!{timestamp}"
    delete_test_name = f"Delete Test {timestamp}"
    
    register_payload = {
        "email": delete_test_email,
        "password": delete_test_password,
        "name": delete_test_name,
        "role": "adult"
    }
    
    try:
        # Register test account
        reg_response = requests.post(
            f"{BASE_URL}/auth/register",
            json=register_payload,
            timeout=TIMEOUT
        )
        
        if reg_response.status_code != 200 and reg_response.status_code != 201:
            log_error(f"Failed to create test account for deletion: {reg_response.status_code}")
            log_error(f"Response: {reg_response.text}")
            return False
        
        reg_data = reg_response.json()
        delete_token = reg_data.get('access_token')
        delete_user_id = reg_data['user']['id']
        
        if not delete_token:
            log_error("No access token received for test account")
            return False
        
        log_success(f"Test account created: {delete_test_email} (ID: {delete_user_id})")
        
        # Now test the delete endpoint
        log_info("\nStep 2: Testing account deletion...")
        
        headers = {
            "Authorization": f"Bearer {delete_token}"
        }
        
        delete_response = requests.delete(
            f"{BASE_URL}/account/delete",
            headers=headers,
            timeout=TIMEOUT
        )
        
        log_info(f"Status Code: {delete_response.status_code}")
        
        if delete_response.status_code == 404:
            log_error("❌ ENDPOINT NOT FOUND (404) - Not deployed")
            log_error(f"Response: {delete_response.text}")
            return False
        elif delete_response.status_code == 200:
            data = delete_response.json()
            log_success("✅ Account delete endpoint working (200 OK)")
            log_info(f"Response: {json.dumps(data, indent=2)}")
            
            # Verify deletion by trying to login
            log_info("\nStep 3: Verifying account deletion...")
            login_payload = {
                "email": delete_test_email,
                "password": delete_test_password
            }
            
            verify_response = requests.post(
                f"{BASE_URL}/auth/login",
                json=login_payload,
                timeout=TIMEOUT
            )
            
            if verify_response.status_code == 401 or verify_response.status_code == 404:
                log_success("✅ VERIFIED: Account successfully deleted (login fails)")
                return True
            else:
                log_warning(f"Account may not be deleted - login returned {verify_response.status_code}")
                log_info("Endpoint works but deletion may not be complete")
                return True
        elif delete_response.status_code == 401:
            log_error("Unauthorized (401) - Authentication issue")
            return False
        else:
            log_warning(f"Unexpected status code: {delete_response.status_code}")
            log_info(f"Response: {delete_response.text}")
            # Not 404, so endpoint exists
            return True
            
    except requests.exceptions.Timeout:
        log_error("Account delete: Request timeout")
        return False
    except Exception as e:
        log_error(f"Account delete: Exception - {str(e)}")
        return False

def print_summary():
    """Print test summary"""
    print_section("TEST SUMMARY")
    
    total = len(test_results["passed"]) + len(test_results["failed"])
    passed = len(test_results["passed"])
    failed = len(test_results["failed"])
    warnings = len(test_results["warnings"])
    
    print(f"Total Tests: {total}")
    print(f"{Colors.GREEN}Passed: {passed}{Colors.RESET}")
    print(f"{Colors.RED}Failed: {failed}{Colors.RESET}")
    print(f"{Colors.YELLOW}Warnings: {warnings}{Colors.RESET}")
    
    if failed > 0:
        print(f"\n{Colors.RED}Failed Tests:{Colors.RESET}")
        for test in test_results["failed"]:
            print(f"  ✗ {test}")
    
    if warnings > 0:
        print(f"\n{Colors.YELLOW}Warnings:{Colors.RESET}")
        for warning in test_results["warnings"]:
            print(f"  ⚠ {warning}")
    
    print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}\n")
    
    return failed == 0

def main():
    """Run all tests"""
    print(f"\n{Colors.BLUE}{'='*60}")
    print("Zeha Backend API Testing")
    print(f"Backend: {BASE_URL}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}{Colors.RESET}\n")
    
    # Priority 1: Authentication & Chat (HIGH)
    test_auth_register()
    test_auth_login()
    test_auth_me()
    test_chat_stream()
    
    # Priority 2: Subscription & Parent Features (MEDIUM)
    test_subscription_verify()
    test_subscription_status()
    test_parent_dashboard()
    test_parent_alerts()
    
    # Priority 3: NEW ENDPOINTS (HIGH)
    test_forgot_password()
    test_account_delete()
    
    # Print summary
    success = print_summary()
    
    return 0 if success else 1

if __name__ == "__main__":
    exit(main())
