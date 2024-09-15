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

func TestUrlUnescape(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"http%3A%2F%2Fexample.com", "http://example.com"},
		{"https%3A%2F%2Fexample.com", "https://example.com"},
	}

	for _, test := range tests {
		result := UrlUnescape(test.input)
		if result != test.expected {
			t.Errorf("UrlUnescape(%q) = %q; expected %q", test.input, result, test.expected)
		}
	}
}

func TestExtractBangs(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"!g google search", "!g"},
		{"Hello !g World", "!g"},
		{"Hello !g", "!g"},
		{"There is !multichar", "!multichar"},
		{"No bangs here", ""},
		{"!123 should not be included", ""},
	}

	for _, test := range tests {
		result := ExtractBang(test.input) // Assuming extractBangs is the correct function name
		if result != test.expected {
			t.Errorf("extractBangs(%q) = %q; expected %q", test.input, result, test.expected)
		}
	}
}
