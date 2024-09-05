package utils

import "testing"

func TestIsUrl(t *testing.T) {
	tests := []struct {
		input    string
		expected bool
	}{
		{"http://example.com", true},
		{"https://example.com", true},
		{"ftp://example.com", false},
		{"example.com", false},
		{"http.cat", false},
		{"http cat", false},
	}

	for _, test := range tests {
		result := IsUrl(test.input)
		if result != test.expected {
			t.Errorf("IsUrl(%q) = %v; expected %v", test.input, result, test.expected)
		}
	}
}
