package utils

import (
	"regexp"

	"golang.org/x/crypto/bcrypt"
)

// HashString hashes the input string using bcrypt and returns the hashed string or an error.
func HashString(data string) (string, error) {
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(data), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedBytes), nil
}

// ValidateEmail is used to validate if email is in a correct format or not
func ValidateEmail(email string) bool {
	re := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	return re.MatchString(email)
}

// IsPhoneValid checks if a phone number is valid.
// This example allows digits, optional + at start, spaces, dashes, and parentheses.
func IsPhoneValid(phone string) bool {
	var phoneRegex = regexp.MustCompile(`^\+?[\d\s\-\(\)]{7,15}$`)
	return phoneRegex.MatchString(phone)
}
