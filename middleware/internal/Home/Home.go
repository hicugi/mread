package home

import (
	"net/http"
	"crypto/sha256"
	"encoding/hex"
	"strings"
	"fmt"
	"os"
	"io"
)

func Home(w http.ResponseWriter, req *http.Request) {
	FILE_PATH := "../.currentHost"
	postBodyHost := ""

	for ; req.Method == http.MethodPost; {
		defer req.Body.Close()

		bodyBytes, err := io.ReadAll(req.Body)
		if err != nil {
			http.Error(w, "Error reading request body", http.StatusInternalServerError)
			return
		}

		body := string(bodyBytes);

		i := strings.LastIndex(body, "|")
		if (i == -1) {
			break
		}

		pass := body[0:i]
		hash := sha256.Sum256([]byte(pass))
		hashStr := hex.EncodeToString(hash[:])

		if hashStr == "e3cbae7c8079449276dde9bb475212ab2b0585ebd467c2e6ab9eaad42cf7d5e0" {
			postBodyHost = body[i+1:]
		}
	}

	if postBodyHost != "" {
		os.WriteFile(FILE_PATH, []byte(postBodyHost), 0644)
		io.WriteString(w, postBodyHost)
		return
	}

	data, err := os.ReadFile(FILE_PATH)
	if err != nil {
		fmt.Printf("Couldn't read the file: %v\n", err)
		http.Error(w, "Host not found", 404)
		return
	}

	io.WriteString(w, string(data))
}

