import requests
import sys
import json
from datetime import datetime

class CornerSpotterAPITester:
    def __init__(self, base_url="https://corner-spotter.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        
    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                except:
                    print(f"   Response: {response.text[:200]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")

            return success, response.json() if response.headers.get('content-type') == 'application/json' else response.text

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_healthcheck(self):
        """Test healthcheck endpoint"""
        success, response = self.run_test(
            "Healthcheck",
            "GET", 
            "/",
            200
        )
        return success

    def test_stats(self):
        """Test stats endpoint"""
        success, response = self.run_test(
            "Get Statistics",
            "GET",
            "/stats",
            200
        )
        return success and isinstance(response, dict)

    def test_settings_get(self):
        """Test get settings"""
        success, response = self.run_test(
            "Get Analysis Settings",
            "GET",
            "/settings", 
            200
        )
        return success and isinstance(response, dict)

    def test_settings_update(self):
        """Test update settings"""
        settings_data = {
            "min_probability": 65.0,
            "min_odds": 1.25,
            "max_odds": 2.00,
            "auto_send_telegram": False
        }
        success, response = self.run_test(
            "Update Analysis Settings",
            "PUT",
            "/settings",
            200,
            data=settings_data
        )
        return success

    def test_telegram_config_get(self):
        """Test get telegram config"""
        success, response = self.run_test(
            "Get Telegram Config",
            "GET",
            "/telegram/config",
            200
        )
        return success and isinstance(response, dict)

    def test_telegram_config_save(self):
        """Test save telegram config"""
        telegram_data = {
            "bot_token": "123456789:ABCDEFGHIJKLMNOP-test-token",
            "chat_id": "-1001234567890", 
            "enabled": True
        }
        success, response = self.run_test(
            "Save Telegram Config",
            "POST",
            "/telegram/config",
            200,
            data=telegram_data
        )
        return success

    def test_signals_crud(self):
        """Test signals CRUD operations"""
        # Test GET signals
        get_success, _ = self.run_test(
            "Get Signals",
            "GET",
            "/signals",
            200
        )
        
        # Test POST signal
        signal_data = {
            "home_team": "Manchester City",
            "away_team": "Liverpool",
            "league": "Premier League", 
            "match_time": "45'",
            "is_live": True,
            "corner_line": "Over 9.5",
            "odds": 1.85,
            "probability": 54.1
        }
        
        post_success, post_response = self.run_test(
            "Create Signal",
            "POST", 
            "/signals",
            200,
            data=signal_data
        )
        
        signal_id = None
        if post_success and isinstance(post_response, dict):
            signal_data_response = post_response.get('signal', {})
            signal_id = signal_data_response.get('id')
        
        # Test DELETE signal if we have an ID
        delete_success = True
        if signal_id:
            delete_success, _ = self.run_test(
                "Delete Signal",
                "DELETE",
                f"/signals/{signal_id}",
                200
            )
        
        return get_success and post_success and delete_success

    def test_game_analysis(self):
        """Test game analysis endpoint"""
        analysis_data = {
            "home_team": "Barcelona", 
            "away_team": "Real Madrid",
            "league": "La Liga",
            "match_time": "15:00",
            "is_live": False,
            "corners_data": [
                {"line": "Over 9.5", "odds": 1.75},
                {"line": "Over 10.5", "odds": 2.10},
                {"line": "Under 8.5", "odds": 2.50}
            ]
        }
        
        success, response = self.run_test(
            "Game Analysis",
            "POST",
            "/analyze", 
            200,
            data=analysis_data
        )
        return success

def main():
    print("🚀 Starting Corner Spotter API Tests...")
    print("=" * 50)
    
    tester = CornerSpotterAPITester()
    
    # Run all tests
    tests = [
        ("Healthcheck", tester.test_healthcheck),
        ("Stats", tester.test_stats), 
        ("Settings GET", tester.test_settings_get),
        ("Settings UPDATE", tester.test_settings_update),
        ("Telegram Config GET", tester.test_telegram_config_get),
        ("Telegram Config SAVE", tester.test_telegram_config_save),
        ("Signals CRUD", tester.test_signals_crud),
        ("Game Analysis", tester.test_game_analysis)
    ]
    
    results = {}
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
            results[test_name] = False
    
    # Print summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} {test_name}")
    
    print(f"\n🏆 Total: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    # Return exit code
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())