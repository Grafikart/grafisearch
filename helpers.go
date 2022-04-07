package main

func insertSlice[T any](original []T, inserted []T, n int) []T {
	newSlice := make([]T, 0, len(inserted)+len(original))
	newSlice = append(newSlice, original[:n]...)
	newSlice = append(newSlice, inserted...)
	newSlice = append(newSlice, original[n:]...)
	return newSlice
}

func stringOrEmpty(s string, err error) string {
	if err != nil {
		return ""
	}
	return s
}
