package hooks

import (
	"sync/atomic"

	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"golang.org/x/sync/errgroup"
)

func ManagePresence_SubscribeRequest(e *core.RealtimeSubscribeRequestEvent) error {
	if err := e.Next(); err != nil {
		return err
	}

	eAuth := e.Client.Get(apis.RealtimeClientAuthKey).(*core.Record)
	if eAuth == nil || eAuth.Id == "" {
		return e.Next()
	}

	// if status is "offline" or "", set to online.
	// otherwise, the status has been set by the client and should not be touched
	currentPresence := eAuth.Get("presence").(string)
	switch currentPresence {
	case "offline", "":
		eAuth.Set("presence", "online")
		// failing to set online status shouldn't stop a user form receiving realtime messages
		if err := e.App.Save(eAuth); err != nil {
			e.App.Logger().Error("could not save online presence", "err", err, "user", eAuth.Id)
		}
	default:
		break
	}

	return nil
}

func ManagePresence_ConnectRequest(e *core.RealtimeConnectRequestEvent) error {
	if err := e.Next(); err != nil {
		return err
	}

	eAuth := e.Client.Get(apis.RealtimeClientAuthKey).(*core.Record)
	if eAuth == nil || eAuth.Id == "" {
		return nil
	}

	// disconnect
	// if the client has no other connections, set it to offline
	// otherwise, leave it alone

	// TODO investigate using errgroup w context instead of atomic bool
	hasOtherConnection := atomic.Bool{}
	group := new(errgroup.Group)
	chunks := e.App.SubscriptionsBroker().ChunkedClients(300)
	for _, chunk := range chunks {
		group.Go(func() error {
			for _, client := range chunk {
				auth := client.Get(apis.RealtimeClientAuthKey).(*core.Record)
				if auth == nil {
					continue
				}
				if auth.Id == eAuth.Id {
					hasOtherConnection.Store(true)
					return nil
				}
			}
			return nil
		})
	}
	_ = group.Wait()

	if hasOtherConnection.Load() {
		return nil
	}

	eAuth.Set("presence", "offline")
	return e.App.Save(eAuth)
}
