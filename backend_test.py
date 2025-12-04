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
    """Test GET /api/subscription/status"""
    print_section("TEST 6: Subscription - Get Status")
    
    if not test_data["access_token"]:
        log_error("Subscription status: No authentication token available")
        return False
    
    headers = {
        "Authorization": f"Bearer {test_data['access_token']}"
    }
    
    log_info("Fetching subscription status...")
    
    try:
        response = requests.get(
            f"{BASE_URL}/subscription/status",
            headers=headers,
            timeout=TIMEOUT
        )
        
        log_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            # Validate response structure
            if "status" in data:
                log_success(f"Subscription status: Retrieved successfully")
                log_info(f"Status: {data.get('status', 'N/A')}")
                log_info(f"Response: {json.dumps(data, indent=2)}")
                return True
            else:
                log_warning("Subscription status: Response structure unexpected")
                log_info(f"Response: {response.text}")
                return True  # Still working
        else:
            log_error(f"Subscription status: Failed with status {response.status_code}")
            log_error(f"Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        log_error("Subscription status: Request timeout")
        return False
    except Exception as e:
        log_error(f"Subscription status: Exception - {str(e)}")
        return False

def test_parent_dashboard():
    """Test POST /api/parent/dashboard"""
    print_section("TEST 7: Parent Dashboard")
    
    if not test_data["access_token"]:
        log_error("Parent dashboard: No authentication token available")
        return False
    
    headers = {
        "Authorization": f"Bearer {test_data['access_token']}",
        "Content-Type": "application/json"
    }
    
    log_info("Fetching parent dashboard data...")
    
    try:
        response = requests.post(
            f"{BASE_URL}/parent/dashboard",
            headers=headers,
            json={},
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
    """Test GET /api/parent/alerts"""
    print_section("TEST 8: Parent Alerts")
    
    if not test_data["access_token"]:
        log_error("Parent alerts: No authentication token available")
        return False
    
    headers = {
        "Authorization": f"Bearer {test_data['access_token']}"
    }
    
    log_info("Fetching parent alerts...")
    
    try:
        response = requests.get(
            f"{BASE_URL}/parent/alerts",
            headers=headers,
            timeout=TIMEOUT
        )
        
        log_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            log_success("Parent alerts: Data retrieved successfully")
            log_info(f"Response: {json.dumps(data, indent=2)[:200]}...")
            return True
        elif response.status_code == 403:
            log_warning("Parent alerts: Access forbidden (may require PRO subscription)")
            return True  # Endpoint working, just access restricted
        else:
            log_error(f"Parent alerts: Failed with status {response.status_code}")
            log_error(f"Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        log_error("Parent alerts: Request timeout")
        return False
    except Exception as e:
        log_error(f"Parent alerts: Exception - {str(e)}")
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
    
    # Print summary
    success = print_summary()
    
    return 0 if success else 1

if __name__ == "__main__":
    exit(main())
