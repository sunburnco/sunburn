.PHONY: serve servetest test

serve:
	go run . serve

servetest:
	go run . serve --dir="./test_data"

testserve: servetest

test:
	go test -v ./tests
