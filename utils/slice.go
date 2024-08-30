package utils

func RemoveItem[K comparable](s []K, item K) []K {
	pos := -1
	for k, v := range s {
		if v == item {
			pos = k
			continue
		}
	}
	if pos == -1 {
		return s
	}
	return RemoveAt(s, pos)
}

func RemoveAt[K comparable](s []K, i int) []K {
	s[i] = s[len(s)-1]
	return s[:len(s)-1]
}

// Inserts a slice into another slice at a given index
func InsertSlice[T any](original []T, inserted []T, n int) []T {
	newSlice := make([]T, 0, len(inserted)+len(original))
	newSlice = append(newSlice, original[:n]...)
	newSlice = append(newSlice, inserted...)
	newSlice = append(newSlice, original[n:]...)
	return newSlice
}
