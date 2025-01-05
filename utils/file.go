package utils

import (
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
)

// Read and parse a JSON file
func ParseJsonFile(f fs.File, v any) error {
	// Read the file content
	bytes, err := io.ReadAll(f)
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
