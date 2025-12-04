#!/usr/bin/env python3
"""
Simple test script to verify the emoji rewriting logic
"""

from app import add_emoji_to_message


def test_emoji_addition():
    """Test that emoji is correctly added to messages."""
    test_cases = [
        ("Hello world", "Hello world 😊"),
        ("Good morning!", "Good morning! 😊"),
        ("", " 😊"),
        ("Already has emoji 🎉", "Already has emoji 🎉 😊"),
    ]

    print("Testing emoji addition function:\n")
    all_passed = True

    for original, expected in test_cases:
        result = add_emoji_to_message(original)
        passed = result == expected

        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: '{original}' -> '{result}'")

        if not passed:
            print(f"  Expected: '{expected}'")
            all_passed = False

    print("\n" + ("="*50))
    if all_passed:
        print("✅ All tests passed!")
    else:
        print("❌ Some tests failed")

    return all_passed


if __name__ == "__main__":
    test_emoji_addition()
