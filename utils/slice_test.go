package utils

import (
	"reflect"
	"testing"
)

func TestRemoveItem(t *testing.T) {
	tests := []struct {
		name     string
		slice    []int
		item     int
		expected []int
	}{
		{
			name:     "Remove existing item",
			slice:    []int{1, 2, 3, 4, 5},
			item:     3,
			expected: []int{1, 2, 5, 4},
		},
		{
			name:     "Remove non-existing item",
			slice:    []int{1, 2, 3, 4, 5},
			item:     6,
			expected: []int{1, 2, 3, 4, 5},
		},
		{
			name:     "Remove from empty slice",
			slice:    []int{},
			item:     1,
			expected: []int{},
		},
		{
			name:     "Remove first item",
			slice:    []int{1, 2, 3},
			item:     1,
			expected: []int{3, 2},
		},
		{
			name:     "Remove last item",
			slice:    []int{1, 2, 3},
			item:     3,
			expected: []int{1, 2},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := RemoveItem(tt.slice, tt.item)
			if !reflect.DeepEqual(result, tt.expected) {
				t.Errorf("RemoveItem() = %v, want %v", result, tt.expected)
			}
		})
	}
}

func TestRemoveAt(t *testing.T) {
	tests := []struct {
		name     string
		slice    []int
		index    int
		expected []int
	}{
		{
			name:     "Remove from middle",
			slice:    []int{1, 2, 3, 4, 5},
			index:    2,
			expected: []int{1, 2, 5, 4},
		},
		{
			name:     "Remove first item",
			slice:    []int{1, 2, 3},
			index:    0,
			expected: []int{3, 2},
		},
		{
			name:     "Remove last item",
			slice:    []int{1, 2, 3},
			index:    2,
			expected: []int{1, 2},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := RemoveAt(tt.slice, tt.index)
			if !reflect.DeepEqual(result, tt.expected) {
				t.Errorf("RemoveAt() = %v, want %v", result, tt.expected)
			}
		})
	}
}

func TestInsertSlice(t *testing.T) {
	tests := []struct {
		name     string
		original []int
		inserted []int
		index    int
		expected []int
	}{
		{
			name:     "Insert in the middle",
			original: []int{1, 2, 3, 4, 5},
			inserted: []int{10, 20},
			index:    2,
			expected: []int{1, 2, 10, 20, 3, 4, 5},
		},
		{
			name:     "Insert at the beginning",
			original: []int{1, 2, 3},
			inserted: []int{4, 5},
			index:    0,
			expected: []int{4, 5, 1, 2, 3},
		},
		{
			name:     "Insert at the end",
			original: []int{1, 2, 3},
			inserted: []int{4, 5},
			index:    3,
			expected: []int{1, 2, 3, 4, 5},
		},
		{
			name:     "Insert empty slice",
			original: []int{1, 2, 3},
			inserted: []int{},
			index:    1,
			expected: []int{1, 2, 3},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := InsertSlice(tt.original, tt.inserted, tt.index)
			if !reflect.DeepEqual(result, tt.expected) {
				t.Errorf("InsertSlice() = %v, want %v", result, tt.expected)
			}
		})
	}
}
