package utils

import (
	_ "embed"
	"encoding/json"
	"fmt"
	"os"
	"os/user"
	"runtime"
)

type ConfigMap struct {
	Addr    string            `json:"addr"`
	Filters map[string]string `json:"filters"`
	Bangs   map[string]string `json:"bangs"`
}

var Config ConfigMap

//go:embed config.json
var configFileTemplate string

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
	dec.Decode(&Config)

	return err
}

func readFile(path string) (*os.File, error) {
	file_content, err := os.Open(path)
	if err != nil {
		if os.IsNotExist(err) {
			dir, err := ConfigDir()
			if err != nil {
				return nil, err
			}

			if err = os.MkdirAll(dir, 0755); err != nil {
				return nil, err
			}

			file, err := os.Create(path)
			if err != nil {
				return nil, err
			}

			_, err = file.Write([]byte(configFileTemplate))
			if err != nil {
				return nil, err
			} else {
				return readFile(path)
			}
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

	user, err := user.Current()
	if err != nil {
		return "", err
	}

	home := user.HomeDir

	switch runtime.GOOS {
	case "linux":
		xdg_config_home := os.Getenv("XDG_CONFIG_HOME")
		if xdg_config_home != "" {
			base_dir = fmt.Sprintf("%s/%s", xdg_config_home, "grafiksearch")
		} else {
			base_dir = fmt.Sprintf("%s/.config/grafisearch", home)
		}
	}

	return base_dir, nil
}
