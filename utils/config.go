package utils

import (
	_ "embed"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

type ConfigMap struct {
	Addr    string            `json:"addr"`
	Filters map[string]string `json:"filters"`
	Bangs   map[string]string `json:"bangs"`
}

var Config ConfigMap

//go:embed config.json
var configFileTemplate string

var templates = map[string]string{
	"config.json": configFileTemplate,
}

func ReadConfigFile() error {
	path, err := ConfigFilePath("config.json")
	if err != nil {
		return err
	}

	file, err := readFile(path)
	if err != nil {
		return err
	}
	defer file.Close()

	dec := json.NewDecoder(file)
	if err := dec.Decode(&Config); err != nil {
		return err
	}

	return err
}

func readFile(path string) (*os.File, error) {
	file_content, err := os.Open(path)
	if err != nil {
		if os.IsNotExist(err) {
			file, err := os.Create(path)
			if err != nil {
				return nil, err
			}

			file_name := filepath.Base(path)
			_, err = file.Write([]byte(templates[file_name]))
			if err != nil {
				return nil, err
			}

			return readFile(path)
		}
	}

	return file_content, nil
}

func ConfigFilePath(file string) (string, error) {
	dir, err := ConfigDir()
	if err != nil {
		return "", err
	}

	return fmt.Sprintf("%s/%s", dir, file), nil
}

func ConfigDir() (string, error) {
	var base_dir string

	config_dir, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}

	base_dir = filepath.Join(config_dir, "grafisearch")
	if err := os.MkdirAll(base_dir, 0755); err != nil {
		return "", err
	}

	return base_dir, nil
}
