# Implementation Plan - Add Password Strength Checker Problem

This plan outlines the design, implementation, and database seeding strategy to add a new problem, **Password Strength Checker**, to Firecode.

## Problem Description

Write a function `checkPasswordStrength` (or `check_password_strength` in Python) that evaluates the strength of a password string based on five criteria and returns either `"Strong"` or `"Weak"`.

### Criteria:
1. **Length**: Must be at least 8 characters long.
2. **Uppercase**: Must contain at least one uppercase letter `[A-Z]`.
3. **Lowercase**: Must contain at least one lowercase letter `[a-z]`.
4. **Digit**: Must contain at least one digit `[0-9]`.
5. **Special Character**: Must contain at least one special character from the set `[!@#$%^&*]`.

### Constraints:
* `1 <= password.length <= 100`
* `password` consists of printable ASCII characters.

---

## Proposed Changes

We will introduce a database seeding script to insert the **Password Strength Checker** problem into the database using Prisma. This will automatically make the problem available on the platform dashboard for users to solve.

### [Component: Backend Database Seeding]

#### [NEW] [seedPasswordStrength.js](file:///c:/Users/ASUS/Desktop/firecode/backend/prisma/scripts/seedPasswordStrength.js)

We will create a database seeding script to register the new problem. 

* **Admin User ID**: `5dff1889-9468-4f05-be9f-8348fd7ead8e`
* **Title**: `Password Strength Checker`
* **Difficulty**: `EASY`
* **Tags**: `['string', 'regex', 'validation', 'conditionals']`
* **Constraints**: 
  ```text
  1 <= password.length <= 100
  password consists of alphanumeric and special characters (!, @, #, $, %, ^, &, *)
  ```
* **Examples**:
  ```json
  {
    "Example 1": {
      "input": "Pass123!",
      "output": "Strong",
      "explanation": "The password is 8 characters long and satisfies all strength criteria (uppercase, lowercase, digits, and special character)."
    },
    "Example 2": {
      "input": "Short1!",
      "output": "Weak",
      "explanation": "The password length is 7, which is less than the minimum required length of 8 characters."
    }
  }
  ```

* **Test Cases**:
  ```json
  [
    { "input": "Pass123!", "output": "Strong" },
    { "input": "P1a!", "output": "Weak" },
    { "input": "Password123!", "output": "Strong" },
    { "input": "password123!", "output": "Weak" },
    { "input": "PASSWORD123!", "output": "Weak" },
    { "input": "Password!", "output": "Weak" },
    { "input": "Password123", "output": "Weak" },
    { "input": "Abcdef1!", "output": "Strong" },
    { "input": "12345678", "output": "Weak" },
    { "input": "!@#$%^&*", "output": "Weak" },
    { "input": "aB1!aB1!", "output": "Strong" },
    { "input": "Short1!", "output": "Weak" }
  ]
  ```

* **Code Snippets**:
  * **JavaScript**:
    ```javascript
    /**
     * @param {string} password
     * @return {string}
     */
    function checkPasswordStrength(password) {
      // Write your code here
    }

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    rl.on('line', (line) => {
      const result = checkPasswordStrength(line.trim());
      console.log(result);
      rl.close();
    });
    ```
  * **Python**:
    ```python
    class Solution:
        def checkPasswordStrength(self, password: str) -> str:
            # Write your code here
            pass

    if __name__ == "__main__":
        import sys
        password = sys.stdin.readline().strip()
        sol = Solution()
        result = sol.checkPasswordStrength(password)
        print(result)
    ```
  * **Java**:
    ```java
    import java.util.Scanner;

    public class Main {
        public static String checkPasswordStrength(String password) {
            // Write your code here
        }

        public static void main(String[] args) {
            Scanner sc = new Scanner(System.in);
            if (sc.hasNextLine()) {
                String password = sc.nextLine();
                System.out.println(checkPasswordStrength(password));
            }
            sc.close();
        }
    }
    ```

* **Reference Solutions**:
  * **JavaScript**:
    ```javascript
    /**
     * @param {string} password
     * @return {string}
     */
    function checkPasswordStrength(password) {
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasDigits = /[0-9]/.test(password);
      const hasSpecialChar = /[!@#$%^&*]/.test(password);
      
      if (password.length < 8) return "Weak";
      if (hasUppercase && hasLowercase && hasDigits && hasSpecialChar) {
        return "Strong";
      } else {
        return "Weak";
      }
    }

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    rl.on('line', (line) => {
      const result = checkPasswordStrength(line.trim());
      console.log(result);
      rl.close();
    });
    ```
  * **Python**:
    ```python
    import re

    class Solution:
        def checkPasswordStrength(self, password: str) -> str:
            if len(password) < 8:
                return "Weak"
            
            has_uppercase = bool(re.search(r'[A-Z]', password))
            has_lowercase = bool(re.search(r'[a-z]', password))
            has_digits = bool(re.search(r'[0-9]', password))
            has_special = bool(re.search(r'[!@#$%^&*]', password))
            
            if has_uppercase and has_lowercase and has_digits and has_special:
                return "Strong"
            return "Weak"

    if __name__ == "__main__":
        import sys
        password = sys.stdin.readline().strip()
        sol = Solution()
        result = sol.checkPasswordStrength(password)
        print(result)
    ```
  * **Java**:
    ```java
    import java.util.Scanner;
    import java.util.regex.Pattern;

    public class Main {
        public static String checkPasswordStrength(String password) {
            if (password.length() < 8) {
                return "Weak";
            }
            
            boolean hasUppercase = Pattern.compile("[A-Z]").matcher(password).find();
            boolean hasLowercase = Pattern.compile("[a-z]").matcher(password).find();
            boolean hasDigit = Pattern.compile("[0-9]").matcher(password).find();
            boolean hasSpecial = Pattern.compile("[!@#$%^&*]").matcher(password).find();
            
            if (hasUppercase && hasLowercase && hasDigit && hasSpecial) {
                return "Strong";
            }
            return "Weak";
        }

        public static void main(String[] args) {
            Scanner sc = new Scanner(System.in);
            if (sc.hasNextLine()) {
                String password = sc.nextLine();
                System.out.println(checkPasswordStrength(password));
            }
            sc.close();
        }
    }
    ```

---

## Verification Plan

### Automated Execution & Verification
We will run `node prisma/scripts/seedPasswordStrength.js` to perform the database insertion.
The database seeding script will:
1. Verify if the problem is successfully created.
2. Confirm the exact count of problems in the database increases by 1.

### Manual Verification
1. We will verify the API by calling `/api/v1/problems/get-all-problems` using a verification script.
2. We will clean up our temporary `src/dump.js` file from the workspace.
