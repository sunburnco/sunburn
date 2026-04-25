.PHONY: serve servetest test

serve:
	go run . serve

servehttp:
	go run . serve --http 0.0.0.0:8090

servetest:
	go run . serve --dir="./test_data"

testserve: servetest

test:
	go test -v ./tests
