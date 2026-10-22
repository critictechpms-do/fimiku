
import os
import sys
import requests
from dotenv import load_dotenv

# Load environment variables from backend/.env
load_dotenv()

SHIPROCKET_EMAIL = os.getenv("SHIPROCKET_EMAIL")
SHIPROCKET_PASSWORD = os.getenv("SHIPROCKET_PASSWORD")

def test_shiprocket_connection():
    print("Testing Shiprocket API connection...")

    if not SHIPROCKET_EMAIL or not SHIPROCKET_PASSWORD:
        print("\nERROR: Shiprocket credentials are missing.")
        print("Add SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD to your .env file.")
        sys.exit(1)

    url = "https://apiv2.shiprocket.in/v1/external/auth/login"

    payload = {
        "email": SHIPROCKET_EMAIL,
        "password": SHIPROCKET_PASSWORD,
    }

    try:
        response = requests.post(
            url,
            json=payload,
            timeout=20,
        )

        if response.status_code == 200:
            data = response.json()

            if data.get("token"):
                print("\nSUCCESS: Shiprocket API connected!")
                print("Authentication successful.")
                print("Your credentials are working.")
                print("No token or password will be displayed.")
                return

        try:
            print("Shiprocket response:", response.text[:1000])
        except Exception:
            print("Could not read the error response.")

        if response.status_code in (400, 401, 403):
            print("Check your Shiprocket API username and password.")
        else:
            print("Check the Shiprocket API response and try again.")

    except requests.exceptions.Timeout:
        print("\nERROR: The Shiprocket API request timed out.")

    except requests.exceptions.ConnectionError:
        print("\nERROR: Could not connect to Shiprocket.")
        print("Check your internet connection.")

    except requests.exceptions.RequestException as error:
        print("\nERROR: Request failed:", type(error).__name__)

    except ValueError:
        print("\nERROR: Shiprocket returned an invalid response.")

if __name__ == "__main__":
    test_shiprocket_connection()
