A tool that accesses the strength of a password based on criteria such as length, presence of uppercase and lowercase letters, numbers and special characters. Provide feedback to users on the password's strength.
Password strength checker
Real-time analysis — nothing leaves your device
Scoring system
The checker awards up to 9 points across 8 criteria:
CriterionPointsLength ≥ 8+1Length ≥ 12+1Length ≥ 16+1Uppercase letters (A–Z)+1Lowercase letters (a–z)+1Numbers (0–9)+1Special characters (!@#…)+2 (double weight)No common patterns+1
5-segment strength bar — maps score ranges (0–1 → Very Weak through 8–9 → Very Strong) to a color-coded meter that transitions smoothly as you type.
Entropy display — calculates length × log₂(pool_size) bits, where pool size grows with each character type used. This is the industry-standard way to quantify how long a brute-force attack would take.
Character map — the signature visual: each character in your password renders as a color-coded tile — purple for uppercase, teal for lowercase, amber for numbers, coral for specials. It gives you an instant visual fingerprint of your password's composition without revealing the actual characters (unless you toggle the eye).
Pattern detection — flags common sequences like 123, qwerty, abc, password, and 3+ repeated characters (e.g. aaaa).
Password generator — guarantees at least 2 of each character type, then fills the rest randomly and shuffles everything for true unpredictability.
<img width="990" height="812" alt="Screenshot 2026-06-19 114723" src="https://github.com/user-attachments/assets/fba09731-c8eb-4751-a5eb-636ef15d5a85" />
