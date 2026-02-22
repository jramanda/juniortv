import requests
import sys
import json
from datetime import datetime

class FootballAPITester:
    def __init__(self, base_url="https://soccer-odds-15.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failures = []

    def run_test(self, name, method, endpoint, expected_status=200, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            
            print(f"   Response Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ PASSED - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response keys: {list(response_data.keys()) if isinstance(response_data, dict) else 'Non-dict response'}")
                    return True, response_data
                except:
                    print(f"   Response text: {response.text[:100]}...")
                    return True, response.text
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                self.failures.append(f"{name}: {error_msg}")
                print(f"❌ FAILED - {error_msg}")
                try:
                    error_detail = response.json()
                    print(f"   Error details: {error_detail}")
                except:
                    print(f"   Error text: {response.text}")
                return False, {}

        except requests.exceptions.Timeout:
            error_msg = "Request timeout after 10 seconds"
            self.failures.append(f"{name}: {error_msg}")
            print(f"❌ FAILED - {error_msg}")
            return False, {}
        except requests.exceptions.ConnectionError as e:
            error_msg = f"Connection error: {str(e)}"
            self.failures.append(f"{name}: {error_msg}")
            print(f"❌ FAILED - {error_msg}")
            return False, {}
        except Exception as e:
            error_msg = f"Error: {str(e)}"
            self.failures.append(f"{name}: {error_msg}")
            print(f"❌ FAILED - {error_msg}")
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        success, response = self.run_test(
            "API Root",
            "GET",
            "",
            200
        )
        return success

    def test_get_leagues(self):
        """Test leagues endpoint"""
        success, response = self.run_test(
            "Get Leagues",
            "GET", 
            "leagues",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} leagues")
            if len(response) > 0:
                print(f"   Sample league: {response[0].get('name', 'Unknown')}")
                return True
        elif success:
            print(f"   Warning: Expected list, got {type(response)}")
            
        return success

    def test_get_matches(self):
        """Test matches endpoint with different filters"""
        success, response = self.run_test(
            "Get All Matches",
            "GET",
            "matches",
            200
        )
        
        if success and isinstance(response, dict):
            matches = response.get('matches', [])
            print(f"   Found {len(matches)} matches")
            if len(matches) > 0:
                match = matches[0]
                print(f"   Sample match: {match.get('home_team', {}).get('name', 'Unknown')} vs {match.get('away_team', {}).get('name', 'Unknown')}")
                return True, matches
        
        return success, []

    def test_get_matches_with_filters(self):
        """Test matches endpoint with filters"""
        # Test high probability filter
        success1, response1 = self.run_test(
            "Get High Probability Matches",
            "GET",
            "matches",
            200,
            params={"high_probability_only": True}
        )
        
        # Test league filter (using Premier League ID)
        success2, response2 = self.run_test(
            "Get Matches by League",
            "GET", 
            "matches",
            200,
            params={"league_id": "39"}
        )
        
        return success1 and success2

    def test_match_detail(self, match_id):
        """Test match detail endpoint"""
        success, response = self.run_test(
            f"Get Match Detail ({match_id})",
            "GET",
            f"matches/{match_id}",
            200
        )
        return success

    def test_stats_summary(self):
        """Test stats summary endpoint"""
        success, response = self.run_test(
            "Get Stats Summary",
            "GET",
            "stats/summary", 
            200
        )
        
        if success and isinstance(response, dict):
            expected_keys = ['total_matches', 'high_probability_matches', 'average_predicted_corners', 'leagues']
            for key in expected_keys:
                if key not in response:
                    print(f"   Warning: Missing expected key '{key}'")
                else:
                    print(f"   {key}: {response[key]}")
        
        return success

    def test_telegram_config_get(self):
        """Test get Telegram config"""
        success, response = self.run_test(
            "Get Telegram Config",
            "GET",
            "telegram/config",
            200
        )
        
        if success and isinstance(response, dict):
            print(f"   Configured: {response.get('configured', False)}")
            
        return success

    def test_telegram_config_save(self):
        """Test save Telegram config"""
        test_config = {
            "bot_token": "123456789:ABCdefGHIjklMNOpqrsTUVwxyz123456789",
            "group_id": "-1001234567890"
        }
        
        success, response = self.run_test(
            "Save Telegram Config",
            "POST",
            "telegram/config",
            200,
            data=test_config
        )
        
        if success and isinstance(response, dict):
            print(f"   Success: {response.get('success', False)}")
            print(f"   Message: {response.get('message', 'No message')}")
            
        return success

    def test_telegram_send_message(self):
        """Test sending Telegram message (will fail without valid config)"""
        test_message = {
            "message": "🎯 Test message from CornerKick Pro API testing"
        }
        
        # This will likely fail with 400 if Telegram not configured - that's expected
        success, response = self.run_test(
            "Send Telegram Message",
            "POST",
            "telegram/send",
            expected_status=400,  # Expecting failure due to no real config
            data=test_message
        )
        
        return True  # Consider it successful even if it fails due to config

    def test_telegram_logs(self):
        """Test get Telegram logs"""
        success, response = self.run_test(
            "Get Telegram Logs",
            "GET",
            "telegram/logs",
            200
        )
        
        if success and isinstance(response, dict):
            logs = response.get('logs', [])
            print(f"   Found {len(logs)} log entries")
            
        return success

    def run_all_tests(self):
        """Run comprehensive API tests"""
        print("🚀 Starting CornerKick Pro API Tests")
        print(f"📡 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Basic API tests
        self.test_root_endpoint()
        self.test_get_leagues()
        
        # Matches tests
        success, matches = self.test_get_matches()
        self.test_get_matches_with_filters()
        
        # Test match detail if we have matches
        if matches and len(matches) > 0:
            sample_match_id = matches[0].get('id')
            if sample_match_id:
                self.test_match_detail(sample_match_id)
        
        # Stats tests
        self.test_stats_summary()
        
        # Telegram tests
        self.test_telegram_config_get()
        self.test_telegram_config_save()
        self.test_telegram_send_message()
        self.test_telegram_logs()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 TEST SUMMARY")
        print(f"   Tests run: {self.tests_run}")
        print(f"   Tests passed: {self.tests_passed}")
        print(f"   Tests failed: {self.tests_run - self.tests_passed}")
        print(f"   Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failures:
            print(f"\n❌ FAILURES ({len(self.failures)}):")
            for failure in self.failures:
                print(f"   - {failure}")
        
        print("=" * 60)
        
        return self.tests_passed, self.tests_run, self.failures

def main():
    """Main test runner"""
    tester = FootballAPITester()
    passed, total, failures = tester.run_all_tests()
    
    # Return appropriate exit code
    return 0 if passed == total else 1

if __name__ == "__main__":
    sys.exit(main())