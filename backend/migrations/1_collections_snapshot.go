package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		jsonData := `[
			{
				"createRule": null,
				"deleteRule": null,
				"fields": [
					{
						"autogeneratePattern": "[a-z0-9]{15}",
						"hidden": false,
						"id": "text3208210256",
						"max": 15,
						"min": 15,
						"name": "id",
						"pattern": "^[a-z0-9]+$",
						"presentable": false,
						"primaryKey": true,
						"required": true,
						"system": true,
						"type": "text"
					},
					{
						"autogeneratePattern": "",
						"hidden": false,
						"id": "text455797646",
						"max": 0,
						"min": 0,
						"name": "collectionRef",
						"pattern": "",
						"presentable": false,
						"primaryKey": false,
						"required": true,
						"system": true,
						"type": "text"
					},
					{
						"autogeneratePattern": "",
						"hidden": false,
						"id": "text127846527",
						"max": 0,
						"min": 0,
						"name": "recordRef",
						"pattern": "",
						"presentable": false,
						"primaryKey": false,
						"required": true,
						"system": true,
						"type": "text"
					},
					{
						"autogeneratePattern": "",
						"hidden": false,
						"id": "text1582905952",
						"max": 0,
						"min": 0,
						"name": "method",
						"pattern": "",
						"presentable": false,
						"primaryKey": false,
						"required": true,
						"system": true,
						"type": "text"
					},
					{
						"hidden": false,
						"id": "autodate2990389176",
						"name": "created",
						"onCreate": true,
						"onUpdate": false,
						"presentable": false,
						"system": true,
						"type": "autodate"
					},
					{
						"hidden": false,
						"id": "autodate3332085495",
						"name": "updated",
						"onCreate": true,
						"onUpdate": true,
						"presentable": false,
						"system": true,
						"type": "autodate"
					}
				],
				"id": "pbc_2279338944",
				"indexes": [
					"CREATE INDEX ` + "`" + `idx_mfas_collectionRef_recordRef` + "`" + ` ON ` + "`" + `_mfas` + "`" + ` (collectionRef,recordRef)"
				],
				"listRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId",
				"name": "_mfas",
				"system": true,
				"type": "base",
				"updateRule": null,
				"viewRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId"
			},
			{
				"createRule": null,
				"deleteRule": null,
				"fields": [
					{
						"autogeneratePattern": "[a-z0-9]{15}",
						"hidden": false,
						"id": "text3208210256",
						"max": 15,
						"min": 15,
						"name": "id",
						"pattern": "^[a-z0-9]+$",
						"presentable": false,
						"primaryKey": true,
						"required": true,
						"system": true,
						"type": "text"
					},
					{
						"autogeneratePattern": "",
						"hidden": false,
						"id": "text455797646",
						"max": 0,
						"min": 0,
						"name": "collectionRef",
						"pattern": "",
						"presentable": false,
						"primaryKey": false,
						"required": true,
						"system": true,
						"type": "text"
					},
					{
						"autogeneratePattern": "",
						"hidden": false,
						"id": "text127846527",
						"max": 0,
						"min": 0,
						"name": "recordRef",
						"pattern": "",
						"presentable": false,
						"primaryKey": false,
						"required": true,
						"system": true,
						"type": "text"
					},
					{
						"cost": 8,
						"hidden": true,
						"id": "password901924565",
						"max": 0,
						"min": 0,
						"name": "password",
						"pattern": "",
						"presentable": false,
						"required": true,
						"system": true,
						"type": "password"
					},
					{
						"autogeneratePattern": "",
						"hidden": true,
						"id": "text3866985172",
						"max": 0,
						"min": 0,
						"name": "sentTo",
						"pattern": "",
						"presentable": false,
						"primaryKey": false,
						"required": false,
						"system": true,
						"type": "text"
					},
					{
						"hidden": false,
						"id": "autodate2990389176",
						"name": "created",
						"onCreate": true,
						"onUpdate": false,
						"presentable": false,
						"system": true,
						"type": "autodate"
					},
					{
						"hidden": false,
						"id": "autodate3332085495",
						"name": "updated",
						"onCreate": true,
						"onUpdate": true,
						"presentable": false,
						"system": true,
						"type": "autodate"
					}
				],
				"id": "pbc_1638494021",
				"indexes": [
					"CREATE INDEX ` + "`" + `idx_otps_collectionRef_recordRef` + "`" + ` ON ` + "`" + `_otps` + "`" + ` (collectionRef, recordRef)"
				],
				"listRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId",
				"name": "_otps",
				"system": true,
				"type": "base",
				"updateRule": null,
				"viewRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId"
			},
			{
				"createRule": null,
				"deleteRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId",
				"fields": [
					{
						"autogeneratePattern": "[a-z0-9]{15}",
						"hidden": false,
						"id": "text3208210256",
						"max": 15,
						"min": 15,
						"name": "id",
						"pattern": "^[a-z0-9]+$",
						"presentable": false,
						"primaryKey": true,
						"required": true,
						"system": true,
						"type": "text"
					},
					{
						"autogeneratePattern": "",
						"hidden": false,
						"id": "text455797646",
						"max": 0,
						"min": 0,
						"name": "collectionRef",
						"pattern": "",
						"presentable": false,
						"primaryKey": false,
						"required": true,
						"system": true,
						"type": "text"
					},
					{
						"autogeneratePattern": "",
						"hidden": false,
						"id": "text127846527",
						"max": 0,
						"min": 0,
						"name": "recordRef",
						"pattern": "",
						"presentable": false,
						"primaryKey": false,
						"required": true,
						"system": true,
						"type": "text"
					},
					{
						"autogeneratePattern": "",
						"hidden": false,
						"id": "text2462348188",
						"max": 0,
						"min": 0,
						"name": "provider",
						"pattern": "",
						"presentable": false,
						"primaryKey": false,
						"required": true,
						"system": true,
						"type": "text"
					},
					{
						"autogeneratePattern": "",
						"hidden": false,
						"id": "text1044722854",
						"max": 0,
						"min": 0,
						"name": "providerId",
						"pattern": "",
						"presentable": false,
						"primaryKey": false,
						"required": true,
						"system": true,
						"type": "text"
					},
					{
						"hidden": false,
						"id": "autodate2990389176",
						"name": "created",
						"onCreate": true,
						"onUpdate": false,
						"presentable": false,
						"system": true,
						"type": "autodate"
					},
					{
						"hidden": false,
						"id": "autodate3332085495",
						"name": "updated",
						"onCreate": true,
						"onUpdate": true,
						"presentable": false,
						"system": true,
						"type": "autodate"
					}
				],
				"id": "pbc_2281828961",
				"indexes": [
					"CREATE UNIQUE INDEX ` + "`" + `idx_externalAuths_record_provider` + "`" + ` ON ` + "`" + `_externalAuths` + "`" + ` (collectionRef, recordRef, provider)",
					"CREATE UNIQUE INDEX ` + "`" + `idx_externalAuths_collection_provider` + "`" + ` ON ` + "`" + `_externalAuths` + "`" + ` (collectionRef, provider, providerId)"
				],
				"listRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId",
				"name": "_externalAuths",
				"system": true,
				"type": "base",
				"updateRule": null,
				"viewRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId"
			},
			{
				"createRule": null,
				"deleteRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId",
				"fields": [
					{
						"autogeneratePattern": "[a-z0-9]{15}",
						"hidden": false,
						"id": "text3208210256",
						"max": 15,
						"min": 15,
						"name": "id",
						"pattern": "^[a-z0-9]+$",
						"presentable": false,
						"primaryKey": true,
						"required": true,
						"system": true,
						"type": "text"
					},
					{
						"autogeneratePattern": "",
						"hidden": false,
						"id": "text455797646",
						"max": 0,
						"min": 0,
						"name": "collectionRef",
						"pattern": "",
						"presentable": false,
						"primaryKey": false,
						"required": true,
						"system": true,
						"type": "text"
					},
					{
						"autogeneratePattern": "",
						"hidden": false,
						"id": "text127846527",
						"max": 0,
						"min": 0,
						"name": "recordRef",
						"pattern": "",
						"presentable": false,
						"primaryKey": false,
						"required": true,
						"system": true,
						"type": "text"
					},
					{
						"autogeneratePattern": "",
						"hidden": false,
						"id": "text4228609354",
						"max": 0,
						"min": 0,
						"name": "fingerprint",
						"pattern": "",
						"presentable": false,
						"primaryKey": false,
						"required": true,
						"system": true,
						"type": "text"
					},
					{
						"hidden": false,
						"id": "autodate2990389176",
						"name": "created",
						"onCreate": true,
						"onUpdate": false,
						"presentable": false,
						"system": true,
						"type": "autodate"
					},
					{
						"hidden": false,
						"id": "autodate3332085495",
						"name": "updated",
						"onCreate": true,
						"onUpdate": true,
						"presentable": false,
						"system": true,
						"type": "autodate"
					}
				],
				"id": "pbc_4275539003",
				"indexes": [
					"CREATE UNIQUE INDEX ` + "`" + `idx_authOrigins_unique_pairs` + "`" + ` ON ` + "`" + `_authOrigins` + "`" + ` (collectionRef, recordRef, fingerprint)"
				],
				"listRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId",
				"name": "_authOrigins",
				"system": true,
				"type": "base",
				"updateRule": null,
				"viewRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId"
			},
			{
				"authAlert": {
					"emailTemplate": {
						"body": "<p>Hello,</p>\n<p>We noticed a login to your {APP_NAME} account from a new location.</p>\n<p>If this was you, you may disregard this email.</p>\n<p><strong>If this wasn't you, you should immediately change your {APP_NAME} account password to revoke access from all other locations.</strong></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
						"subject": "Login from a new location"
					},
					"enabled": true
				},
				"authRule": "",
				"authToken": {
					"duration": 86400
				},
				"confirmEmailChangeTemplate": {
					"body": "<p>Hello,</p>\n<p>Click on the button below to confirm your new email address.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/_/#/auth/confirm-email-change/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Confirm new email</a>\n</p>\n<p><i>If you didn't ask to change your email address, you can ignore this email.</i></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
					"subject": "Confirm your {APP_NAME} new email address"
				},
				"createRule": null,
				"deleteRule": null,
				"emailChangeToken": {
					"duration": 1800
				},
				"fields": [
					{
						"autogeneratePattern": "[a-z0-9]{15}",
						"hidden": false,
						"id": "text3208210256",
						"max": 15,
						"min": 15,
						"name": "id",
						"pattern": "^[a-z0-9]+$",
						"presentable": false,
						"primaryKey": true,
						"required": true,
						"system": true,
						"type": "text"
					},
					{
						"cost": 0,
						"hidden": true,
						"id": "password901924565",
						"max": 0,
						"min": 8,
						"name": "password",
						"pattern": "",
						"presentable": false,
						"required": true,
						"system": true,
						"type": "password"
					},
					{
						"autogeneratePattern": "[a-zA-Z0-9]{50}",
						"hidden": true,
						"id": "text2504183744",
						"max": 60,
						"min": 30,
						"name": "tokenKey",
						"pattern": "",
						"presentable": false,
						"primaryKey": false,
						"required": true,
						"system": true,
						"type": "text"
					},
					{
						"exceptDomains": null,
						"hidden": false,
						"id": "email3885137012",
						"name": "email",
						"onlyDomains": null,
						"presentable": false,
						"required": true,
						"system": true,
						"type": "email"
					},
					{
						"hidden": false,
						"id": "bool1547992806",
						"name": "emailVisibility",
						"presentable": false,
						"required": false,
						"system": true,
						"type": "bool"
					},
					{
						"hidden": false,
						"id": "bool256245529",
						"name": "verified",
						"presentable": false,
						"required": false,
						"system": true,
						"type": "bool"
					},
					{
						"hidden": false,
						"id": "autodate2990389176",
						"name": "created",
						"onCreate": true,
						"onUpdate": false,
						"presentable": false,
						"system": true,
						"type": "autodate"
					},
					{
						"hidden": false,
						"id": "autodate3332085495",
						"name": "updated",
						"onCreate": true,
						"onUpdate": true,
						"presentable": false,
						"system": true,
						"type": "autodate"
					}
				],
				"fileToken": {
					"duration": 180
				},
				"id": "pbc_3142635823",
				"indexes": [
					"CREATE UNIQUE INDEX ` + "`" + `idx_tokenKey_pbc_3142635823` + "`" + ` ON ` + "`" + `_superusers` + "`" + ` (` + "`" + `tokenKey` + "`" + `)",
					"CREATE UNIQUE INDEX ` + "`" + `idx_email_pbc_3142635823` + "`" + ` ON ` + "`" + `_superusers` + "`" + ` (` + "`" + `email` + "`" + `) WHERE ` + "`" + `email` + "`" + ` != ''"
				],
				"listRule": null,
				"manageRule": null,
				"mfa": {
					"duration": 1800,
					"enabled": false,
					"rule": ""
				},
				"name": "_superusers",
				"oauth2": {
					"enabled": false,
					"mappedFields": {
						"avatarURL": "",
						"id": "",
						"name": "",
						"username": ""
					}
				},
				"otp": {
					"duration": 180,
					"emailTemplate": {
						"body": "<p>Hello,</p>\n<p>Your one-time password is: <strong>{OTP}</strong></p>\n<p><i>If you didn't ask for the one-time password, you can ignore this email.</i></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
						"subject": "OTP for {APP_NAME}"
					},
					"enabled": false,
					"length": 8
				},
				"passwordAuth": {
					"enabled": true,
					"identityFields": [
						"email"
					]
				},
				"passwordResetToken": {
					"duration": 1800
				},
				"resetPasswordTemplate": {
					"body": "<p>Hello,</p>\n<p>Click on the button below to reset your password.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/_/#/auth/confirm-password-reset/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Reset password</a>\n</p>\n<p><i>If you didn't ask to reset your password, you can ignore this email.</i></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
					"subject": "Reset your {APP_NAME} password"
				},
				"system": true,
				"type": "auth",
				"updateRule": null,
				"verificationTemplate": {
					"body": "<p>Hello,</p>\n<p>Thank you for joining us at {APP_NAME}.</p>\n<p>Click on the button below to verify your email address.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/_/#/auth/confirm-verification/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Verify</a>\n</p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
					"subject": "Verify your {APP_NAME} email"
				},
				"verificationToken": {
					"duration": 259200
				},
				"viewRule": null
			},
			{
				"authAlert": {
					"emailTemplate": {
						"body": "<p>Hello,</p>\n<p>We noticed a login to your {APP_NAME} account from a new location.</p>\n<p>If this was you, you may disregard this email.</p>\n<p><strong>If this wasn't you, you should immediately change your {APP_NAME} account password to revoke access from all other locations.</strong></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
						"subject": "Login from a new location"
					},
					"enabled": false
				},
				"authRule": "",
				"authToken": {
					"duration": 604800
				},
				"confirmEmailChangeTemplate": {
					"body": "<p>Hello,</p>\n<p>Click on the button below to confirm your new email address.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/_/#/auth/confirm-email-change/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Confirm new email</a>\n</p>\n<p><i>If you didn't ask to change your email address, you can ignore this email.</i></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
					"subject": "Confirm your {APP_NAME} new email address"
				},
				"createRule": "",
				"deleteRule": null,
				"emailChangeToken": {
					"duration": 1800
				},
				"fields": [
					{
						"autogeneratePattern": "[a-z0-9]{15}",
						"hidden": false,
						"id": "text3208210256",
						"max": 15,
						"min": 15,
						"name": "id",
						"pattern": "^[a-z0-9]+$",
						"presentable": false,
						"primaryKey": true,
						"required": true,
						"system": true,
						"type": "text"
					},
					{
						"cost": 0,
						"hidden": true,
						"id": "password901924565",
						"max": 0,
						"min": 8,
						"name": "password",
						"pattern": "",
						"presentable": false,
						"required": true,
						"system": true,
						"type": "password"
					},
					{
						"autogeneratePattern": "[a-zA-Z0-9]{50}",
						"hidden": true,
						"id": "text2504183744",
						"max": 60,
						"min": 30,
						"name": "tokenKey",
						"pattern": "",
						"presentable": false,
						"primaryKey": false,
						"required": true,
						"system": true,
						"type": "text"
					},
					{
						"exceptDomains": null,
						"hidden": false,
						"id": "email3885137012",
						"name": "email",
						"onlyDomains": null,
						"presentable": false,
						"required": true,
						"system": true,
						"type": "email"
					},
					{
						"hidden": false,
						"id": "bool1547992806",
						"name": "emailVisibility",
						"presentable": false,
						"required": false,
						"system": true,
						"type": "bool"
					},
					{
						"hidden": false,
						"id": "bool256245529",
						"name": "verified",
						"presentable": false,
						"required": false,
						"system": true,
						"type": "bool"
					},
					{
						"autogeneratePattern": "",
						"hidden": false,
						"id": "text1579384326",
						"max": 255,
						"min": 0,
						"name": "name",
						"pattern": "",
						"presentable": false,
						"primaryKey": false,
						"required": false,
						"system": false,
						"type": "text"
					},
					{
						"hidden": false,
						"id": "file376926767",
						"maxSelect": 1,
						"maxSize": 0,
						"mimeTypes": [
							"image/jpeg",
							"image/png",
							"image/svg+xml",
							"image/gif",
							"image/webp"
						],
						"name": "avatar",
						"presentable": false,
						"protected": false,
						"required": false,
						"system": false,
						"thumbs": null,
						"type": "file"
					},
					{
						"autogeneratePattern": "[a-z0-9]{10}",
						"hidden": false,
						"id": "text2441093337",
						"max": 20,
						"min": 0,
						"name": "handle",
						"pattern": "^[a-zA-Z0-9](?:[a-zA-Z0-9]*(?:[._][a-zA-Z0-9]+)*)?$",
						"presentable": false,
						"primaryKey": false,
						"required": true,
						"system": false,
						"type": "text"
					},
					{
						"autogeneratePattern": "[a-z0-9]{10}",
						"hidden": false,
						"id": "text2295344797",
						"max": 0,
						"min": 0,
						"name": "handle_lowercase",
						"pattern": "",
						"presentable": false,
						"primaryKey": false,
						"required": true,
						"system": false,
						"type": "text"
					},
					{
						"hidden": false,
						"id": "autodate2990389176",
						"name": "created",
						"onCreate": true,
						"onUpdate": false,
						"presentable": false,
						"system": false,
						"type": "autodate"
					},
					{
						"hidden": false,
						"id": "autodate3332085495",
						"name": "updated",
						"onCreate": true,
						"onUpdate": true,
						"presentable": false,
						"system": false,
						"type": "autodate"
					}
				],
				"fileToken": {
					"duration": 180
				},
				"id": "_pb_users_auth_",
				"indexes": [
					"CREATE UNIQUE INDEX ` + "`" + `idx_tokenKey__pb_users_auth_` + "`" + ` ON ` + "`" + `users` + "`" + ` (` + "`" + `tokenKey` + "`" + `)",
					"CREATE UNIQUE INDEX ` + "`" + `idx_email__pb_users_auth_` + "`" + ` ON ` + "`" + `users` + "`" + ` (` + "`" + `email` + "`" + `) WHERE ` + "`" + `email` + "`" + ` != ''",
					"CREATE UNIQUE INDEX ` + "`" + `idx_OfvLgbOH1O` + "`" + ` ON ` + "`" + `users` + "`" + ` (` + "`" + `handle_lowercase` + "`" + `)"
				],
				"listRule": "(\n  // authenticated\n  @request.auth.id != \"\"\n  \n  // mutual server\n  // @collection.serverRoleAssignments.user ?= id &&\n  // @collection.serverRoleAssignments:auth.user ?= @request.auth.id &&\n  // @collection.serverRoleAssignments.role ?=\n  // @collection.serverRoleAssignments:auth.role\n)",
				"manageRule": null,
				"mfa": {
					"duration": 1800,
					"enabled": false,
					"rule": ""
				},
				"name": "users",
				"oauth2": {
					"enabled": false,
					"mappedFields": {
						"avatarURL": "avatar",
						"id": "",
						"name": "name",
						"username": ""
					}
				},
				"otp": {
					"duration": 180,
					"emailTemplate": {
						"body": "<p>Hello,</p>\n<p>Your one-time password is: <strong>{OTP}</strong></p>\n<p><i>If you didn't ask for the one-time password, you can ignore this email.</i></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
						"subject": "OTP for {APP_NAME}"
					},
					"enabled": false,
					"length": 8
				},
				"passwordAuth": {
					"enabled": true,
					"identityFields": [
						"email",
						"handle_lowercase"
					]
				},
				"passwordResetToken": {
					"duration": 1800
				},
				"resetPasswordTemplate": {
					"body": "<p>Hello,</p>\n<p>Click on the button below to reset your password.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/_/#/auth/confirm-password-reset/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Reset password</a>\n</p>\n<p><i>If you didn't ask to reset your password, you can ignore this email.</i></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
					"subject": "Reset your {APP_NAME} password"
				},
				"system": false,
				"type": "auth",
				"updateRule": "id = @request.auth.id",
				"verificationTemplate": {
					"body": "<p>Hello,</p>\n<p>Thank you for joining us at {APP_NAME}.</p>\n<p>Click on the button below to verify your email address.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/_/#/auth/confirm-verification/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Verify</a>\n</p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
					"subject": "Verify your {APP_NAME} email"
				},
				"verificationToken": {
					"duration": 259200
				},
				"viewRule": "(\n  // authenticated\n  @request.auth.id != \"\" \n)"
			},
			{
				"createRule": "(\n  // if owner\n  channel.server.owner.id = @request.auth.id\n)",
				"deleteRule": "(\n  // if owner\n  channel.server.owner.id = @request.auth.id\n)",
				"fields": [
					{
						"autogeneratePattern": "[a-z0-9]{15}",
						"hidden": false,
						"id": "text3208210256",
						"max": 15,
						"min": 15,
						"name": "id",
						"pattern": "^[a-z0-9]+$",
						"presentable": false,
						"primaryKey": true,
						"required": true,
						"system": true,
						"type": "text"
					},
					{
						"cascadeDelete": true,
						"collectionId": "pbc_3009067695",
						"hidden": false,
						"id": "relation2734263879",
						"maxSelect": 1,
						"minSelect": 0,
						"name": "channel",
						"presentable": false,
						"required": true,
						"system": false,
						"type": "relation"
					},
					{
						"cascadeDelete": true,
						"collectionId": "pbc_578049435",
						"hidden": false,
						"id": "relation1466534506",
						"maxSelect": 1,
						"minSelect": 0,
						"name": "role",
						"presentable": false,
						"required": true,
						"system": false,
						"type": "relation"
					},
					{
						"hidden": false,
						"id": "bool1012845560",
						"name": "readonly",
						"presentable": false,
						"required": false,
						"system": false,
						"type": "bool"
					},
					{
						"hidden": false,
						"id": "autodate2990389176",
						"name": "created",
						"onCreate": true,
						"onUpdate": false,
						"presentable": false,
						"system": false,
						"type": "autodate"
					},
					{
						"hidden": false,
						"id": "autodate3332085495",
						"name": "updated",
						"onCreate": true,
						"onUpdate": true,
						"presentable": false,
						"system": false,
						"type": "autodate"
					}
				],
				"id": "pbc_3776353952",
				"indexes": [
					"CREATE UNIQUE INDEX ` + "`" + `idx_7pdySy3sxN` + "`" + ` ON ` + "`" + `channelRoleAssignments` + "`" + ` (\n  ` + "`" + `channel` + "`" + `,\n  ` + "`" + `role` + "`" + `\n)",
					"CREATE INDEX ` + "`" + `idx_C7jsGvWqmS` + "`" + ` ON ` + "`" + `channelRoleAssignments` + "`" + ` (` + "`" + `channel` + "`" + `)"
				],
				"listRule": "(\n  // is owner\n  @request.auth.id = channel.server.owner\n)\n||\n(\n  // member of server\n  @request.auth.serverRoleAssignments_via_user.role.server ?= channel.server &&\n  // has role for channel\n  @request.auth.serverRoleAssignments_via_user.role ?= role\n)",
				"name": "channelRoleAssignments",
				"system": false,
				"type": "base",
				"updateRule": "(\n  // if owner\n  channel.server.owner.id = @request.auth.id\n)",
				"viewRule": "(\n  // is owner\n  @request.auth.id = channel.server.owner\n)\n||\n(\n  // member of server\n  @request.auth.serverRoleAssignments_via_user.role.server ?= channel.server &&\n  // has role for channel\n  @request.auth.serverRoleAssignments_via_user.role ?= role\n)"
			},
			{
				"createRule": "(\n  // owner\n  server.owner = @request.auth.id\n)",
				"deleteRule": "(\n  // owner\n  server.owner = @request.auth.id\n)",
				"fields": [
					{
						"autogeneratePattern": "[a-z0-9]{15}",
						"hidden": false,
						"id": "text3208210256",
						"max": 15,
						"min": 15,
						"name": "id",
						"pattern": "^[a-z0-9]+$",
						"presentable": false,
						"primaryKey": true,
						"required": true,
						"system": true,
						"type": "text"
					},
					{
						"autogeneratePattern": "",
						"hidden": false,
						"id": "text1579384326",
						"max": 100,
						"min": 0,
						"name": "name",
						"pattern": "",
						"presentable": false,
						"primaryKey": false,
						"required": true,
						"system": false,
						"type": "text"
					},
					{
						"cascadeDelete": true,
						"collectionId": "pbc_3929545014",
						"hidden": false,
						"id": "relation1517147638",
						"maxSelect": 1,
						"minSelect": 0,
						"name": "server",
						"presentable": false,
						"required": true,
						"system": false,
						"type": "relation"
					},
					{
						"hidden": false,
						"id": "bool3892009019",
						"name": "voice",
						"presentable": false,
						"required": false,
						"system": false,
						"type": "bool"
					},
					{
						"hidden": false,
						"id": "autodate2990389176",
						"name": "created",
						"onCreate": true,
						"onUpdate": false,
						"presentable": false,
						"system": false,
						"type": "autodate"
					},
					{
						"hidden": false,
						"id": "autodate3332085495",
						"name": "updated",
						"onCreate": true,
						"onUpdate": true,
						"presentable": false,
						"system": false,
						"type": "autodate"
					}
				],
				"id": "pbc_3009067695",
				"indexes": [
					"CREATE INDEX ` + "`" + `idx_1HpyctJmFg` + "`" + ` ON ` + "`" + `channels` + "`" + ` (` + "`" + `server` + "`" + `)"
				],
				"listRule": "(\n  // is owner\n  @request.auth.id = server.owner\n)\n||\n(\n  // member of server\n  @request.auth.serverRoleAssignments_via_user.role.server ?= server &&\n  // has role for channel\n  @request.auth.serverRoleAssignments_via_user.role ?= \n  channelRoleAssignments_via_channel.role\n)",
				"name": "channels",
				"system": false,
				"type": "base",
				"updateRule": "(\n  // owner\n  server.owner = @request.auth.id\n)",
				"viewRule": "(\n  // is owner\n  @request.auth.id = server.owner\n)\n||\n(\n  // member of server\n  @request.auth.serverRoleAssignments_via_user.role.server ?= server &&\n  // has role for channel\n  @request.auth.serverRoleAssignments_via_user.role ?= \n  channelRoleAssignments_via_channel.role\n)"
			},
			{
				"createRule": null,
				"deleteRule": null,
				"fields": [
					{
						"autogeneratePattern": "[a-z0-9]{15}",
						"hidden": false,
						"id": "text3208210256",
						"max": 15,
						"min": 15,
						"name": "id",
						"pattern": "^[a-z0-9]+$",
						"presentable": false,
						"primaryKey": true,
						"required": true,
						"system": true,
						"type": "text"
					},
					{
						"autogeneratePattern": "",
						"hidden": false,
						"id": "text4232930610",
						"max": 0,
						"min": 0,
						"name": "collection",
						"pattern": "",
						"presentable": false,
						"primaryKey": false,
						"required": true,
						"system": false,
						"type": "text"
					},
					{
						"hidden": false,
						"id": "json2603917201",
						"maxSize": 0,
						"name": "record",
						"presentable": false,
						"required": true,
						"system": false,
						"type": "json"
					},
					{
						"hidden": false,
						"id": "autodate2990389176",
						"name": "created",
						"onCreate": true,
						"onUpdate": false,
						"presentable": false,
						"system": false,
						"type": "autodate"
					},
					{
						"hidden": false,
						"id": "autodate3332085495",
						"name": "updated",
						"onCreate": true,
						"onUpdate": true,
						"presentable": false,
						"system": false,
						"type": "autodate"
					}
				],
				"id": "pbc_2053648857",
				"indexes": [],
				"listRule": null,
				"name": "deleted",
				"system": false,
				"type": "base",
				"updateRule": null,
				"viewRule": null
			},
			{
				"createRule": "(\n  // is author\n  @request.auth.id = from\n)\n&&\n(\n  // if sending to channel\n  channel = null ||\n  (\n    // can see channel\n    (\n      // because of a role\n      @request.auth.serverRoleAssignments_via_user.role ?= \n      channel.channelRoleAssignments_via_channel.role ||\n      // or is owner\n      @request.auth.id = channel.server.owner\n    ) &&\n    // doesnt have a read-only role for the channel\n    @request.auth.serverRoleAssignments_via_user.role ?!= \n    channel.channelReadOnlyRoles_via_channelID.roleIDs\n  )\n)",
				"deleteRule": "(\n  // is author\n  @request.auth.id = from\n)\n||\n(\n  // owns server\n  @request.auth.id = channel.server.owner\n)",
				"fields": [
					{
						"autogeneratePattern": "[a-z0-9]{15}",
						"hidden": false,
						"id": "text3208210256",
						"max": 15,
						"min": 15,
						"name": "id",
						"pattern": "^[a-z0-9]+$",
						"presentable": false,
						"primaryKey": true,
						"required": true,
						"system": true,
						"type": "text"
					},
					{
						"cascadeDelete": false,
						"collectionId": "_pb_users_auth_",
						"hidden": false,
						"id": "relation3105530224",
						"maxSelect": 1,
						"minSelect": 0,
						"name": "from",
						"presentable": false,
						"required": true,
						"system": false,
						"type": "relation"
					},
					{
						"cascadeDelete": false,
						"collectionId": "_pb_users_auth_",
						"hidden": false,
						"id": "relation3616002756",
						"maxSelect": 1,
						"minSelect": 0,
						"name": "to",
						"presentable": false,
						"required": false,
						"system": false,
						"type": "relation"
					},
					{
						"cascadeDelete": true,
						"collectionId": "pbc_3009067695",
						"hidden": false,
						"id": "relation2734263879",
						"maxSelect": 1,
						"minSelect": 0,
						"name": "channel",
						"presentable": false,
						"required": false,
						"system": false,
						"type": "relation"
					},
					{
						"autogeneratePattern": "",
						"hidden": false,
						"id": "text4274335913",
						"max": 2000,
						"min": 0,
						"name": "content",
						"pattern": "",
						"presentable": false,
						"primaryKey": false,
						"required": true,
						"system": false,
						"type": "text"
					},
					{
						"hidden": false,
						"id": "bool3268062305",
						"name": "edited",
						"presentable": false,
						"required": false,
						"system": false,
						"type": "bool"
					},
					{
						"hidden": false,
						"id": "autodate2990389176",
						"name": "created",
						"onCreate": true,
						"onUpdate": false,
						"presentable": false,
						"system": false,
						"type": "autodate"
					},
					{
						"hidden": false,
						"id": "autodate3332085495",
						"name": "updated",
						"onCreate": true,
						"onUpdate": true,
						"presentable": false,
						"system": false,
						"type": "autodate"
					}
				],
				"id": "pbc_2605467279",
				"indexes": [
					"CREATE INDEX ` + "`" + `idx_kK32yurGY7` + "`" + ` ON ` + "`" + `messages` + "`" + ` (` + "`" + `from` + "`" + `)",
					"CREATE INDEX ` + "`" + `idx_AwvXRZ46Eg` + "`" + ` ON ` + "`" + `messages` + "`" + ` (` + "`" + `to` + "`" + `)",
					"CREATE INDEX ` + "`" + `idx_VAPPy3hMBI` + "`" + ` ON ` + "`" + `messages` + "`" + ` (` + "`" + `channel` + "`" + `)"
				],
				"listRule": "(\n  // message author\n  @request.auth.id = from\n)\n||\n(\n  // message recipient\n  @request.auth.id = to\n)\n||\n(\n  // can see channel\n  @request.auth.serverRoleAssignments_via_user.role ?= \n  channel.channelRoleAssignments_via_channel.role\n)",
				"name": "messages",
				"system": false,
				"type": "base",
				"updateRule": "(\n  // is author\n  @request.auth.id = from\n)",
				"viewRule": "(\n  // message author\n  @request.auth.id = from\n)\n||\n(\n  // message recipient\n  @request.auth.id = to\n)\n||\n(\n  // can see channel\n  @request.auth.serverRoleAssignments_via_user.role ?= \n  channel.channelRoleAssignments_via_channel.role\n)"
			},
			{
				"createRule": null,
				"deleteRule": null,
				"fields": [
					{
						"autogeneratePattern": "[a-z0-9]{15}",
						"hidden": false,
						"id": "text3208210256",
						"max": 15,
						"min": 15,
						"name": "id",
						"pattern": "^[a-z0-9]+$",
						"presentable": false,
						"primaryKey": true,
						"required": true,
						"system": true,
						"type": "text"
					},
					{
						"cascadeDelete": true,
						"collectionId": "_pb_users_auth_",
						"hidden": false,
						"id": "relation2375276105",
						"maxSelect": 1,
						"minSelect": 0,
						"name": "user",
						"presentable": false,
						"required": true,
						"system": false,
						"type": "relation"
					},
					{
						"hidden": false,
						"id": "number3999656801",
						"max": null,
						"min": null,
						"name": "maxServers",
						"onlyInt": true,
						"presentable": false,
						"required": false,
						"system": false,
						"type": "number"
					},
					{
						"hidden": false,
						"id": "autodate2990389176",
						"name": "created",
						"onCreate": true,
						"onUpdate": false,
						"presentable": false,
						"system": false,
						"type": "autodate"
					},
					{
						"hidden": false,
						"id": "autodate3332085495",
						"name": "updated",
						"onCreate": true,
						"onUpdate": true,
						"presentable": false,
						"system": false,
						"type": "autodate"
					}
				],
				"id": "pbc_3209986660",
				"indexes": [
					"CREATE UNIQUE INDEX ` + "`" + `idx_rd6DnWgSZF` + "`" + ` ON ` + "`" + `serverQuotas` + "`" + ` (` + "`" + `user` + "`" + `)"
				],
				"listRule": "(\n  // requesting own record\n  @request.auth.id = user\n)",
				"name": "serverQuotas",
				"system": false,
				"type": "base",
				"updateRule": null,
				"viewRule": "(\n  // requesting own record\n  @request.auth.id = user\n)"
			},
			{
				"createRule": "(\n  // if owner\n  role.server.owner.id = @request.auth.id\n)",
				"deleteRule": "(\n  // if owner\n  role.server.owner.id = @request.auth.id\n)",
				"fields": [
					{
						"autogeneratePattern": "[a-z0-9]{15}",
						"hidden": false,
						"id": "text3208210256",
						"max": 15,
						"min": 15,
						"name": "id",
						"pattern": "^[a-z0-9]+$",
						"presentable": false,
						"primaryKey": true,
						"required": true,
						"system": true,
						"type": "text"
					},
					{
						"cascadeDelete": true,
						"collectionId": "_pb_users_auth_",
						"hidden": false,
						"id": "relation2375276105",
						"maxSelect": 1,
						"minSelect": 0,
						"name": "user",
						"presentable": false,
						"required": true,
						"system": false,
						"type": "relation"
					},
					{
						"cascadeDelete": true,
						"collectionId": "pbc_578049435",
						"hidden": false,
						"id": "relation1466534506",
						"maxSelect": 1,
						"minSelect": 0,
						"name": "role",
						"presentable": false,
						"required": true,
						"system": false,
						"type": "relation"
					},
					{
						"hidden": false,
						"id": "autodate2990389176",
						"name": "created",
						"onCreate": true,
						"onUpdate": false,
						"presentable": false,
						"system": false,
						"type": "autodate"
					},
					{
						"hidden": false,
						"id": "autodate3332085495",
						"name": "updated",
						"onCreate": true,
						"onUpdate": true,
						"presentable": false,
						"system": false,
						"type": "autodate"
					}
				],
				"id": "pbc_1960618460",
				"indexes": [
					"CREATE UNIQUE INDEX ` + "`" + `idx_qxMk2Yfg5n` + "`" + ` ON ` + "`" + `serverRoleAssignments` + "`" + ` (\n  ` + "`" + `user` + "`" + `,\n  ` + "`" + `role` + "`" + `\n)",
					"CREATE INDEX ` + "`" + `idx_j2Bkvfagcu` + "`" + ` ON ` + "`" + `serverRoleAssignments` + "`" + ` (` + "`" + `role` + "`" + `)",
					"CREATE INDEX ` + "`" + `idx_AVr5GvAX6O` + "`" + ` ON ` + "`" + `serverRoleAssignments` + "`" + ` (` + "`" + `user` + "`" + `)"
				],
				"listRule": "(\n  // is owner\n  @request.auth.id = role.server.owner\n)\n||\n(\n  // if requesting own assignments\n  user = @request.auth.id\n)\n||\n(\n  // user has role in server\n  role.server ?= @request.auth.serverRoleAssignments_via_user.role.server\n)\n",
				"name": "serverRoleAssignments",
				"system": false,
				"type": "base",
				"updateRule": null,
				"viewRule": "(\n  // is owner\n  @request.auth.id = role.server.owner\n)\n||\n(\n  // if requesting own assignments\n  user = @request.auth.id\n)\n||\n(\n  // user has role in server\n  role.server ?= @request.auth.serverRoleAssignments_via_user.role.server\n)\n"
			},
			{
				"createRule": "(\n  // if owner\n  server.owner.id = @request.auth.id\n)",
				"deleteRule": "(\n  // if owner\n  server.owner.id = @request.auth.id\n)",
				"fields": [
					{
						"autogeneratePattern": "[a-z0-9]{15}",
						"hidden": false,
						"id": "text3208210256",
						"max": 15,
						"min": 15,
						"name": "id",
						"pattern": "^[a-z0-9]+$",
						"presentable": false,
						"primaryKey": true,
						"required": true,
						"system": true,
						"type": "text"
					},
					{
						"cascadeDelete": true,
						"collectionId": "pbc_3929545014",
						"hidden": false,
						"id": "relation695386426",
						"maxSelect": 1,
						"minSelect": 0,
						"name": "server",
						"presentable": false,
						"required": true,
						"system": false,
						"type": "relation"
					},
					{
						"autogeneratePattern": "",
						"hidden": false,
						"id": "text1579384326",
						"max": 100,
						"min": 0,
						"name": "name",
						"pattern": "",
						"presentable": false,
						"primaryKey": false,
						"required": true,
						"system": false,
						"type": "text"
					},
					{
						"autogeneratePattern": "",
						"hidden": false,
						"id": "text1716930793",
						"max": 0,
						"min": 0,
						"name": "color",
						"pattern": "",
						"presentable": false,
						"primaryKey": false,
						"required": false,
						"system": false,
						"type": "text"
					},
					{
						"hidden": false,
						"id": "number4132419331",
						"max": null,
						"min": null,
						"name": "ordinal",
						"onlyInt": true,
						"presentable": false,
						"required": false,
						"system": false,
						"type": "number"
					},
					{
						"hidden": false,
						"id": "autodate2990389176",
						"name": "created",
						"onCreate": true,
						"onUpdate": false,
						"presentable": false,
						"system": false,
						"type": "autodate"
					},
					{
						"hidden": false,
						"id": "autodate3332085495",
						"name": "updated",
						"onCreate": true,
						"onUpdate": true,
						"presentable": false,
						"system": false,
						"type": "autodate"
					}
				],
				"id": "pbc_578049435",
				"indexes": [
					"CREATE UNIQUE INDEX ` + "`" + `idx_DZXYlmCMc4` + "`" + ` ON ` + "`" + `serverRoles` + "`" + ` (\n  ` + "`" + `server` + "`" + `,\n  ` + "`" + `ordinal` + "`" + `\n)",
					"CREATE INDEX ` + "`" + `idx_ADYi3sHvW6` + "`" + ` ON ` + "`" + `serverRoles` + "`" + ` (` + "`" + `server` + "`" + `)"
				],
				"listRule": "(\n  // is owner\n  @request.auth.id = server.owner\n)\n||\n(\n  // if requesting roles for server user is part of\n  server ?= @request.auth.serverRoleAssignments_via_user.role.server\n)\n",
				"name": "serverRoles",
				"system": false,
				"type": "base",
				"updateRule": "(\n  // if owner\n  server.owner.id = @request.auth.id\n)",
				"viewRule": "(\n  // is owner\n  @request.auth.id = server.owner\n)\n||\n(\n  // if requesting roles for server user is part of\n  server ?= @request.auth.serverRoleAssignments_via_user.role.server\n)\n"
			},
			{
				"createRule": "(\n  // user must own server\n  owner = @request.auth.id\n)\n&&\n(\n  // quota is negative\n  @request.auth.serverQuotas_via_user.maxServers < 0 ||\n  // quota is positive and user owns no servers\n  (\n    @request.auth.serverQuotas_via_user.maxServers > 0 && \n    @request.auth.serverCounts_via_user.serverCount = null\n  ) ||\n  // quota is positive and not over quota\n  @request.auth.serverCounts_via_user.serverCount < \n  @request.auth.serverQuotas_via_user.maxServers\n)",
				"deleteRule": "(\n  // owner may delete server\n  owner = @request.auth.id\n)",
				"fields": [
					{
						"autogeneratePattern": "[a-z0-9]{15}",
						"hidden": false,
						"id": "text3208210256",
						"max": 15,
						"min": 15,
						"name": "id",
						"pattern": "^[a-z0-9]+$",
						"presentable": false,
						"primaryKey": true,
						"required": true,
						"system": true,
						"type": "text"
					},
					{
						"autogeneratePattern": "",
						"hidden": false,
						"id": "text1579384326",
						"max": 100,
						"min": 0,
						"name": "name",
						"pattern": "",
						"presentable": false,
						"primaryKey": false,
						"required": true,
						"system": false,
						"type": "text"
					},
					{
						"hidden": false,
						"id": "file1704208859",
						"maxSelect": 1,
						"maxSize": 0,
						"mimeTypes": [
							"image/png",
							"image/jpeg",
							"image/gif",
							"image/webp",
							"image/svg+xml"
						],
						"name": "icon",
						"presentable": false,
						"protected": false,
						"required": false,
						"system": false,
						"thumbs": [],
						"type": "file"
					},
					{
						"cascadeDelete": false,
						"collectionId": "_pb_users_auth_",
						"hidden": false,
						"id": "relation3479234172",
						"maxSelect": 1,
						"minSelect": 0,
						"name": "owner",
						"presentable": false,
						"required": true,
						"system": false,
						"type": "relation"
					},
					{
						"hidden": false,
						"id": "autodate2990389176",
						"name": "created",
						"onCreate": true,
						"onUpdate": false,
						"presentable": false,
						"system": false,
						"type": "autodate"
					},
					{
						"hidden": false,
						"id": "autodate3332085495",
						"name": "updated",
						"onCreate": true,
						"onUpdate": true,
						"presentable": false,
						"system": false,
						"type": "autodate"
					}
				],
				"id": "pbc_3929545014",
				"indexes": [],
				"listRule": "(\n  // owner\n  @request.auth.id = owner\n)\n||\n(\n  // user has role in server\n  @request.auth.serverRoleAssignments_via_user.role.server ?= id\n)",
				"name": "servers",
				"system": false,
				"type": "base",
				"updateRule": "(\n  // owner may update server\n  owner = @request.auth.id\n)",
				"viewRule": "(\n  // owner\n  @request.auth.id = owner\n)\n||\n(\n  // user has role in server\n  @request.auth.serverRoleAssignments_via_user.role.server ?= id\n)\n// TODO add rule about invites"
			},
			{
				"createRule": null,
				"deleteRule": null,
				"fields": [
					{
						"autogeneratePattern": "",
						"hidden": false,
						"id": "text3208210256",
						"max": 0,
						"min": 0,
						"name": "id",
						"pattern": "^[a-z0-9]+$",
						"presentable": false,
						"primaryKey": true,
						"required": true,
						"system": true,
						"type": "text"
					},
					{
						"cascadeDelete": true,
						"collectionId": "pbc_3009067695",
						"hidden": false,
						"id": "_clone_zjHU",
						"maxSelect": 1,
						"minSelect": 0,
						"name": "channelID",
						"presentable": false,
						"required": true,
						"system": false,
						"type": "relation"
					},
					{
						"hidden": false,
						"id": "json1834033734",
						"maxSize": 1,
						"name": "roleIDs",
						"presentable": false,
						"required": false,
						"system": false,
						"type": "json"
					}
				],
				"id": "pbc_1453476981",
				"indexes": [],
				"listRule": "(\n  @request.auth.userRolesByServer_via_userID.roleIDs ?= roleIDs\n)",
				"name": "channelReadOnlyRoles",
				"system": false,
				"type": "view",
				"updateRule": null,
				"viewQuery": "SELECT\n  (ROW_NUMBER() OVER()) as id,\n  channel AS channelID,\n  GROUP_CONCAT(DISTINCT role) AS roleIDs\nFROM\n  channelRoleAssignments\nWHERE\n  readonly IS true\nGROUP BY\n  channel;",
				"viewRule": "(\n  @request.auth.userRolesByServer_via_userID.roleIDs ?= roleIDs\n)"
			},
			{
				"createRule": null,
				"deleteRule": null,
				"fields": [
					{
						"autogeneratePattern": "",
						"hidden": false,
						"id": "text3208210256",
						"max": 0,
						"min": 0,
						"name": "id",
						"pattern": "^[a-z0-9]+$",
						"presentable": false,
						"primaryKey": true,
						"required": true,
						"system": true,
						"type": "text"
					},
					{
						"cascadeDelete": false,
						"collectionId": "_pb_users_auth_",
						"hidden": false,
						"id": "_clone_fGi6",
						"maxSelect": 1,
						"minSelect": 0,
						"name": "user",
						"presentable": false,
						"required": true,
						"system": false,
						"type": "relation"
					},
					{
						"hidden": false,
						"id": "number2461887133",
						"max": null,
						"min": null,
						"name": "serverCount",
						"onlyInt": false,
						"presentable": false,
						"required": false,
						"system": false,
						"type": "number"
					}
				],
				"id": "pbc_1963852619",
				"indexes": [],
				"listRule": "(\n  // requesting own record\n  @request.auth.id = user\n)",
				"name": "serverCounts",
				"system": false,
				"type": "view",
				"updateRule": null,
				"viewQuery": "SELECT\n  (ROW_NUMBER() OVER()) as id,\n  owner AS user,\n  COUNT(id) AS serverCount\nFROM \n  servers\nGROUP BY\n  owner",
				"viewRule": "(\n  // requesting own record\n  @request.auth.id = user\n)"
			},
			{
				"createRule": null,
				"deleteRule": null,
				"fields": [
					{
						"autogeneratePattern": "",
						"hidden": false,
						"id": "text3208210256",
						"max": 0,
						"min": 0,
						"name": "id",
						"pattern": "^[a-z0-9]+$",
						"presentable": false,
						"primaryKey": true,
						"required": true,
						"system": true,
						"type": "text"
					},
					{
						"hidden": false,
						"id": "json344172009",
						"maxSize": 1,
						"name": "users",
						"presentable": false,
						"required": false,
						"system": false,
						"type": "json"
					}
				],
				"id": "pbc_145117425",
				"indexes": [],
				"listRule": "@request.auth.id = id",
				"name": "dmListFrom",
				"system": false,
				"type": "view",
				"updateRule": null,
				"viewQuery": "SELECT\n  \"from\" as id,\n  GROUP_CONCAT(DISTINCT \"to\") AS users\nFROM\n  messages\nGROUP BY\n  \"from\";",
				"viewRule": "@request.auth.id = id"
			},
			{
				"createRule": null,
				"deleteRule": null,
				"fields": [
					{
						"autogeneratePattern": "",
						"hidden": false,
						"id": "text3208210256",
						"max": 0,
						"min": 0,
						"name": "id",
						"pattern": "^[a-z0-9]+$",
						"presentable": false,
						"primaryKey": true,
						"required": true,
						"system": true,
						"type": "text"
					},
					{
						"hidden": false,
						"id": "json344172009",
						"maxSize": 1,
						"name": "users",
						"presentable": false,
						"required": false,
						"system": false,
						"type": "json"
					}
				],
				"id": "pbc_1139236038",
				"indexes": [],
				"listRule": "@request.auth.id = id",
				"name": "dmListTo",
				"system": false,
				"type": "view",
				"updateRule": null,
				"viewQuery": "SELECT\n  \"to\" as id,\n  GROUP_CONCAT(DISTINCT \"from\") AS users\nFROM\n  messages\nGROUP BY\n  \"to\";",
				"viewRule": "@request.auth.id = id"
			},
			{
				"createRule": null,
				"deleteRule": null,
				"fields": [
					{
						"autogeneratePattern": "[a-z0-9]{15}",
						"hidden": false,
						"id": "text3208210256",
						"max": 15,
						"min": 15,
						"name": "id",
						"pattern": "^[a-z0-9]+$",
						"presentable": false,
						"primaryKey": true,
						"required": true,
						"system": true,
						"type": "text"
					},
					{
						"cascadeDelete": true,
						"collectionId": "_pb_users_auth_",
						"hidden": false,
						"id": "relation2375276105",
						"maxSelect": 1,
						"minSelect": 0,
						"name": "user",
						"presentable": false,
						"required": true,
						"system": false,
						"type": "relation"
					},
					{
						"cascadeDelete": true,
						"collectionId": "pbc_3009067695",
						"hidden": false,
						"id": "relation2734263879",
						"maxSelect": 1,
						"minSelect": 0,
						"name": "channel",
						"presentable": false,
						"required": true,
						"system": false,
						"type": "relation"
					},
					{
						"hidden": false,
						"id": "autodate2990389176",
						"name": "created",
						"onCreate": true,
						"onUpdate": false,
						"presentable": false,
						"system": false,
						"type": "autodate"
					},
					{
						"hidden": false,
						"id": "autodate3332085495",
						"name": "updated",
						"onCreate": true,
						"onUpdate": true,
						"presentable": false,
						"system": false,
						"type": "autodate"
					}
				],
				"id": "pbc_3853092444",
				"indexes": [
					"CREATE UNIQUE INDEX ` + "`" + `idx_WvENqfsRHU` + "`" + ` ON ` + "`" + `voiceParticipants` + "`" + ` (\n  ` + "`" + `user` + "`" + `,\n  ` + "`" + `channel` + "`" + `\n)"
				],
				"listRule": "(\n  // is owner\n  @request.auth.id = channel.server.owner\n)\n||\n(\n  // member of server\n  @request.auth.serverRoleAssignments_via_user.role.server = channel.server &&\n  // has role for channel\n  @request.auth.serverRoleAssignments_via_user.role ?= \n  channel.channelRoleAssignments_via_channel.role\n)",
				"name": "voiceParticipants",
				"system": false,
				"type": "base",
				"updateRule": null,
				"viewRule": "(\n  // is owner\n  @request.auth.id = channel.server.owner\n)\n||\n(\n  // member of server\n  @request.auth.serverRoleAssignments_via_user.role.server = channel.server &&\n  // has role for channel\n  @request.auth.serverRoleAssignments_via_user.role ?= \n  channel.channelRoleAssignments_via_channel.role\n)"
			},
			{
				"createRule": "@request.auth.id = user",
				"deleteRule": "@request.auth.id = user",
				"fields": [
					{
						"autogeneratePattern": "[a-z0-9]{15}",
						"hidden": false,
						"id": "text3208210256",
						"max": 15,
						"min": 15,
						"name": "id",
						"pattern": "^[a-z0-9]+$",
						"presentable": false,
						"primaryKey": true,
						"required": true,
						"system": true,
						"type": "text"
					},
					{
						"cascadeDelete": true,
						"collectionId": "_pb_users_auth_",
						"hidden": false,
						"id": "relation2375276105",
						"maxSelect": 1,
						"minSelect": 0,
						"name": "user",
						"presentable": false,
						"required": true,
						"system": false,
						"type": "relation"
					},
					{
						"cascadeDelete": false,
						"collectionId": "pbc_3929545014",
						"hidden": false,
						"id": "relation1517147638",
						"maxSelect": 1,
						"minSelect": 0,
						"name": "server",
						"presentable": false,
						"required": true,
						"system": false,
						"type": "relation"
					},
					{
						"hidden": false,
						"id": "autodate2990389176",
						"name": "created",
						"onCreate": true,
						"onUpdate": false,
						"presentable": false,
						"system": false,
						"type": "autodate"
					},
					{
						"hidden": false,
						"id": "autodate3332085495",
						"name": "updated",
						"onCreate": true,
						"onUpdate": true,
						"presentable": false,
						"system": false,
						"type": "autodate"
					}
				],
				"id": "pbc_2077073836",
				"indexes": [
					"CREATE UNIQUE INDEX ` + "`" + `idx_aiuDX2XbSk` + "`" + ` ON ` + "`" + `pinnedServers` + "`" + ` (\n  ` + "`" + `server` + "`" + `,\n  ` + "`" + `user` + "`" + `\n)"
				],
				"listRule": "@request.auth.id = user",
				"name": "pinnedServers",
				"system": false,
				"type": "base",
				"updateRule": null,
				"viewRule": "@request.auth.id = user"
			},
			{
				"createRule": "@request.auth.id = user",
				"deleteRule": "@request.auth.id = user",
				"fields": [
					{
						"autogeneratePattern": "[a-z0-9]{15}",
						"hidden": false,
						"id": "text3208210256",
						"max": 15,
						"min": 15,
						"name": "id",
						"pattern": "^[a-z0-9]+$",
						"presentable": false,
						"primaryKey": true,
						"required": true,
						"system": true,
						"type": "text"
					},
					{
						"cascadeDelete": true,
						"collectionId": "_pb_users_auth_",
						"hidden": false,
						"id": "relation2375276105",
						"maxSelect": 1,
						"minSelect": 0,
						"name": "user",
						"presentable": false,
						"required": true,
						"system": false,
						"type": "relation"
					},
					{
						"cascadeDelete": true,
						"collectionId": "_pb_users_auth_",
						"hidden": false,
						"id": "relation1745156937",
						"maxSelect": 1,
						"minSelect": 0,
						"name": "recipient",
						"presentable": false,
						"required": true,
						"system": false,
						"type": "relation"
					},
					{
						"hidden": false,
						"id": "autodate2990389176",
						"name": "created",
						"onCreate": true,
						"onUpdate": false,
						"presentable": false,
						"system": false,
						"type": "autodate"
					},
					{
						"hidden": false,
						"id": "autodate3332085495",
						"name": "updated",
						"onCreate": true,
						"onUpdate": true,
						"presentable": false,
						"system": false,
						"type": "autodate"
					}
				],
				"id": "pbc_1250721626",
				"indexes": [
					"CREATE UNIQUE INDEX ` + "`" + `idx_d8cDpAg7Ey` + "`" + ` ON ` + "`" + `pinnedDMs` + "`" + ` (\n  ` + "`" + `user` + "`" + `,\n  ` + "`" + `recipient` + "`" + `\n)"
				],
				"listRule": "@request.auth.id = user",
				"name": "pinnedDMs",
				"system": false,
				"type": "base",
				"updateRule": null,
				"viewRule": "@request.auth.id = user"
			}
		]`

		return app.ImportCollectionsByMarshaledJSON([]byte(jsonData), false)
	}, func(app core.App) error {
		return nil
	})
}
