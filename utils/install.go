package utils

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

func InstallApp(linuxService string, macOSService string) error {
	var err error
	user, err := user.Current()
	if err != nil {
		return fmt.Errorf("impossible de récupérer l'utilisateur courant %w", err)
	}
	home := user.HomeDir
	switch runtime.GOOS {
	case "darwin":
		plistPath := filepath.Join(home, "Library/LaunchAgents/com.grafikart.grafisearch.plist")
		err = installService(
			macOSService,
			plistPath,
			exec.Command("launchctl", "load", plistPath),
		)
		if err == nil {
			color.Green("Le service a été installé dans %s et activé !\n", plistPath)
			fmt.Println("")
			fmt.Println("Pour le désactiver :")
			color.Blue("launchctl unload %s", plistPath)
		}
	case "linux":
		linuxPath := filepath.Join(home, ".config/systemd/user/grafisearch.service")
		err = installService(
			linuxService,
			linuxPath,
			exec.Command("systemctl", "enable", "--user", "grafisearch.service"),
		)
		if err == nil {
			color.Green("Le service a été installé dans %s et activé !\n", linuxPath)
			fmt.Println("")
			fmt.Println("Pour le démarrer :")
			color.Blue("systemctl start --user grafisearch.service")
			fmt.Println("")
			fmt.Println("Pour le désactiver :")
			color.Blue("systemctl disable --user grafisearch.service")
		}
	default:
		return fmt.Errorf("système d'exploitation non géré %s", runtime.GOOS)
	}
	return err
}

func installService(tpl string, dest string, cmd *exec.Cmd) error {
	exePath, err := getCurrentExecPath()
	if err != nil {
		return err
	}

	t, err := template.New("service").Parse(tpl)
	if err != nil {
		return fmt.Errorf("impossible de parser le template %w", err)
	}

	f, err := os.Create(dest)
	if err != nil {
		return fmt.Errorf("impossible de créer le fichier de service %w", err)
	}

	t.Execute(f, appInfo{Path: exePath})
	var out bytes.Buffer
	var stderr bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &stderr
	err = cmd.Run()
	if err != nil {
		return fmt.Errorf("impossible de démarrer le service %s %w", stderr.String(), err)
	}
	return nil
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
