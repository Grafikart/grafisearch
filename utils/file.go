package utils

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
)

// Read and parse a JSON file
func ParseJsonFile(f string, v any) error {
	// Open the file
	file, err := os.Open(f)
	if err != nil {
		return fmt.Errorf("Error opening the file: %v", err)
	}
	defer file.Close()

	// Read the file content
	bytes, err := io.ReadAll(file)
	if err != nil {
		return fmt.Errorf("Error reading vite manifest file: %v", err)
	}

	// Parse the JSON data
	err = json.Unmarshal(bytes, &v)
	if err != nil {
		return fmt.Errorf("Error parsing vite manifest: %v", err)
	}

	return nil
}
