package utils

func StringOrEmpty(s string, err error) string {
	if err != nil {
		return ""
	}
	return s
}
