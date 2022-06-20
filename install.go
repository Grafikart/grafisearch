package main

import (
	"bytes"
	_ "embed"
	"fmt"
	"os"
	"os/exec"
	"os/user"
	"path/filepath"
	"runtime"
	"text/template"

	"github.com/fatih/color"
)

type appInfo struct {
	Path string
}

//go:embed install/com.grafisearch.plist
var macOSService string

func installApp() {
	var err error
	switch runtime.GOOS {
	case "darwin":
		err = installAppMacOS()
	default:
		err = fmt.Errorf("Système d'exploitation non géré")
	}
	if err != nil {
		panic(err)
	}
}

func installAppMacOS() error {
	exePath, err := getCurrentExecPath()
	if err != nil {
		return err
	}

	t, err := template.New("com.grafisearch.plist").Parse(macOSService)
	if err != nil {
		return fmt.Errorf("Impossible de parser le template %w", err)
	}

	user, err := user.Current()
	if err != nil {
		return fmt.Errorf("Impossible de récupérer l'utilisateur courant %w", err)
	}
	home := user.HomeDir
	plistPath := filepath.Join(home, "Library/LaunchAgents/com.grafikart.grafisearch.plist")
	f, err := os.Create(plistPath)
	if err != nil {
		return fmt.Errorf("Impossible de créer le fichier plist %w", err)
	}

	t.Execute(f, appInfo{Path: exePath})
	cmd := exec.Command("launchctl", "load", plistPath)
	var out bytes.Buffer
	var stderr bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &stderr
	err = cmd.Run()
	if err != nil {
		return fmt.Errorf("Impossible d'éxécuter launctl %s %w", stderr.String(), err)
	}

	color.Green("Le service a été installé dans %s et activé !\n", plistPath)
	fmt.Println("Pour le désactiver :")
	color.Blue("launchctl unload %s", plistPath)
	return nil
}

func getCurrentExecDir() (dir string, err error) {
	absPath, err := getCurrentExecPath()
	if err != nil {
		return "", err
	}

	dir = filepath.Dir(absPath)

	return dir, nil
}

func getCurrentExecPath() (dir string, err error) {
	path, err := exec.LookPath(os.Args[0])
	if err != nil {
		return "", err
	}

	absPath, err := filepath.Abs(path)
	if err != nil {
		return "", err
	}

	return absPath, nil
}
