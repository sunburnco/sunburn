package hooks

import (
	"math"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

func AdjustRoleOrdinals(e *core.RecordEvent) error {
	ord := e.Record.GetFloat("ordinal")

	// no decimal point
	if ord == math.Round(ord) {
		return nil
	}

	server := e.Record.GetString("server")

	/**
	BEGIN TRANSACTION;
		UPDATE serverRoles
		SET ordinal = (ROW_NUMBER() OVER()) + 1000001
		FROM (
			SELECT id, ordinal + 1000000
			FROM serverRoles
			WHERE server = {:server} AND ordinal > 0
			ORDER BY ordinal
		) t1
		WHERE t1.id = serverRoles.id;
		UPDATE serverRoles
		SET ordinal = ordinal - 1000000
		WHERE server = {:server} AND ordinal > 0;
		COMMIT;
	*/
	if res, err := e.App.DB().NewQuery("BEGIN TRANSACTION; UPDATE serverRoles SET ordinal = (ROW_NUMBER() OVER()) + 1000000 FROM (SELECT id, ordinal + 1000000 FROM serverRoles WHERE server = {:server} AND ordinal > 0 ORDER BY ordinal) t1 WHERE t1.id = serverRoles.id; UPDATE serverRoles SET ordinal = ordinal - 1000000 WHERE server = {:server} AND ordinal > 0; COMMIT;").
		Bind(dbx.Params{
			"server": server,
		}).Execute(); err != nil {
		return err
	} else {
		e.App.Logger().Info("res", "res", res)
	}

	return nil
}
