package utils

func Force[K interface{}](v K, err error) K {
	if err != nil {
		panic(err)
	}

	return v
}
