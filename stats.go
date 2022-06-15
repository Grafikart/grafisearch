package main

import (
	"encoding/csv"
	"io"
	"os"
	"os/user"
	"path/filepath"
)

type SearchStats struct {
	Count              int
	HitRate            int
	HitRateGoogle      int
	HitRateNotOnGoogle int
	Results            []StatsRow
}

type StatsRow struct {
	Query  string
	Found  bool
	Google bool
	URL    string
}

func loadStats() (*SearchStats, error) {
	u, err := user.Current()
	if err != nil {
		return nil, err
	}
	f, err := os.OpenFile(filepath.Join(u.HomeDir, "grafisearch.csv"), os.O_RDONLY, 0644)
	if err != nil {
		return nil, err
	}
	r := csv.NewReader(f)
	total := 0
	found := 0
	noResultFound := 0
	noResultFoundButGoogleFound := 0
	exoticResult := 0
	results := []StatsRow{}
	for {
		record, err := r.Read()
		if err == io.EOF {
			break
		}
		resultFound := record[1] == "1"
		googleFound := record[2] == "1"
		if resultFound {
			found++
			if !googleFound {
				exoticResult++
			}
		} else {
			noResultFound++
			if googleFound {
				noResultFoundButGoogleFound++
			}
		}
		total++
		if err != nil {
			return nil, err
		}
		results = append(results, StatsRow{record[0], resultFound, googleFound, record[3]})
	}
	hitRate := int(float64(found) / float64(total) * 100)
	hitRateGoogle := int(float64(noResultFoundButGoogleFound) / float64(noResultFound) * 100)
	hitRateNotOnGoogle := int(float64(exoticResult) / float64(found) * 100)
	results = reverse(results)
	if len(results) > 100 {
		results = results[:100]
	}

	return &SearchStats{
		Count:              total,
		HitRate:            hitRate,
		HitRateGoogle:      hitRateGoogle,
		HitRateNotOnGoogle: hitRateNotOnGoogle,
		Results:            results,
	}, nil
}

func reverse(input []StatsRow) []StatsRow {
	inputLen := len(input)
	output := make([]StatsRow, inputLen)

	for i, n := range input {
		j := inputLen - i - 1

		output[j] = n
	}

	return output
}
