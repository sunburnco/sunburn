package hooks

import (
	"github.com/pocketbase/pocketbase/core"
	"sunburn.co/backend/lib"
)

func SendVersionHeader(e *core.RequestEvent) error {
	e.Response.Header().Add("access-control-expose-headers", "x-sb-version")
	e.Response.Header().Add("x-sb-version", lib.VERSION)
	return e.Next()
}
